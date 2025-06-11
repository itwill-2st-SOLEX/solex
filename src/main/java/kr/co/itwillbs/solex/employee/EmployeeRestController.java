package kr.co.itwillbs.solex.employee;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/employee")
public class EmployeeRestController {

	@Autowired
	private OrgChartService orgChartService;
	
	@GetMapping("/orgchart/tree")
    public ResponseEntity<?> getOrgChartTree() {
        Map<String, Object> tree = orgChartService.buildOrgChart();
        return ResponseEntity.ok(tree);
    }
}
