package kr.co.itwillbs.solex.workOrder;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import ch.qos.logback.core.net.SyslogOutputStream;

@Service
public class WorkOrderService {
	
	@Autowired
	WorkOrderMapper mapper;

	// 작업지시 조회
	public List<Map<String, Object>> getWorkList(int offset, int size) {
		return mapper.getWorkList(offset, size);
	}
	
	// 해당 제품코드 등록 모달 조회
	public List<Map<String, Object>> getProcessTeam(String prdCd) {
		return mapper.ProcessTeam(prdCd);
	}
	
	// 작업지시 등록
	@Transactional
	public void workOrderInsert(List<Map<String, Object>> prdInfo) {
		 for (Map<String, Object> item : prdInfo) {
	        mapper.workOrderInsert(item);
	        Integer wrkId = (Integer) item.get("wrk_id");
	        item.put("wrk_id", wrkId);
	        mapper.workProcessInsert(item);
	    }
		// 주문테이블 상태값 업테이트
		 String ordId = (String) prdInfo.get(0).get("ordId");
		mapper.updateSujuOrderSts(ordId);
	}
}
