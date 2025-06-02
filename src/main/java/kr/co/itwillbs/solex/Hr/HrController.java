package kr.co.itwillbs.solex.Hr;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

import lombok.extern.log4j.Log4j2;

@Log4j2
@Controller
@RequestMapping("/hr")
public class HrController {
	
	@GetMapping
	public String main() {
		return "hr/hr_main";
	}
	
	@GetMapping("/registration")
	public String register() {
		return "hr/hr_registraion";
	}
	
	
	@GetMapping("/correction")
	public String correction() {
		return "hr/hr_correction";
	}
}
