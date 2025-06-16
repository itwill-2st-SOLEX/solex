package kr.co.itwillbs.solex.login;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.GetMapping;


@Controller
@RequestMapping("/login")
public class LoginController {
	
	@GetMapping("")
	public String loginMain() {
		return "login/login";
	}
	
}
