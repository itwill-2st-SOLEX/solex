package kr.co.itwillbs.solex.vacation;

import java.util.List;
import java.util.Map;

import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface VacationMapper {
	Map<String, Object> getVacationSummary(int empId);
}
