package kr.co.itwillbs.solex.Test;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;


@Controller
public class HomeController {
	
	@GetMapping("")
	public String home() {
		return "main";
	}
	
}
