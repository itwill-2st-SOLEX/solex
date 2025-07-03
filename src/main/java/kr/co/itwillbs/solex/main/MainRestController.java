package kr.co.itwillbs.solex.main;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class MainRestController {
	
	@Autowired
	private MainService mainService;
	
	@GetMapping("/main")
	public List<Map<String, Object>> getNotice() {
		return mainService.mainNotice();
	}
}
