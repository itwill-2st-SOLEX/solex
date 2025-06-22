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
			case "wpo_sts_01":
				// 상태 : wpo_sts_01 >> 작업대기 -> '작업시작' 상태로 변경
				// 상태코드 변경, 작업시작일 저장
				map.put("wpoStartDate", LocalDateTime.now());
				map.put("wpoStatus", "wpo_sts_02");
				
				managerMapper.updateWpoSts01(map);
				break;
			
			case "wpo_sts_02":
				
				break;
				
			case "wpo_sts_03":
				//상태 : wpo_sts_03 >> 공정 완료 -> 품질검사이력 insert
				
				break;
				
			case "wpo_sts_04":
				//상태 : wpo_sts_04 >> 품질검사중 -> ??? 
				
				break;
				
			case "wpo_sts_05":
				//상태 : wpo_sts_05 >> 품질검사완료 -> 공정이관, 
				// 					  work_process의 작업종료일 변경, 다음공정의 작업상태를 01로 변경
				break;
			
		
		}
		
	}
}




