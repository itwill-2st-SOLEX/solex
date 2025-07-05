package kr.co.itwillbs.solex.sales;

import java.math.BigDecimal;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

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
                    System.err.println("날짜 문자열 파싱 오류: " + dateObj);
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


}
