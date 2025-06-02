package kr.co.itwillbs.solex.attendance;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class AttendanceService {
	
	@Autowired
	private AttendanceMapper attendanceMapper;

	public List<Map<String, String>> getAttendenceList() {
		return attendanceMapper.selectAttendenceList();
	}

	public List<Map<String, Object>> getAttendanceByMonth(int year, int month) {
		return attendanceMapper.selectAttendenceByMonthList(year, month);
	}

}
