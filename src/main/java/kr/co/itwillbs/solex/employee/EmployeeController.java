package kr.co.itwillbs.solex.employee;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class EmployeeController {

	@GetMapping("orgChart")
	public String getOrgChart() {
		return "employee/orgChart";
	}
	
	
}
