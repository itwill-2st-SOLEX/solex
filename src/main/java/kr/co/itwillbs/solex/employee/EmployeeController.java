package kr.co.itwillbs.solex.employee;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
@RequestMapping("SOLEX")
public class EmployeeController {

	@GetMapping("orgChart")
	public String getOrgChart() {
		return "employee/orgChart";
	}
	
	
}
