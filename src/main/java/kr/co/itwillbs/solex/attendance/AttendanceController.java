package kr.co.itwillbs.solex.attendance;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@RequestMapping("/attendance")
public class AttendanceController {
	@GetMapping("/my_attend")
	public String getMyAttend() {
		System.out.println("출퇴근 현호아 나오나?? asldkfj;alkejf;lwaeijlkj");
		return "/attendance/my_attend";
	}
}


	

