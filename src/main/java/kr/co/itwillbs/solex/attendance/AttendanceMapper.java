package kr.co.itwillbs.solex.attendance;

import java.util.List;
import java.util.Map;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface AttendanceMapper {
	// 자신의 근태현황 조회
	List<Map<String, Object>> selectMyAttendenceByMonthList(@Param("year") int year, @Param("month") int month);

	// 부하직원의 근태현황 조회
	List<Map<String, Object>> selectAttendenceByMonthList(@Param("year") int year, @Param("month") int month);
}
