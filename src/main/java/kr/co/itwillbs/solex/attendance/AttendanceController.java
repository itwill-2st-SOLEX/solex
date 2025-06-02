package kr.co.itwillbs.solex.attendance;

import java.time.YearMonth;
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
		// 현재 연도와 월을 가져옵니다.
        YearMonth currentYearMonth = YearMonth.now();
        int year = currentYearMonth.getYear();
        int month = currentYearMonth.getMonthValue();

        // 초기 근태 데이터를 가져와 모델에 추가
        List<Map<String, Object>> initialAttendanceList = attendanceService.getAttendanceByMonth(year, month);
        model.addAttribute("attendanceList", initialAttendanceList);
        
        

        // 초기 화면에 현재 월/연도를 표시하기 위해 추가 (선택 사항)
         model.addAttribute("initialYear", year);
         model.addAttribute("initialMonth", month);

        return "attendance/my_attendance_list"; // 이 뷰 이름을 찾아 HTML을 렌더링하여 페이지 이동
	}
	
	// 2. JavaScript (AJAX) 요청을 받아 데이터만 JSON으로 반환하는 메서드
    @GetMapping("/data")
    @ResponseBody
    public List<Map<String, Object>> getAttendanceDataByMonth(
            @RequestParam("year") int year,
            @RequestParam("month") int month) {

        System.out.println("AJAX 요청 수신: " + year + "년 " + month + "월");
        List<Map<String, Object>> attendanceData = attendanceService.getAttendanceByMonth(year, month);
        System.out.println("ADSSAD" + attendanceData);
        return attendanceData;
    }
	
	
	
	
	
	
//	public String getAttendenceList(Model model) {
//		List<Map<String, String>> attendanceList = attendanceService.getAttendenceList();
//		model.addAttribute("attendanceList", attendanceList);
//		
//		return "/attendance/my_attendance_list";
//	}
	
	
	
	
}


	

