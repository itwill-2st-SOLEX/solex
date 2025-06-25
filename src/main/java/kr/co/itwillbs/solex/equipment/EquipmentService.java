package kr.co.itwillbs.solex.equipment;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class EquipmentService {

    @Autowired
    private EquipmentMapper equipmentMapper;
	
	public List<Map<String, Object>> getPagedGridDataAsMap(int page, int pageSize) {
		int offset = page * pageSize;
        List<Map<String, Object>> resultList = equipmentMapper.selectPagedEquipmentDataAsMap(offset, pageSize);
		return resultList;
	}

	public Map<String, Object> getFormData() {
        List<Map<String, Object>> processList = equipmentMapper.getProcessList();
        List<Map<String, Object>> clientList = equipmentMapper.getClientList();
		
        Map<String, Object> formData = new HashMap<>();
        formData.put("processList", processList);
        formData.put("clientList", clientList);
		return formData;
	}

    // 설비 생성
    @Transactional(rollbackFor = Exception.class) 
	public void createEquipment(Map<String, Object> params) {
        
        // 설비 생성    
        Integer result = equipmentMapper.createEquipment(params);
        // null 체크 추가
        if (result == null || result <= 0) {
            throw new RuntimeException("설비 생성에 실패했습니다.");
        }
		
	}


    public List<Map<String, Object>> getEquipmentDetail(String eqp_code) {
        List<Map<String,Object>> resultList = equipmentMapper.getEquipmentDetail(eqp_code);
        return resultList;
    }


	// public List<Map<String, Object>> getOrderDetail(String odd_id) {
	// 	List<Map<String, Object>> resultList = orderRequestsMapper.getOrderDetail(odd_id);
	// 	return resultList;
	// }
	
	// // 1.재고 조회, 2.재고 차감, 3.상태 변경
	// @Transactional(rollbackFor = Exception.class) 
	// public void  updateOrderStatus(Map<String, Object> params) throws Exception {

	// 	 // 재고 조회
    //     List<String> stockStatus = orderRequestsMapper.checkStock(params);
        
    //     // Stream API를 사용한 간결한 확인
    //     if (stockStatus.stream().anyMatch(status -> "부족".equals(status))) {
    //         // 오류 발생 시, 문자열 대신 예외를 던집니다.
    //         throw new RuntimeException("재고가 부족하여 처리할 수 없습니다.");
    //     }

    //     // 재고 차감    
    //     Integer result = orderRequestsMapper.updateStock(params);
    //     // null 체크 추가
    //     if (result == null || result <= 0) {
    //         throw new RuntimeException("재고 차감에 실패했습니다.");
    //     }
        
    //     // 주문 상태 변경
    //     Integer result2 = orderRequestsMapper.updateOrderStatus(params);
    //     // null 체크 추가
    //     if (result2 == null || result2 <= 0) {
    //         throw new RuntimeException("주문 상태 변경에 실패했습니다.");
    //     }

	// }   

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