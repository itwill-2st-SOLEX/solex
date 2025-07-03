package kr.co.itwillbs.solex.shipments;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ShipmentsService {

    @Autowired
    private ShipmentsMapper shipmentsMapper;
	
	public List<Map<String, Object>> getPagedGridDataAsMap(int page, int pageSize) {
		int offset = page * pageSize;
        List<Map<String, Object>> resultList = shipmentsMapper.selectPagedOrderDataAsMap(offset, pageSize);
		return resultList;
	}

	public List<Map<String, Object>> getOrderDetail(String odd_id) {
		List<Map<String, Object>> resultList = shipmentsMapper.getOrderDetail(odd_id);
		return resultList;
	}
    
    @Transactional(rollbackFor = Exception.class) 
    public void createOrderRequest(Map<String, Object> params) throws Exception {
        
        // 주문 생성
        shipmentsMapper.createOrderRequest(params);
        Long orderId = ((BigDecimal) params.get("ord_id")).longValue();
        // null 체크 추가
        if (orderId == null || orderId <= 0) {
            throw new RuntimeException("주문 생성에 실패했습니다.");
        }

        List<Map<String, Object>> items = (List<Map<String, Object>>) params.get("items");
    
        // 2. 각 item에 ord_id와 기본 상태만 추가 (opt_id 조회 로직 전체 삭제)
        for (Map<String, Object> item : items) {
            item.put("ord_id", orderId);
            item.put("odd_sts", "odd_sts_05");
        }

        // 주문 상태 변경
        Integer result2 = shipmentsMapper.createSujuOrderDetail(items);
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