package kr.co.itwillbs.solex.boms;

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
	
	
}