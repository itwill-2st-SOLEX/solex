package kr.co.itwillbs.solex.operator;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import kr.co.itwillbs.solex.sales.OrderController;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class WorkerService {

	@Autowired
	WorkerMapper workerMapper;
	
	@Autowired
	ManagerMapper managerMapper;


	public Map<String, Object> getWorkerSummary(Long empId) {
		return workerMapper.getWorkerSummary(empId);
	}
	
	
	public Map<String, Object> getWorkerInfo(Long empId) {
		return workerMapper.getWorkerInfo(empId);
	}
	
	@Transactional
	public void insertWorkCount(Map map) {
	    System.out.println(map);

		Long wpoId = ((Number) map.get("wpoId")).longValue();
		
		//사원의 보고일자 저장
		map.put("wreDate", LocalDateTime.now());
		
		//사원 실적 입력하기
		workerMapper.insertWorkCount(map);
		
		//입력된 사원의 실적으로 관리자 페이지의 총 작업수량 업데이트
		managerMapper.updateJcount(wpoId);
		
		// 4. 작업수량이 지시수량을 넘으면 상태를 wpo_sts_03(공정완료)로 자동 변경
	    Map<String, Object> summary = managerMapper.selectWpoSts03(wpoId);

	    int order = ((BigDecimal) summary.get("WPO_OCOUNT")).intValue();
	    int job = ((BigDecimal) summary.get("WPO_JCOUNT")).intValue();
	    
	    if (job >= order) {
	    	Map<String, Object> statusMap = new HashMap<>();
	        statusMap.put("wpoId", wpoId);
	        statusMap.put("wpoStatus", "wpo_sts_03");
	        statusMap.put("wpoEndDate", LocalDateTime.now());
	        managerMapper.updateWpoSts03(statusMap);  // 공정 완료 처리
	    }
	}
	
	public List<Map<String, Object>> getWorkerList(Map map) {
		return workerMapper.getWorkerList(map);
	}
	
	public int updateWorkerMemo(Map map) {
		return workerMapper.updateWorkerMemo(map);
	}
}




