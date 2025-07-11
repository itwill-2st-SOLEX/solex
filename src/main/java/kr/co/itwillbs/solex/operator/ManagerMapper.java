package kr.co.itwillbs.solex.operator;

import java.util.List;
import java.util.Map;

import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface ManagerMapper {
	
	//로그인한 사람에 해당하는 공정 정보 가져오기
	Map<String, Object> getManagerSummary(Long empId);
	
	int getManagerCount(Long empId);
	
	//작업 현황 모두 가져오기
	List<Map<String, Object>> getManagerList(Map<String, Object> params);
	
	//사원이 실적 등록할 때 마다 작업수량 업데이트
	int updateJcount(Long wpoId);
	
	// 작업 상태 업데이트 
	// 상태 : wpo_sts_01 -> 02 
		// 	>> 작업대기 -> '작업시작' 상태로 변경 
	int updateWpoSts02(Map<String, Object> map);
	
	// 상태 : wpo_sts_02 >> wpo_sts_03
	// Worker에서 처리
		// 입력값 조회하여 끝났는지 확인하기 위해 select	
	Map<String, Object> selectWpoSts03(Long wpoId);
	
		// 생산량이 모두 완료되었으면 상태값 변경하기 위해 update
	int updateWpoSts03(Map<String, Object> map);
	
	
	// 상태 : wpo_sts_03 -> 04
		//>> 공정완료 -> 품질검사중으로 변경
	int updateWpoSts04(Map<String, Object> map);
	
		//>> 품질 이력 테이블에 추가하기 위해 품질검사 id, 작업프로세스 id 가져오기
	Map<String, Object> selectWpoSts04(Long wpoId);
	
		//>> 품질 이력 테이블에 추가
	int insertWpoSts04(Map<String, Object> map);
	
	
	// 상태 : wpo_sts_04 -> 05
		//>> 불량개수, 상태 업데이트
	int updateWpoSts05_wp(Map<String, Object> map);
	
		//>> 품질이력id 찾아오기
	Map<String, Object> selectWpoSts05(Long wpoId);
	
		//>> 품질검사이력 테이블에도 업데이트
	int updateWpoSts05_qh(Map map);
	
	
	// 상태 : wpo_sts_05 -> 09
		//>> 공정이관상태로 변경 
	int updateWpoSts09_curr(Map<String, Object> map);
	
		//>> 다음 공정 정보 찾아오기
	Map<String, Object> selectStepInfo(Long wpoId);
	
		//>> 다음 공정 데이터 업데이트하기
	int updateNextStep(Map map);
	
		//>> 마지막 공정에서 수주 디테일 테이블 업데이트
	int updateSujuDetail(Map map);
		
		//>> 수주 히스토리에 마지막 공정이 완료된 후 히스토리 추가
	int insertSujuHistory(Map amp);
	
	// 작업별 사원 생산량 리스트
	List<Map<String, Object>> selectWorkerList(Map map);

	// 사원 생산량 변경
	int updateWorkerCount(Map map);
	

}
