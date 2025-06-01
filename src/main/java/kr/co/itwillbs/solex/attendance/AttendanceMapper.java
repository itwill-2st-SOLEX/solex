package kr.co.itwillbs.solex.attendance;

import java.util.List;
import java.util.Map;

import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface AttendanceMapper {

	List<Map<String, String>> selectAttendenceList();

}
