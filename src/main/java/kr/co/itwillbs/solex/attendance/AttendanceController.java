package kr.co.itwillbs.solex.attendance;

import java.time.LocalDateTime;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

@Controller
@RequestMapping("/attendance")
public class AttendanceController {
	
	@Autowired
	private AttendanceService attendanceService;
	
	@GetMapping("/my_attendance_list")
	public String getMyAttendenceList(Model model) {
		// 현재 연도와 월
        YearMonth currentYearMonth = YearMonth.now();
        int year = currentYearMonth.getYear();
        int month = currentYearMonth.getMonthValue();
        
         // 초기 화면에 현재 월/연도를 표시하기 위해 추가
         model.addAttribute("initialYear", year);
         model.addAttribute("initialMonth", month);

        return "attendance/my_attendance_list"; 
	}
	
    // 부하직원의 근태현황 조회
    @GetMapping("/attendance_list")
	public String getAttendenceList(Model model) {
    	// 현재 연도와 월
        YearMonth currentYearMonth = YearMonth.now();
        int year = currentYearMonth.getYear();
        int month = currentYearMonth.getMonthValue();
		
         // 초기 화면에 현재 월/연도를 표시하기 위해 추가
         model.addAttribute("initialYear", year);
         model.addAttribute("initialMonth", month);
		
        return "attendance/attendance_list"; 
	}
	
	@GetMapping("/attendance_register")
	public String getAttendenceRegister(Model model) {

        return "attendance/attendance_register"; 
	}
}