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
		// 수주 상세 등록
		
		// 이후 수주 요청 관리에서  밑에 있는 내용들이 실행됨
		
		// 수주 등록 승인 / 반려로 갈림.
		
		// 1. 승인시
		// 기존 재고에서 제품을 줄껀지 정보를 받아야됨.
		// 재고에서 완제품을 뺴고 충분한가?
		// 1-1. 충분한 경우 -> 바로 출고 or 출고대기
		// 1-2. 완제품을 주는데 부족한 경우 -> 주문온 수량을 생산하기 위해 제품에 들어가는 원재자들이 충분한가?
		// 1-2-1. 원자재들이 생산하기전 시점에서 충분하면 -> 발주 없음(현상태 수주 등록) -> 생산대기(상태변경);
		// 1-2-2. 원자재들이 부족한 경우 -> 발주해야됨(현상태 수주 등록) -> 주문이 들어온 수량을 확인을 하여
		//        완제품을 생산하는데 필요한 수량을 추가적인 원자재 발주(상태 : 자재요청) -> 원자재 들어옴 ->
		//        갯수를 카운팅 하여 자재들이 도착하면 -> 입고 검사 끝나면 -> 재고갯수 업데이트 -> 생산대기로 (상태 변경)
		// 주문 수량 > 재고 수량
		// int orderCount = Integer.parseInt(orderData.get("odd_cnt").toString());
		// int stockCount = Integer.parseInt(orderData.get("stk_cn").toString());
		// if (orderCount > stockCount) {
		// 	orderData.put("ord_sts", "ord_sts_01"); // 상태값을 '01'로 설정 자재 요청
			
		// } else {
		// 	orderData.put("ord_sts", "ord_sts_02"); // 상태값을 '02'로 설정 생산 대기
		// }

		// ★★★ 핵심: 부족한 자재에 대한 발주 요청을 추가로 INSERT ★★★
		// List<Map<String, Object>> lackingMaterials = orderMapper.getLackingMaterials(orderData);
		// for (Map<String, Object> material : lackingMaterials) {
		// 	orderMapper.createPurchaseRequest(material);
		// }

		// 2. 반려시
		//   기존 수주 테이블, 수주 상세 테이블에서 승인 반려 컬럼을 추가로 생성을 하여 YN으로 관리함,
		//   수주 요청메뉴에서는 보이지 않음.
		//   주문 등록 페이지에서는 반려인 상태로 보임
	    
		// 업데이트 수주 디테일
	    
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
