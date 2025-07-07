package kr.co.itwillbs.solex.quality;

import java.util.List;
import java.util.Map;

import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface InspectionMapper {
	
	//로그인한 사람에 해당하는 공정 정보 가져오기
	Map<String, Object> getManagerSummary(Long empId);
	
	int getManagerCount(Long empId);
	
	//작업 현황 모두 가져오기
	List<Map<String, Object>> getInspectionList(Map<String, Object> params);
	
	
	
	
	
	
	// 작업별 사원 생산량 리스트
	List<Map<String, Object>> selectWorkerList(Map map);

	// 사원 생산량 변경
	int updateWorkerCount(Map map);

	List<Map<String, Object>> getDefectiveCountByWarehouse(Map<String, Object> map);
	
	void callFifoOutboundByOdd(Map<String, Object> params);

	void updateStatus(Map<String, Object> map);
	

}
