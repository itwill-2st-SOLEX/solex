package kr.co.itwillbs.solex.workOrder;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.GetMapping;


@Controller
@RequestMapping("/workOrders")
@PreAuthorize("hasAnyRole('1','2','3','4')")
public class WorkOrderController {

	@Autowired
	WorkOrderService service;
	
	@GetMapping("")
	public String workOrder() {
		return "workOrder/workOrder";
	}
	
}
