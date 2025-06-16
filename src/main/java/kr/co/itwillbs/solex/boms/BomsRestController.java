package kr.co.itwillbs.solex.boms;

import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
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
	
	// 상품 list
	@GetMapping("/bomList")
	public ResponseEntity<List<Map<String, Object>>> getBomsList( // 반환 타입을 DTO로 변경
			@RequestParam(name = "page", required = false) Integer page
			) {
		
		List<Map<String, Object>> getBomsList = bomsService.getBomsList();
		System.out.println("rest api + " + getBomsList);
		
	    Map<String, Object> params = new HashMap<>();
	    params.put("page", page);
	    params.put("empId", loginEmpId);
        
	    return ResponseEntity.ok(getBomsList);
	}
	
	
}