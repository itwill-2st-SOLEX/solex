package kr.co.itwillbs.solex.operator;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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
	@Transactional
	public void updateWpoSts(Map<String, Object> map) {
		
		//String wrkId = (String) map.get("wrkId");
		String wpoStatus = (String) map.get("wpoStatus");
		Long wrkId = Long.parseLong((String) map.get("wrkId"));
		
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
								
				Map quaMap = managerMapper.selectWpoSts04(wrkId);
				
				map.put("wpoId", quaMap.get("WPO_ID"));
				map.put("quaId", quaMap.get("QUA_ID"));
				map.put("qhiStartDate", LocalDateTime.now());
				map.put("qhiEmpId", map.get("empId"));
					
					//>> 품질 이력 테이블에 추가
				managerMapper.insertWpoSts04(map);
				
				
				break;
				
			case "wpo_sts_05":
				// 상태 : wpo_sts_04 -> wpo_sts_05 -->
				
					//>> 품질이력 테이블 업데이트 하기위해 품질이력id 가져오기
				Map qhiMap = managerMapper.selectWpoSts05(wrkId);
				
				map.put("qhiEndDate", LocalDateTime.now());
				map.put("qhiId", qhiMap.get("QHI_ID"));
				
				//int wpoBcount = Integer.parseInt((String) map.get("wpoBcount"));
				
				//map.put("wpoBcount", wpoBcount);
				
				System.out.println("050500550 : " + map);
				
					// >>품질이력 테이블 업데이트
				managerMapper.updateWpoSts05_qh(map);				
				
					// >> 불량개수, 상태 업데이트
				managerMapper.updateWpoSts05_wp(map);
				

				break;
			
		
		}
		
	}
}




