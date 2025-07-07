package kr.co.itwillbs.solex.shipments;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import kr.co.itwillbs.solex.sales.OrderMapper;

@Service
public class ShipmentsService {

    @Autowired
    private ShipmentsMapper shipmentsMapper;

	
	public List<Map<String, Object>> getPagedGridDataAsMap(int page, int pageSize) {
		int offset = page * pageSize;
        List<Map<String, Object>> resultList = shipmentsMapper.selectPagedOrderDataAsMap(offset, pageSize);
		return resultList;
	}
	
	
	@Transactional(readOnly = true)
	public List<Map<String, Object>> getOrderDetail(int ord_id) {
		List<Map<String, Object>> orderData = shipmentsMapper.selectOrderDetailById(ord_id);
		return orderData;
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
        Integer result = shipmentsMapper.createSujuOrderDetail(items);
        // null 체크 추가
        if (result == null || result <= 0) {
            throw new RuntimeException("주문 상태 변경에 실패했습니다.");
        }
    }

    @Transactional(rollbackFor = Exception.class) 
    public void incrementOddSts(int odd_id) throws Exception {
        // 주문 상태 변경
        Integer result = shipmentsMapper.incrementOddSts(odd_id);
        // null 체크 추가
        if (result == null || result <= 0) {
            throw new RuntimeException("주문 승인에 실패했습니다.");
        }
    }

}


