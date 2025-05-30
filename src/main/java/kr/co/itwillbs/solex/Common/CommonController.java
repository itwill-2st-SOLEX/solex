package kr.co.itwillbs.solex.Common;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class CommonController {
	
	@GetMapping("common")
	public String getMethodName() {
		return "common/common";
	}
	
}
