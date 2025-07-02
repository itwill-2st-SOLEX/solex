package kr.co.itwillbs.solex.workHistory;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;


@RestController
@RequestMapping("/workHistory/api")
public class WorkHistoryRestController {
	@Autowired
	private WorkHistoryService workHistoryService ;
	
	// 작업지시 조회
	@GetMapping("/list")
	public List<Map<String, Object>> getWorkList(@RequestParam("page") int page, @RequestParam("size") int size) {
		int offset = page * size;
		return workHistoryService.getWorkHistoryList(offset, size);
	}
	
	
	
}
