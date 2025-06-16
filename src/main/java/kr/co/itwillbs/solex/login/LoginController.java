package kr.co.itwillbs.solex.login;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.GetMapping;


@Controller
@RequestMapping("/auth")
public class LoginController {
	
	@GetMapping("login")
	public String loginMain() {
		return "login/login";
	}
	
}
