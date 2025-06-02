package kr.co.itwillbs.solex.attendance;

import java.util.List;
import java.util.Map;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface AttendanceMapper {

	List<Map<String, String>> selectAttendenceList();

	List<Map<String, Object>> selectAttendenceByMonthList(@Param("year") int year, @Param("month") int month);

}
