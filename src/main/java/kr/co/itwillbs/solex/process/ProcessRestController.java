package kr.co.itwillbs.solex.process;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;


@RestController
@RequestMapping("process")
public class ProcessRestController {

	@Autowired
	private ProcessService processService;
	
	// 공정정보 리스트 조회 무한스크롤
	@GetMapping("data")
	public Map<String, Object> getProcessList(@RequestParam Map<String, String> map) {
		
		int page = Integer.parseInt(map.getOrDefault("page", "1"));
	    int perPage = Integer.parseInt(map.getOrDefault("perPage", "20"));
	    int offset = (page - 1) * perPage;
	    
	    Map<String, Object> pagedMap = new HashMap<>();
	    pagedMap.put("offset", offset);
	    pagedMap.put("limit", perPage);
	    
        List<Map<String, Object>> data = processService.selectPagedProcessList(perPage, offset);
        
        int totalCount = processService.selectTotalProcessCount();
		
        Map<String, Object> result = new HashMap<>();
        result.put("data", data);
        result.put("pagination", Map.of("page", page, "totalCount", totalCount));

        System.out.println("result map: " + result);  // 구조 확인용 로그

        return result;
	}
	
}
