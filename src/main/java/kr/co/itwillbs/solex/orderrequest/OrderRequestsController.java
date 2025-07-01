package kr.co.itwillbs.solex.orderrequest;


import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.GetMapping;


@Controller
@RequestMapping("/order-requests")
public class OrderRequestsController {	
	@GetMapping
	public String orderRequestsList(){
        return "orderrequest/list"; 
    }
}
