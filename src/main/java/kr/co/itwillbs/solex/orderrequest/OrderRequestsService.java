package kr.co.itwillbs.solex.orderrequest;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class OrderRequestsService {

    @Autowired
    private OrderRequestsMapper orderRequestsMapper;
	
	public List<Map<String, Object>> getPagedGridDataAsMap(int page, int pageSize) {
		int offset = page * pageSize;
        List<Map<String, Object>> resultList = orderRequestsMapper.selectPagedOrderDataAsMap(offset, pageSize);
		return resultList;
	}

	public List<Map<String, Object>> getOrderDetail(String odd_id) {
		List<Map<String, Object>> resultList = orderRequestsMapper.getOrderDetail(odd_id);
		return resultList;
	}
	
	// 1.재고 조회, 2.재고 차감, 3.상태 변경
	@Transactional(rollbackFor = Exception.class) 
	public void  updateOrderStatus(Map<String, Object> params) throws Exception {

		 // 재고 조회
        List<String> stockStatus = orderRequestsMapper.checkStock(params);
        
        
        // Stream API를 사용한 간결한 확인
        if (stockStatus.stream().anyMatch(status -> "부족".equals(status))) {
            throw new RuntimeException("재고가 부족하여 처리할 수 없습니다.");
        }


         // ★★★ 핵심 수정사항 ★★★
        // 1. 재고 차감 프로시저 호출
        orderRequestsMapper.updateStock(params); // 리턴값을 받지 않음


        // 2. 파라미터로 넘겨줬던 Map에서 'result_code' 키로 결과를 꺼내 확인
        String resultCode = (String) params.get("result_code");

        // null 체크 추가
        // 3. 프로시저가 'SUCCESS'를 반환하지 않았다면 실패로 간주하고 예외 발생
        if (!"SUCCESS".equals(resultCode)) {
            throw new RuntimeException("재고 차감 프로시저 실행에 실패했습니다.");
        }
        
        // 주문 상태 변경
        Integer result2 = orderRequestsMapper.updateOrderStatus(params);
        // null 체크 추가
        if (result2 == null || result2 <= 0) {
            throw new RuntimeException("주문 상태 변경에 실패했습니다.");
        }

	} 

    public void orderMaterialRequest(Map<String, Object> params) throws Exception {
        

        // 자재 주문  
        Integer materialOrderStatus = orderRequestsMapper.insertMaterialOrder(params);
        
        
        
        // null 체크 추가
        if (materialOrderStatus == null || materialOrderStatus <= 0) {
            throw new RuntimeException("자재 주문에 실패했습니다.");
        }
        
        
        // 주문 상태 변경
        Integer result2 = orderRequestsMapper.updateMaterialOrderStatus(params);
        // null 체크 추가
        if (result2 == null || result2 <= 0) {
            throw new RuntimeException("주문 상태 변경에 실패했습니다.");
        }
    }

    public void checkMaterial(Map<String, Object> params) throws Exception {
        List<String> stockStatus = orderRequestsMapper.checkMaterial(params);
        
        // registration_status 이 결과안에 '등록안됨'이 있으면 예외 발생
        for(String registration_status : stockStatus) {
            if("등록안됨".equals(registration_status)) {
                throw new RuntimeException("재고가 등록되어 있지 않습니다.");
            }
        }
        
    }

    @Transactional(rollbackFor = Exception.class) 
    public void rejectOrder(Map<String, Object> params) throws Exception {
        // 주문상세id랑 주문id랑 조인해서 주문상세가 1건이면 주문상세를 삭제하고 주문을 삭제
        List<Map<String, Object>> result1 = orderRequestsMapper.checkOrderDetail(params);
        int count = Integer.parseInt(result1.get(0).get("COUNT").toString());
        params.put("ord_id", result1.get(0).get("ORD_ID"));

        Integer result = orderRequestsMapper.rejectOrderDetailDelete(params);
        // 1건이면 주문도 삭제
        if(count == 1) {
            Integer result2 = orderRequestsMapper.rejectOrderDelete(params);   
        }
        // 예외 발생
        if (result == null || result <= 0) {
            throw new RuntimeException("주문상세 삭제에 실패했습니다.");
        }
    }
}


