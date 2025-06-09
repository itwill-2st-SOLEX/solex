package kr.co.itwillbs.solex.vacation;

import java.util.List;
import java.util.Map;

import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface VacationMapper {
	Map<String, Object> getVacationSummary(Long empId);
	
	int getVacationCount(Long empId);
	
	List<Map<String, Object>> getVacationDetail(Map<String, Object> params);
}
