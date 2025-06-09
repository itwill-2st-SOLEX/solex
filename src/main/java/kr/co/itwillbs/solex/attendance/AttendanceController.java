package kr.co.itwillbs.solex.attendance;

import java.time.YearMonth;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
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
    
	@GetMapping("/data")
	@ResponseBody
	public Map<String, Object> getAttendanceDataByMonth( // 반환 타입을 DTO로 변경
	        @RequestParam("year") int year,
	        @RequestParam("month") int month,
	        @RequestParam(value = "resultType", required = false) String resultType,
			@RequestParam(name="keyword", required = false) String keyword
			) {

	    Map<String, Object> params = new HashMap<>();
	    
	    params.put("year", year);
	    params.put("month", month);
	    params.put("keyword", keyword);
	    System.out.println("controller params ??? " +  params);
	    Map<String, Object> combinedMap = new HashMap<>();
	    
	    if (resultType.equals("my")) { // 1. 내 근태 데이터 조회
	    	List<Map<String, Object>> myAttendance = attendanceService.getMyAttendanceByMonth(params); // 서비스 메서드 분리 또는 호출
	    	combinedMap.put("myAttendance", myAttendance);
		} else if (resultType.equals("team")) { // 2. 다른 사람/팀 근태 데이터 조회
			List<Map<String, Object>> teamAttendance = attendanceService.getAttendanceByMonth(params); // 다른 서비스 메서드 호출
			combinedMap.put("teamAttendance", teamAttendance);
		}	
        
        return combinedMap;
	}
	
	@GetMapping("/attendance_register")
	public String getAttendenceRegister(Model model) {
		// 현재 연도와 월
        YearMonth currentYearMonth = YearMonth.now();
        int year = currentYearMonth.getYear();
        int month = currentYearMonth.getMonthValue();
        
         // 초기 화면에 현재 월/연도를 표시하기 위해 추가

        return "attendance/attendance_register"; 
	}
}