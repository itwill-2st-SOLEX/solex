package kr.co.itwillbs.solex.Hr.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

import kr.co.itwillbs.solex.Hr.service.HrService;
import lombok.extern.log4j.Log4j2;
@Log4j2
@Controller
@RequestMapping("/hr")
public class HrController {
	
	@Autowired
//	private HrService hrService;
	
	//인사메인
	@GetMapping("")
	public String main() {
		
		return "hr/hr_main";
	}
	
	//인사관리(사원목록)
	@GetMapping("/list")
	public String hrlist() {
		
		return "hr/hr_list";
	}
	
	//인사발령
	@GetMapping("/appoint")
	public String hrappoint(@RequestParam String param) {
		
		return "hr/hr_appoint";
	}
	
}
