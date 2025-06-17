package kr.co.itwillbs.solex.orderrequest;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import lombok.extern.log4j.Log4j2;



@Log4j2
@Service
public class OrderRequestsService {

    @Autowired
    private OrderRequestsMapper orderRequestsMapper;
	
	public List<Map<String, Object>> getPagedGridDataAsMap(int page, int pageSize) {
		int offset = page * pageSize;
        List<Map<String, Object>> resultList = orderRequestsMapper.selectPagedOrderDataAsMap(offset, pageSize);
		return resultList;
	}

	public List<Map<String, Object>> getOrderDetail(int ord_id) {
		List<Map<String, Object>> resultList = orderRequestsMapper.selectOrderDetail(ord_id);
		return resultList;
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