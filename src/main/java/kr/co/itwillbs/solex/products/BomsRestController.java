package kr.co.itwillbs.solex.products;

import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/boms/api")
public class BomsRestController {
	
	long loginEmpId = 7L; // 임시 ID
	
	@Autowired
	private BomsService bomsService;
	
	// BOM list
	@GetMapping("/bomList")
	@ResponseBody
	public Map<String, Object> getPagedDetailCodeList(
	    @RequestParam(name = "opt_id") String opt_id,
	    @RequestParam(name = "page", defaultValue = "1") int page,
	    @RequestParam(name = "perPage") int perPage
	) {
	    int offset = (page - 1) * perPage;
	    System.out.println("offset ?? " + offset);
	    List<Map<String, Object>> rows = bomsService.getBomList(opt_id, offset, perPage);
	    
	    
	    System.out.println("getBomList?? " + rows);
	    if (rows == null) rows = new ArrayList<>();

	    int totalCount = bomsService.getTotalBomCount(opt_id);
	    
	    Map<String, Object> pagination = Map.of("page", page, "totalCount", totalCount);
	    Map<String, Object> data = Map.of("contents", rows, "pagination", pagination);

	    return Map.of("result", true, "data", data);
	}
	
	@PostMapping("/save")
	public Map<String, Object> saveBomInfo(@RequestBody Map<String, List<Map<String, Object>>> map) {
		
		List<Map<String, Object>> insertList = map.get("createdRows");
	    List<Map<String, Object>> updateList = map.get("updatedRows");
	    
	    if ((insertList == null || insertList.isEmpty()) && (updateList == null || updateList.isEmpty())) {
            return Map.of("success", false, "message", "저장할 데이터가 없습니다.");
        }

	    // 상세공통코드 신규 행 추가
	    if (insertList != null && !insertList.isEmpty()) {
	    	bomsService.insertBomInfo(insertList);
	    }

	    // 상세공통코드 기존 행 수정
	    if (updateList != null && !updateList.isEmpty()) {
	    	bomsService.updateBomInfo(updateList);
	    }
		
		return Map.of("success", true);
	}
	// 단위 셀렉트바 옵션들
	@GetMapping("/materialList")
	public List<Map<String, Object>> getmaterialList() {
		
		List<Map<String, Object>> materials = bomsService.getMaterialList();
		System.out.println("materials 잘가지고 옴?? : " + materials);
		
		
		return materials;
	}
	
	
	
	
	
	
}