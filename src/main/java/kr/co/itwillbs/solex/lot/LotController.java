package kr.co.itwillbs.solex.lot;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class LotController {
	
	@GetMapping("/lotTracking")
	public String goLotTracking() {
		return "lot/lot";
	}

}
