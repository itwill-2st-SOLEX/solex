package kr.co.itwillbs.solex.operator;

import java.util.List;
import java.util.Map;

import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface WorkerMapper {
	Map<String, Object> getWorkerSummary(Long empId);
	
	void insertWorkCount(Map map);
	
	List<Map<String, Object>> getWorkerList(Map map);
	
	int updateWorkerMemo(Map map);
}
