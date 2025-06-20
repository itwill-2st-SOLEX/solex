package kr.co.itwillbs.solex.login;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/auth")
public class LoginRestController {
	@Autowired
	LoginService service;
	
	@PostMapping("/login")
	public Map<String, String> login(@RequestBody Map<String, String> empInfo) {
		
		System.out.println(empInfo);
		return service.loginEmp(empInfo);
	}
	
}
