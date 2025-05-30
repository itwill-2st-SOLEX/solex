package kr.co.itwillbs.solex.attendance;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;


@RequestMapping("/attendance")
public class AttendanceController {
	@GetMapping("/my_attend")
	public String getMyAttend() {
		return "/commute/my_attend";
	}
}


	

