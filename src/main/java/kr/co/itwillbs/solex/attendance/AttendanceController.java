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
	public String getAttendenceListPage(Model model) {
		// 현재 연도와 월
        YearMonth currentYearMonth = YearMonth.now();
        int year = currentYearMonth.getYear();
        int month = currentYearMonth.getMonthValue();
        
        // 초기 근태 데이터를 가져와 모델에 추가
        List<Map<String, Object>> attendanceList = attendanceService.getAttendanceByMonth(year, month);
        model.addAttribute("attendanceList", attendanceList);

         // 초기 화면에 현재 월/연도를 표시하기 위해 추가
         model.addAttribute("initialYear", year);
         model.addAttribute("initialMonth", month);

        return "attendance/my_attendance_list"; 
	}
	
    // 부하직원의 근태현황 조회
    @GetMapping("/attendance_list")
	public String getMethodName(Model model) {
    	// 현재 연도와 월
        YearMonth currentYearMonth = YearMonth.now();
        int year = currentYearMonth.getYear();
        int month = currentYearMonth.getMonthValue();
		
		// 초기 근태 데이터를 가져와 모델에 추가
        List<Map<String, Object>> attendanceList = attendanceService.getAttendanceByMonth(year, month);
        model.addAttribute("attendanceList", attendanceList);

         // 초기 화면에 현재 월/연도를 표시하기 위해 추가
         model.addAttribute("initialYear", year);
         model.addAttribute("initialMonth", month);
		
        return "attendance/attendance_list"; 
	}
    
    // 출퇴근 현황 - JavaScript (AJAX) 요청을 받아 데이터만 JSON으로 반환하는 메서드
//    @GetMapping("/data")
//    @ResponseBody
//    public List<Map<String, Object>> getMyAttendanceDataByMonth(
//    		@RequestParam("year") int year,
//    		@RequestParam("month") int month) {
//    	
//    	List<Map<String, Object>> attendanceData = attendanceService.getMyAttendanceByMonth(year, month);
//    	return attendanceData;
//    }
    
	@GetMapping("/data")
	@ResponseBody
	public Map<String, Object> getAttendanceDataByMonth( // 반환 타입을 DTO로 변경
	        @RequestParam("year") int year,
	        @RequestParam("month") int month,
	        @RequestParam(value = "requestType", required = false) String requestType) { // 새로운 파라미터 추가

	    System.out.println("AJAX 요청 수신 ??#$@%: " + year + "년 " + month + "월");
	    Map<String, Object> combinedMap = new HashMap<>();
	
	    // 1. 내 근태 데이터 조회
	    List<Map<String, Object>> myAttendance = attendanceService.getMyAttendanceByMonth(year, month); // 서비스 메서드 분리 또는 호출
	    combinedMap.put("myAttendance", myAttendance);
	
	    // 2. 다른 사람/팀 근태 데이터 조회
	    List<Map<String, Object>> teamAttendance = attendanceService.getAttendanceByMonth(year, month); // 다른 서비스 메서드 호출
        combinedMap.put("teamAttendance", teamAttendance); // 키 이름을 명확하게 지정
        
        System.out.println("combinedMap??? " + combinedMap);

        return combinedMap;
	    
	}
    
  
}


	

