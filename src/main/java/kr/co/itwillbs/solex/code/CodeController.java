package kr.co.itwillbs.solex.code;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

@Controller
@RequestMapping("/SOLEX")
public class CodeController {
	
	@Autowired
	private CodeService codeService;

	// 공통코드 리스트 조회
	@GetMapping("/code")
	public String getCodeList(Model model) throws Exception {
		return "code/code";
	}
	
	// 무한스크롤
	@GetMapping("/code/data")
	@ResponseBody
	public Map<String, Object> getPagedCodeList(
	    @RequestParam(name = "page", defaultValue = "1") int page,
	    @RequestParam(name = "perPage") int perPage,
	    @RequestParam(name = "sortColumn", defaultValue = "cod_id", required = false) String sortColumn,
	    @RequestParam(name = "sortDirection", defaultValue = "asc", required = false) String sortDirection,
	    @RequestParam(name = "cod_yn", defaultValue = "", required = false) String cod_yn
	) {
		
	    int offset = (page - 1) * perPage;
	    
	    List<CodeDTO> rows = codeService.getPagedCodeList(offset, perPage, sortColumn, sortDirection, cod_yn);
	    if (rows == null) rows = new ArrayList<>();	// 빈 배열 보장
	    
	    int totalCount = codeService.getTotalCount(cod_yn);
	    
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
	public Map<String, Object> saveCode(@RequestBody Map<String, List<CodeDTO>> map) {
		
		List<CodeDTO> insertList = map.get("insertList");
	    List<CodeDTO> updateList = map.get("updateList");

	    // 공통코드 신규 행 추가
	    if (insertList != null && !insertList.isEmpty()) {
	        codeService.insertCodes(insertList);
	    }

	    // 공통코드 기존 행 수정
	    if (updateList != null && !updateList.isEmpty()) {
	        codeService.updateCodes(updateList);
	    }
		
		return Map.of("result", "seccess");
	}
	
	
	
}
