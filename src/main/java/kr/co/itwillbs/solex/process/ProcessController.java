package kr.co.itwillbs.solex.process;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class ProcessController {

	@GetMapping("/processInfo")
	public String goProcessInfo() {
		return "process/process";
	}
	
}
