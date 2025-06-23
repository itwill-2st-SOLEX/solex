package kr.co.itwillbs.solex.operator;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class ManagerService {
	
	@Autowired
	ManagerMapper managerMapper;
	
	public Map<String, Object> getManagerSummary(Long empId) {
		return managerMapper.getManagerSummary(empId);
	}
	
	public int getManagerCount(Long empId) {
		return managerMapper.getManagerCount(empId);
	}
	
	
	public List<Map<String, Object>> getManagerList(Map params){
		return managerMapper.getManagerList(params);
	}
	
	public int updateJcount(Long wpoId) {
		return managerMapper.updateJcount(wpoId);
	}
	
	public void updateWpoSts(Map<String, Object> map) {
		
		//String wrkId = (String) map.get("wrkId");
		String wpoStatus = (String) map.get("wpoStatus");
		
		switch (wpoStatus) {
			case "wpo_sts_02":
				// 상태 : wpo_sts_01 대기 >> wpo_sts_02 작업중 -> 버튼 클릭으로 상태변경  -->
				// 상태코드 변경, 작업시작일 저장
				map.put("wpoStartDate", LocalDateTime.now());
				
				managerMapper.updateWpoSts02(map);
				break;
				
			case "wpo_sts_03":
				//(상태 : wpo_sts_02 작업중 >> wpo_sts_03 공정완료 -> 사원입력값 확인하여 생산 완료 확인 -->
				//WorkerService에서 처리하므로 할 거 없음
				break;
				
			case "wpo_sts_04":
				//(상태 : wpo_sts_03 공정완료 >> wpo_sts_04 품질검사중 -> 사원입력값 확인하여 생산 완료 확인 -->	
				managerMapper.updateWpoSts04(map);
				break;
				
			case "wpo_sts_05":
				//상태 : wpo_sts_05 >> 품질검사완료 -> 공정이관, 
				// 					  work_process의 작업종료일 변경, 다음공정의 작업상태를 01로 변경
				break;
			
		
		}
		
	}
}




