package kr.co.itwillbs.solex.workOrder;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class WorkOrderService {
	
	@Autowired
	WorkOrderMapper mapper;

	// 작업지시 조회
	public List<Map<String, Object>> getWorkList(int offset, int size) {
		return mapper.getWorkList(offset, size);
	}

	public List<Map<String, Object>> getProcessTeam(String prdCd) {
		return mapper.ProcessTeam(prdCd);
	}
	
	
}
