package kr.co.itwillbs.solex.process;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@RestController
public class ProcessRestController {

	@Autowired
	private ProcessService processService;
	
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
	
	// 공정정보 신규 등록 및 수정
	@PostMapping("/process/save")
	public Map<String, Object> saveProcess(@RequestBody Map<String, List<Map<String, Object>>> map) {
	    List<Map<String, Object>> insertList = map.get("createdRows");
	    List<Map<String, Object>> updateList = map.get("updatedRows");
	    
	    if ((insertList == null || insertList.isEmpty()) && (updateList == null || updateList.isEmpty())) {
	        return Map.of("success", false, "message", "저장할 데이터가 없습니다.");
	    }

	    // 공정 신규 등록
	    if (insertList != null && !insertList.isEmpty()) {
	    	processService.insertProcesses(insertList);
	    }

	    // 공정 기존 수정
	    if (updateList != null && !updateList.isEmpty()) {
	    	processService.updateProcesses(updateList);
	    }

	    return Map.of("success", true);
	}
	
	// 제품유형 리스트 무한스크롤
	@GetMapping("/product/type/list")
	public Map<String, Object> getPagedPrdTypeList(@RequestParam Map<String, String> map) {
		
		int page = Integer.parseInt(map.getOrDefault("page", "1"));
	    int perPage = Integer.parseInt(map.getOrDefault("perPage", "20"));
	    int offset = (page - 1) * perPage;
	    
	    List<Map<String, Object>> rows = processService.selectPagedPrdTypeList(perPage, offset);
	    if (rows == null) rows = new ArrayList<>();
	    
	    int totalCount = processService.selectTotalPrdTypeCount();
	    
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
	
	// 유형별 공정순서 조회
	@GetMapping("/typeProcess/list")
	public List<Map<String, Object>> getTypeProcessList(@RequestParam Map<String, String> map) {
		
		String det_id = map.get("DET_ID");
		
		List<Map<String, Object>> list = processService.getTypeProcessList(det_id);
		
	    return list;
	}
	
	// 공정리스트 조회
	@GetMapping("/process/list")
	public List<Map<String, Object>> getProcessList() {
		
		List<Map<String, Object>> list = processService.getAllProcessList();
		
	    return list;
	}
	
	// 공정순서 신규 등록 및 수정
	@PostMapping("/typeProcess/save")
	public Map<String, Object> saveTypeProcess(@RequestBody Map<String, List<Map<String, Object>>> map) {
		
	    List<Map<String, Object>> insertList = map.get("createdRows");
	    List<Map<String, Object>> updateList = map.get("updatedRows");

	    if ((insertList == null || insertList.isEmpty()) && (updateList == null || updateList.isEmpty())) {
	        return Map.of("success", false, "message", "저장할 데이터가 없습니다.");
	    }

	    // 공정순서 신규 등록
	    if (insertList != null && !insertList.isEmpty()) {
	    	processService.insertTypeProcesses(insertList);
	    }

	    // 공정순서 기존 수정
	    if (updateList != null && !updateList.isEmpty()) {
	    	processService.updateTypeProcesses(updateList);
	    }

	    return Map.of("success", true);
	}
	
	// 공정순서 삭제
	@PostMapping("/typeProcess/delete")
	public ResponseEntity<?> deleteTypeProcesses(@RequestBody List<Map<String, Object>> deleteList) {
        try {
        	processService.deleteTypeProcesses(deleteList);
            return ResponseEntity.ok(Map.of("result", "success"));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("result", "fail", "message", e.getMessage()));
        }
    }
	
}
