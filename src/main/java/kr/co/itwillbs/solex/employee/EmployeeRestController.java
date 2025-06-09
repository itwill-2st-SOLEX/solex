package kr.co.itwillbs.solex.employee;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class EmployeeRestController {

	@Autowired
	private EmployeeService employeeService;
	
	@GetMapping("/orgChart/data")
	public List<Map<String, Object>> getOrgChartData() {
		
		List<Map<String, Object>> list = employeeService.getOrgChartData();
		
		System.out.println("list : " + list);
		
	    return list;
	}
}
