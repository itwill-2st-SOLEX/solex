package kr.co.itwillbs.solex.vacation;

import java.util.List;
import java.util.Map;

import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface VacationMapper {
	
	// 내 휴가 현황 요약
	Map<String, Object> getVacationSummary(Map map);
	
	// 내 휴가 사용 개수 계산하기
	int getVacationCount(Long empId);
	
	List<Map<String, Object>> getVacationDetail(Map params);
	
	List<Map<String, Object>> getVacationList(Map params);
	
	int getVacationAllCount(Map params);
	
	Map<String, Object> getEmployeeInfo(Long empId);
}
