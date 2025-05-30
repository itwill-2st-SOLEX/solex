package kr.co.itwillbs.solex.Test;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;


@Controller
public class TestController {
	
	@GetMapping("")
	public String TestView() {
		return "test";
	}
	
}
