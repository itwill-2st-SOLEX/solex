package kr.co.itwillbs.solex.dashboard;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.GetMapping;


@Controller
@RequestMapping("/defect")
public class DefectController {
	@GetMapping("")
	public String defectMain() {
		return "dashBoard/defect";
	}
	
}
