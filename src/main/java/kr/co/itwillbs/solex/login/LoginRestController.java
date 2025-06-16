package kr.co.itwillbs.solex.login;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/login")
public class LoginRestController {
	@Autowired
	LoginService service;
	
	@PostMapping("")
	public Map<String, String> login(@RequestParam String emp_num, @RequestParam String emp_pw) {
		System.out.println(emp_num);
		System.out.println(emp_pw);
		return service.loginEmp(emp_num, emp_pw);
	}
	
}
