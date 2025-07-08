package kr.co.itwillbs.solex.sales;

import java.math.BigDecimal;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;




@Service
public class OrderService {

    @Autowired
    private OrderMapper orderMapper;

    // 페이징된 그리드 데이터를 Map 형태로 가져오는 메서드
    public List<Map<String, Object>> getPagedGridDataAsMap(int page, int pageSize, String searchKeyword) { // 파라미터 변경
        int offset = page * pageSize;
        List<Map<String, Object>> resultList = orderMapper.selectPagedOrderDataAsMap(offset, pageSize, searchKeyword);
        // Map의 각 항목을 순회하며 날짜 필드 포맷팅
        // 메서드 내에서 생성
        SimpleDateFormat dateFormatter = new SimpleDateFormat("yyyy-MM-dd"); 

        for (Map<String, Object> row : resultList) {
            Object dateObj = row.get("ORD_REG_DATE");
            if (dateObj instanceof Date) { 
                row.put("ORD_REG_DATE", dateFormatter.format((Date) dateObj));
            } else if (dateObj instanceof String) { 
                try {
                } catch (Exception e) {
                }
            }
        }
        return resultList;
    }

    
	public List<Map<String, Object>> getSearchClientList(int page, int pageSize, String searchKeyword,int emp_id) {
		int offset = page * pageSize;
		
		int count = orderMapper.countClientsByEmployeeId(emp_id);
		
		// 1) 검색어가 없는 경우
        if (searchKeyword == null) {
            if (count < 1) {
                return orderMapper.getSelectTop5PopularClients();
            } else {
                // 예: 검색어가 없고 + 사원이 거래처 등록을 한번이라도 한 경우
                return orderMapper.getSelectClientsByEmployeeId(emp_id);
            }
        }

        // 2) 검색어가 있는 경우
        return orderMapper.getSearchClientList(offset, pageSize, searchKeyword);
	}

	public List<Map<String, Object>> getSearchProductList( String searchKeyword) {

		
		
		if(searchKeyword == null) {
			return orderMapper.getSelectTop5PopularProducts();
		}
		
		
		return orderMapper.getSearchProductList(searchKeyword);
	}

	
	public List<Map<String, Object>> getOptionsByProduct(String prd_id) {
		return orderMapper.getOptionsByProduct(prd_id);
	}
	
	

	
	@Transactional
    public int createOrderProcess(Map<String, Object> orderData) {
        // 1. 주문 테이블 INSERT (기존과 동일)
        orderMapper.createSujuOrder(orderData);
        Long orderId = ((BigDecimal) orderData.get("ord_id")).longValue();

        List<Map<String, Object>> items = (List<Map<String, Object>>) orderData.get("items");

        // 2. 각 item에 ord_id와 기본 상태만 추가 (opt_id 조회 로직 전체 삭제)
        for (Map<String, Object> item : items) {
            item.put("ord_id", orderId);
            item.put("odd_sts", "odd_sts_00");
        }

        // 3. 단순화된 items 리스트를 Mapper로 전달
        // 이제 XML이 모든 것을 처리합니다.
        return orderMapper.createSujuOrderDetail(items);		
	}


	@Transactional(readOnly = true)
	public Map<String, Object> getOrderDetail(int ord_id) {
		// 1. 주문 기본 정보 조회 (첫 번째 DB 호출)
        Map<String, Object> orderInfo = orderMapper.selectOrderInfoById(ord_id);
        if (orderInfo == null) {
            throw new RuntimeException("ID가 " + ord_id + "인 주문을 찾을 수 없습니다.");
        }

        // 2. 주문 상세 항목 목록 조회 (두 번째 DB 호출)
        List<Map<String, Object>> orderItems = orderMapper.selectOrderItemsByOrderId(ord_id);
        // null 이면 예외 처리
        if(orderInfo.get("PRODUCT_ID") == null) {
            throw new RuntimeException("상세 주문 항목이 없습니다. ID: " + ord_id);
        }
        // 3. 선택 가능한 전체 옵션 목록 조회 (세 번째 DB 호출)
        //    - 1번에서 조회한 상품 ID(PRODUCT_ID)를 파라미터로 사용합니다.
        //    - DB에서 대문자로 반환될 수 있으므로 대문자 키로 조회합니다.
        Object prd_id = orderInfo.get("PRODUCT_ID"); 
        List<Map<String, Object>> availableOptions = orderMapper.selectAllOptionsByProductId(prd_id);

        // 4. 모든 결과를 하나의 최종 Map에 담아서 반환
        Map<String, Object> finalResult = new HashMap<>();
        finalResult.put("orderInfo", orderInfo);
        finalResult.put("orderItems", orderItems);
        finalResult.put("availableOptions", availableOptions);

        return finalResult;
	}

