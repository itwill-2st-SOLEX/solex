package kr.co.itwillbs.solex.process;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

@RestController
public class ProcessRestController {

	@Autowired
	private ProcessService processService;
	
	// 공정정보 리스트 조회 무한스크롤
	@GetMapping("/process/data")
	public Map<String, Object> getProcessList(@RequestParam Map<String, String> map) {
		
		int page = Integer.parseInt(map.getOrDefault("page", "1"));
	    int perPage = Integer.parseInt(map.getOrDefault("perPage", "20"));
	    int offset = (page - 1) * perPage;
	    
        List<Map<String, Object>> rows = processService.selectPagedProcessList(perPage, offset);
        if (rows == null) rows = new ArrayList<>();
        
        int totalCount = processService.selectTotalProcessCount();
		
        Map<String, Object> pagination = new HashMap<>();
	    pagination.put("page", page);
	    pagination.put("totalCount", totalCount);
	    
	    Map<String, Object> data = new HashMap<>();
	    data.put("contents", rows);
	    data.put("pagination", pagination);
	    
	    Map<String, Object> result = new HashMap<>();
	    result.put("result", true);
	    result.put("data", data);

        return result;
	}
	
	// 부서명 리스트 조회 API
	@GetMapping("/department/list")
	public List<Map<String, Object>> getDepartmentList() {
		List<Map<String, Object>> depList = processService.getDepartmentList();
	    return depList;
	}

	// 품질검사명 리스트 조회 API
	@GetMapping("/quality/list")
	public List<Map<String, Object>> getQualityList() {
		List<Map<String, Object>> quaList = processService.getQualityItemList();
	    return  quaList;
	}
	
}
