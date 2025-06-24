package kr.co.itwillbs.solex.operator;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class ManagerService {
	
	@Autowired
	ManagerMapper managerMapper;
	
	//로그인한 사람에 해당하는 공정 정보 가져오기
	public Map<String, Object> getManagerSummary(Long empId) {
		return managerMapper.getManagerSummary(empId);
	}
	
	public int getManagerCount(Long empId) {
		return managerMapper.getManagerCount(empId);
	}
	
	//작업 현황 모두 가져오기
	public List<Map<String, Object>> getManagerList(Map params){
		return managerMapper.getManagerList(params);
	}
	
	//사원이 실적 등록할 때 마다 작업수량 업데이트
	public int updateJcount(Long wpoId) {
		return managerMapper.updateJcount(wpoId);
	}
	
	// 작업 상태 업데이트 
	public void updateWpoSts(Map<String, Object> map) {
		
		//String wrkId = (String) map.get("wrkId");
		String wpoStatus = (String) map.get("wpoStatus");
		
		switch (wpoStatus) {
			case "wpo_sts_02":
				// 상태 : wpo_sts_01 -> 02 
				// 	>> 작업대기 -> '작업시작' 상태로 변경 
				// 		상태코드 변경, 작업시작일 저장
				map.put("wpoStartDate", LocalDateTime.now());
				
				managerMapper.updateWpoSts02(map);
				break;
				
			case "wpo_sts_03":
				// 상태 : wpo_sts_02 >> wpo_sts_03
				// 		입력값 조회하여 끝났는지 확인하기 위해 select	
				//		WorkerService에서 처리하므로 할 거 없음
				break;
				
			case "wpo_sts_04":
				// 상태 : wpo_sts_03 -> wpo_sts_04 --> 
					//>> 공정완료 -> 품질검사중으로 변경
				managerMapper.updateWpoSts04(map);
				
					//>> 품질 이력 테이블에 추가하기 위해 품질검사 id, 작업프로세스 id 검색해서 map에 추가
				System.out.println(map);

				int wrkId = Integer.parseInt((String) map.get("wrkId"));
				
				Map quaMap = managerMapper.selectWpoSts04(wrkId);
				
				map.put("wpoId", quaMap.get("WPO_ID"));
				map.put("quaId", quaMap.get("QUA_ID"));
				map.put("qhiStartDate", LocalDateTime.now());
				
					//>> 품질 이력 테이블에 추가
				managerMapper.insertWpoSts04(map);
				
				break;
				
			case "wpo_sts_05":
				//상태 : wpo_sts_05 >> 품질검사완료 -> 공정이관, 
				// 					  work_process의 작업종료일 변경, 다음공정의 작업상태를 01로 변경
				break;
			
		
		}
		
	}
}




