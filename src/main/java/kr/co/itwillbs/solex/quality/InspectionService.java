package kr.co.itwillbs.solex.quality;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

import kr.co.itwillbs.solex.orderrequest.OrderRequestsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class InspectionService {

    private final OrderRequestsService orderRequestsService;
	
	@Autowired
	InspectionMapper inspectionMapper;

    InspectionService(OrderRequestsService orderRequestsService) {
        this.orderRequestsService = orderRequestsService;
    }
	
	//로그인한 사람에 해당하는 공정 정보 가져오기
	public Map<String, Object> getManagerSummary(Long empId) {
		return inspectionMapper.getManagerSummary(empId);
	}
	
	public int getManagerCount(Long empId) {
		return inspectionMapper.getManagerCount(empId);
	}
	
	//작업 현황 모두 가져오기
	public List<Map<String, Object>> getManagerList(Map params){
		return inspectionMapper.getManagerList(params);
	}
	
	//사원이 실적 등록할 때 마다 작업수량 업데이트
	public int updateJcount(Long wpoId) {
		return inspectionMapper.updateJcount(wpoId);
	}
	
	// 작업별 사원 생산량 리스트
	public List<Map<String, Object>> selectWorkerList(Map map){
		return inspectionMapper.selectWorkerList(map);
	}

	// 사원의 생산수량 변경하기
	@Transactional
	public int updateWorkerCount(Map map) {
		
		Long wpoId = ((Number) map.get("wpoId")).longValue();

	    int rowCnt = inspectionMapper.updateWorkerCount(map); // ① 수정 행 수
	    
	    if (rowCnt == 1) {                                 // ② 성공했을 때만 합계 재계산
	        int a = inspectionMapper.updateJcount(wpoId);
	        System.out.println("updateJcount rows    = " + a);          // ★2
	    }
	    
	    return rowCnt;
		
	}
	
	// 작업 상태 업데이트 
	@Transactional
	public void updateWpoSts(Map<String, Object> map) {
		
		//String wrkId = (String) map.get("wrkId");
		String wpoStatus = (String) map.get("wpoStatus");
		Long wpoId = Long.parseLong((String) map.get("wpoId"));
		
		switch (wpoStatus) {
			case "wpo_sts_02":
			// 상태 : wpo_sts_01 -> 02 
				// 	>> 작업대기 -> '작업시작' 상태로 변경 
				// 		상태코드 변경, 작업시작일 저장
				map.put("wpoStartDate", LocalDateTime.now());
				
				inspectionMapper.updateWpoSts02(map);
				break;
				
			case "wpo_sts_03":
			// 상태 : wpo_sts_02 >> wpo_sts_03
				// 		입력값 조회하여 끝났는지 확인하기 위해 select	
				//		WorkerService에서 처리하므로 할 거 없음
				break;
				
			case "wpo_sts_04":
			// 상태 : wpo_sts_03 -> wpo_sts_04 --> 
				//>> 공정완료 -> 품질검사중으로 변경
				inspectionMapper.updateWpoSts04(map);
								
				Map quaMap = inspectionMapper.selectWpoSts04(wpoId);
				
				//map.put("wpoId", quaMap.get("WPO_ID"));
				map.put("quaId", quaMap.get("QUA_ID"));
				map.put("qhiStartDate", LocalDateTime.now());
				map.put("qhiEmpId", map.get("empId"));
					
				//>> 품질 이력 테이블에 추가
				inspectionMapper.insertWpoSts04(map);
				
				
				break;
				
			case "wpo_sts_05":
			// 상태 : wpo_sts_04 -> wpo_sts_05 -->
				
				//>> 품질이력 테이블 업데이트 하기위해 품질이력id 가져오기
				Map qhiMap = inspectionMapper.selectWpoSts05(wpoId);
				
				map.put("qhiEndDate", LocalDateTime.now());
				map.put("qhiId", qhiMap.get("QHI_ID"));

				// >>품질이력 테이블 업데이트
				inspectionMapper.updateWpoSts05_qh(map);				
				
				// >> 불량개수, 상태 업데이트
				inspectionMapper.updateWpoSts05_wp(map);
				

				break;
			
			case "wpo_sts_09":
			// 상태 : wpo_sts_05 -> wpo_sts_09 -->
				map.put("wpoEndDate", LocalDateTime.now());
				
				System.out.println("9 : " + map);
				//>> 현재 공정 완료처리하기
				inspectionMapper.updateWpoSts09_curr(map);
				
				//>> 다음 공정 상태값 변경하기
				
				//>> 현재 공정 정보와 다음에 수행해야할 공정의 정보 찾아오기
				Map stepInfo = inspectionMapper.selectStepInfo(wpoId);
				
				//다음 공정 정보 업데이트할 정보 전달
				int jcount = ((Number) stepInfo.get("WPO_JCOUNT")).intValue();
				int bcount = ((Number) stepInfo.get("BCOUNT")).intValue();
				
				stepInfo.put("wpoOcount", jcount-bcount);	//이전 공정 작업개수-불량개수

				
				//다음 공정이 존재하면
				if (stepInfo.get("NEXT_WPO_ID") != null ) {

					int nextWpoId = ((Number) stepInfo.get("NEXT_WPO_ID")).intValue();
					
					stepInfo.put("wpoNewStatus", "wpo_sts_01");		//상태값 공정대기
					stepInfo.put("wpoStartDate", LocalDateTime.now());	//공정시작일
					stepInfo.put("wpoOcount", jcount-bcount);	//이전 공정 작업개수-불량개수
					stepInfo.put("wpoId", nextWpoId);	//다음 공정id	

					inspectionMapper.updateNextStep(stepInfo);
					
				} else {
					
					//마지막 공정이면
					//수주 테이블에 업데이트				
					stepInfo.put("wpoId", stepInfo.get("WPO_ID"));
					stepInfo.put("oddModDate", LocalDateTime.now());	//변경일
					
					//수주 디테일에 작업완료로 상태 변경, 불량개수/생산량 업데이트
					inspectionMapper.updateSujuDetail(stepInfo);	
					
					//수주 히스토리에 작업 완료 처리
					inspectionMapper.insertSujuHistory(stepInfo);
					System.out.println("끝!");
				}
		
		}
		
	}
}




