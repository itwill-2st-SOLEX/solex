package kr.co.itwillbs.solex.vacation;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class RestVacationController {
	
	@Autowired
	public VacationService vacationService;
	
	@GetMapping("/vacation/api/summary")
	public Map<String, Object> getVacationSummary(@RequestParam("empId") String empId) {
		
	    Long userId = Long.parseLong(empId);
	    return vacationService.getVacationSummary(userId);
	}
	
	@GetMapping("/vacation/api/detail")
	public Map<String, Object> getVacationDetail(@RequestParam(name = "page", required = false) Integer page,
										         @RequestParam(name = "size", required = false) Integer size,
										         @RequestParam("empId") String empId) {

	    Long userId = Long.parseLong(empId);

	    Map<String, Object> params = new HashMap<>();
	    params.put("offset", page * size);
	    params.put("size", size);
	    params.put("empId", userId);

	    List<Map<String, Object>> vacationList = vacationService.getVacationDetail(params);
	    int vacationCount = vacationService.getVacationCount(userId);

	    Map<String, Object> result = new HashMap<>();
	    result.put("list", vacationList);
	    result.put("vacationCount", vacationCount);

	    return result;
	}
}
