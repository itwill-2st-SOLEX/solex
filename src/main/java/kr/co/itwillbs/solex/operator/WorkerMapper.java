package kr.co.itwillbs.solex.operator;

import java.util.Map;

import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface WorkerMapper {
	Map<String, Object> getWorkerSummary(Long empId);
}
