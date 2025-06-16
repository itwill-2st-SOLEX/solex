package kr.co.itwillbs.solex.workOrder;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;


@RestController
@RequestMapping("/workOrder")
public class WorkOrderRestController {
	@Autowired
	WorkOrderService service;
	
	@GetMapping("/list")
	public Map<String, String> getWorkList(@RequestParam int page, @RequestParam int size) {
		return service.getWorkList();
	}
	
}
