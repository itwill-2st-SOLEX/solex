package kr.co.itwillbs.solex.code;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class CodeRestController {

	@Autowired
	private CodeService codeService;
	
	// 공통코드 무한스크롤
	@GetMapping("/code/data")
	@ResponseBody
	public Map<String, Object> getPagedCodeList(
	    @RequestParam(name = "page", defaultValue = "1") int page,
	    @RequestParam(name = "perPage") int perPage,
	    @RequestParam(name = "sortColumn", defaultValue = "cod_id", required = false) String sortColumn,
	    @RequestParam(name = "sortDirection", defaultValue = "asc", required = false) String sortDirection,
	    @RequestParam(name = "cod_yn", defaultValue = "", required = false) String cod_yn,
	    @RequestParam(name = "keyword", defaultValue = "", required = false) String keyword
	) {
		
	    int offset = (page - 1) * perPage;
	    
	    // 1) 페이징된 목록 가져오기
	    List<Map<String, Object>> rows = codeService.getPagedCodeList(offset, perPage, sortColumn, sortDirection, cod_yn, keyword);
	    if (rows == null) rows = new ArrayList<>();	// 빈 배열 보장
	    
	    // 2) 전체 개수 가져오기
	    int totalCount = codeService.getTotalCount(cod_yn);
	    
	    // 3) 결과 구성20
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
	
	// 공통코드 저장
	@PostMapping("/code/save")
	@ResponseBody
	public Map<String, Object> saveCode(@RequestBody Map<String, List<Map<String, Object>>> map) {

	    List<Map<String, Object>> insertList = map.get("createdRows");
	    List<Map<String, Object>> updateList = map.get("updatedRows");
	    
	    if ((insertList == null || insertList.isEmpty()) && (updateList == null || updateList.isEmpty())) {
	        return Map.of("success", false, "message", "저장할 데이터가 없습니다.");
	    }

	    // 공통코드 신규 등록
	    if (insertList != null && !insertList.isEmpty()) {
	        codeService.insertCodes(insertList);
	    }

	    // 공통코드 기존 수정
	    if (updateList != null && !updateList.isEmpty()) {
	        codeService.updateCodes(updateList);
	    }

	    return Map.of("success", true);
	}
	
	// 상세공통코드 무한스크롤
	@GetMapping("/detailCode/data")
	@ResponseBody
	public Map<String, Object> getPagedDetailCodeList(
	    @RequestParam(name = "cod_id") String cod_id,
	    @RequestParam(name = "page", defaultValue = "1") int page,
	    @RequestParam(name = "perPage") int perPage,
	    @RequestParam(name = "sortColumn", defaultValue = "DET_SORT", required = false) String sortColumn,
	    @RequestParam(name = "sortDirection", defaultValue = "asc", required = false) String sortDirection,
	    @RequestParam(name = "keyword", required = false, defaultValue = "") String keyword
	) {
	    int offset = (page - 1) * perPage;

	    List<Map<String, Object>> rows = codeService.getPagedDetailCodeList(cod_id, offset, perPage, sortColumn, sortDirection, keyword);
	    if (rows == null) rows = new ArrayList<>();

	    int totalCount = codeService.getTotalDetailCodeCount(cod_id);

	    Map<String, Object> pagination = Map.of("page", page, "totalCount", totalCount);
	    Map<String, Object> data = Map.of("contents", rows, "pagination", pagination);

	    return Map.of("result", true, "data", data);
	}
	
	// 상세공통코드 저장
	@PostMapping("/detailCode/save")
	@ResponseBody
	public Map<String, Object> saveDetailCode(@RequestBody Map<String, List<Map<String, Object>>> map) {
		
		List<Map<String, Object>> insertList = map.get("createdRows");
	    List<Map<String, Object>> updateList = map.get("updatedRows");
	    
	    if ((insertList == null || insertList.isEmpty()) && (updateList == null || updateList.isEmpty())) {
            return Map.of("success", false, "message", "저장할 데이터가 없습니다.");
        }

	    // 상세공통코드 신규 행 추가
	    if (insertList != null && !insertList.isEmpty()) {
	        codeService.insertDetailCodes(insertList);
	    }

	    // 상세공통코드 기존 행 수정
	    if (updateList != null && !updateList.isEmpty()) {
	        codeService.updateDetailCodes(updateList);
	    }
		
		return Map.of("success", true);
	}
}
