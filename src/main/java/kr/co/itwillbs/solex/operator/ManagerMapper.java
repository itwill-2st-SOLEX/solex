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
	
	//진행 상태 업데이트
	int updateWpoSts01(Map map);
	
	int updateWpoSts02(Map map);
	
	int updateWpoSts03(Map map);
	
	int updateWpoSts04(Map map);
	
	int updateWpoSts05(Map map);
	
}
