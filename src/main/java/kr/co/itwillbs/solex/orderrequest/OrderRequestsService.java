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

}



// 설비 정보, 공정 정보

// 두개의 테이블에 대한 매핑테이블

// 와이?!?!?!?!?!?!?!?!??!?
// 공정 하나의 여려개 가능
// 공정에 여러 설비가 들어가니깐.
// 

// 굿

// 설비 테이블 + 공정 테이블 = 매핑 테이블	
// 언제까지?