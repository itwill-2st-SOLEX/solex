package kr.co.itwillbs.solex.attendance;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface AttendanceMapper {
	// 자신의 근태현황 조회
	List<Map<String, Object>> selectMyAttendenceByMonthList(Map<String, Object> params);

	// 부하직원의 근태현황 조회
	List<Map<String, Object>> selectAttendenceByMonthList(Map<String, Object> params);
	
	// 특정 사원의 특정 날짜 출퇴근 기록 조회
    Optional<Map<String, Object>> findByEmpIdAndAttendanceDate(
    		@Param("emp_id") Long empId, 
    		@Param("att_day") LocalDate attendanceDate);

    // 출근 기록 삽입 (새로운 출근 기록 생성)
    void insertPunchIn(Map<String, Object> params);

	void updatePunchOut(Map<String, Object> attendanceData);

	String selectDetNm(String attSts);

	Map<String, Object> selectEmployeeInfo(long loginEmpId);

	void updateAttendanceColumn(Map<String, Object> params);

	Map<String, Object> getAttendanceById(Long attId);
}