    @Transactional // 하나의 트랜잭션으로 묶어 원자성 보장
    public Map<String, List<Long>> processBulkOrderDeletion(List<Long> oddIdsToProcess) {
        List<Long> deletedIds = new ArrayList<>();
        List<Long> skippedIds = new ArrayList<>();

       // 1. 데이터베이스에서 모든 요청 odd_id에 대한 최신 상태를 한 번에 조회 (Map 형태로)
        // OrderMapper 인터페이스에 List<Map<String, Object>> findOrdersByIds(List<Long> oddIds);
        // 이런 메소드가 있다고 가정합니다. (XML 매퍼의 resultType="map"으로 조회)
        List<Map<String, Object>> ordersData = orderMapper.findOrdersByIds(oddIdsToProcess);

        // Map<oddId, OrderDataMap> 형태로 변환하여 빠른 조회를 위함
        Map<Long, Map<String, Object>> orderMap = ordersData.stream()
            .collect(Collectors.toMap(
                orderData -> ((Number) orderData.get("ODD_ID")).longValue(), // DB 컬럼명이 ODD_ID라고 가정
                Function.identity()
            ));

        for (Long oddId : oddIdsToProcess) {
            Map<String, Object> order = orderMap.get(oddId); // Map 형태로 조회된 데이터

            if (order == null) {
                // DB에 없는 ID는 건너뛰거나 오류 처리
                skippedIds.add(oddId);
                continue;
            }

            String oddSts00 = (String) order.get("ODD_STS");

            if (!"odd_sts_00".equals(oddSts00)) {
                skippedIds.add(oddId); // 삭제 불가능한 ID는 스킵 목록에 추가
                continue; // 다음 odd_id로 넘어감
            }


            // 4. 모든 검증을 통과했다면 실제 삭제 처리
            try {
                // DTO/엔티티를 사용하지 않으므로, deleteById를 호출하거나
                // Mybatis Mapper를 통해 직접 삭제 쿼리를 호출해야 합니다.
                // 예: orderMapper.deleteOrderById(oddId);
                orderMapper.deleteOrderById(oddId); // OrderMapper에 deleteOrderById(Long oddId) 메소드 있다고 가정
                deletedIds.add(oddId);
            } catch (Exception e) {
                skippedIds.add(oddId); // 삭제 중 DB 오류 발생 시 스킵 처리
            }
        }
        
        // 결과 반환
        Map<String, List<Long>> result = new HashMap<>();
        result.put("deletedIds", deletedIds);
        result.put("skippedIds", skippedIds);
        return result;
    }
    
    
    @Transactional // 하나의 트랜잭션으로 묶어 원자성 보장
    public int updateOrderProcess(Map<String, Object> orderPayload) {
    	String ordIdStr = (String) orderPayload.get("ord_id");
        int ordId = Integer.parseInt(ordIdStr); // <-- 이 부분을 수정했습니다.
        List<Map<String, Object>> items = (List<Map<String, Object>>) orderPayload.get("items");
    
        // 1. 주문 헤더 정보 업데이트 (ord_id 기준)
        // 이 부분은 기존 주문 헤더 테이블 (예: suju_order_header)을 업데이트하는 쿼리가 필요합니다.
        // 예: orderMapper.updateOrderHeader(orderPayload);
        int headerUpdateResult = orderMapper.updateOrderHeader(orderPayload);
        if (headerUpdateResult == 0) {
        }


        // 2. 기존 수주 디테일 항목 전체 삭제 (ord_id 기준)
        // 이전에 이 ord_id에 연결된 모든 odd_id 레코드들을 삭제합니다.
        orderMapper.deleteOrderDetailsByOrdId(ordId); // 이 메소드를 매퍼에 추가해야 함


         // 2. 각 item에 ord_id와 기본 상태만 추가 (opt_id 조회 로직 전체 삭제)
        for (Map<String, Object> item : items) {
            item.put("ord_id", ordId);
            item.put("odd_sts", "odd_sts_00");
        }
        
        // 최종적으로 업데이트된 행 수 (또는 성공 여부) 반환
        // 여기서는 간단히 1을 반환하여 성공을 나타내거나, affected rows 총합을 반환할 수 있습니다.
        return orderMapper.createSujuOrderDetail(items);
    }


}
