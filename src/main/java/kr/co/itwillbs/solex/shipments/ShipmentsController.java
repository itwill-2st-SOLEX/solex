package kr.co.itwillbs.solex.shipments;


import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.GetMapping;


@Controller
@RequestMapping("/shipments")
public class ShipmentsController {	
	@GetMapping
	public String orderRequestsList(){
        return "shipments/list"; 
    }

    
}
