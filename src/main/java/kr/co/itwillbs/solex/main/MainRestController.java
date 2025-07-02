package kr.co.itwillbs.solex.main;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class MainRestController {
	
	@Autowired
	private MainService mainService;
	
	@GetMapping("/main")
	public List<Map<String, Object>> getNotice() {
		return mainService.mainNotice();
	}
}
