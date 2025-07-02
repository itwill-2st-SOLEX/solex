package kr.co.itwillbs.solex.workHistory;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.GetMapping;


@Controller
@RequestMapping("/workHistory")
public class WorkHistoryController {
	@GetMapping("")
	public String workOrder() {
		return "workHistory/workHistory";
	}
	
}
