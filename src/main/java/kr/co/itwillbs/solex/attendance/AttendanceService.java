package kr.co.itwillbs.solex.attendance;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class AttendanceService {
	
	@Autowired
	private AttendanceMapper attendanceMapper;

	// 자신의 근태현황 조회
	public List<Map<String, Object>> getMyAttendanceByMonth(Map<String, Object> params) {
		return attendanceMapper.selectMyAttendenceByMonthList(params);
	}

	// 부하직원의 근태현황 조회
	public List<Map<String, Object>> getAttendanceByMonth(Map<String, Object> params) {
		return attendanceMapper.selectAttendenceByMonthList(params);
	}
	
}