package kr.co.itwillbs.solex.employee;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/employee")
public class EmployeeRestController {

	@Autowired
	private OrgChartService orgChartService;
	
	@GetMapping("/org/chart")
	public Map<String, Object> getOrgChart() {
		Map<String, Object> chart = orgChartService.getOrgChartTree();
	    return chart;
	}
}
