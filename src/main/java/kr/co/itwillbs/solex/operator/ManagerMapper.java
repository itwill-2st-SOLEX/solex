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
	List<Map<String, Object>> getManagerList(Map params);
	
	int updateJcount(Long wpoId);
	
	//진행 상태 업데이트 
	//(상태 : wpo_sts_01 대기 >> wpo_sts_02 작업중 -> 버튼 클릭으로 상태변경  -->
	int updateWpoSts02(Map map);
	
	// (상태 : wpo_sts_02 작업중 >> wpo_sts_03 공정완료 -> 사원입력값 확인하여 생산 완료 확인 -->
	// 입력값 조회하여 끝났는지 확인하기 위해 select
	// 생산량이 모두 완료되었으면 상태값 변경하기 위해 update
	Map<String, Object> selectWpoSts03(Long wrkId);
	int updateWpoSts03(Map map);
	
	// (상태 : wpo_sts_03 공정완료 >> wpo_sts_04 품질검사중 -> 사원입력값 확인하여 생산 완료 확인 -->	
	int updateWpoSts04(Map map);

	
}
