package kr.co.itwillbs.solex.attendance;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@RequestMapping("/attendance")
public class AttendanceController {
	
	@Autowired
	private AttendanceService attendanceService;
	
	@GetMapping("/my_attendence/list")
	public String getAttendenceList(Model model) {
		List<Map<String, String>> attendanceList = attendanceService.getAttendenceList();
		model.addAttribute("attendanceList", attendanceList);
		
		
		
		return "/attendance/my_attend";
	}
}


	

