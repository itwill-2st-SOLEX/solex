package kr.co.itwillbs.solex.operator;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.SessionAttribute;

import jakarta.servlet.http.HttpSession;

@RestController
@RequestMapping("/operator/api")
public class WorkerRestController {

	@Autowired
	public WorkerService workerService;

	
	//내 부서 정보
	@GetMapping("/workerSummary")
	public Map<String, Object> getWorkerSummary(@SessionAttribute("empId") Long empId) {
    	
    	Map empInfo = workerService.getWorkerInfo(empId);
		
	    Map<String, Object> result = workerService.getWorkerSummary(empId);
	    
	    if (result == null) {
	    	System.out.println(empInfo);
	    	return empInfo;
	    }
	    
	    result.putAll(empInfo);
	   
	    System.out.println("summary : " +  result);
	    return result;
	}
	
	//사원 실적 등록
	@PostMapping("/insertCount")
	public ResponseEntity<?> insertWorkCount(@RequestBody  Map<String, Object> map, 
											 @SessionAttribute("empId") Long empId) {
		
		workerService.insertWorkCount(map);
		return ResponseEntity.ok().build();
	}
	
	@GetMapping("/workerList")
	public Map<String, Object> getWorkerReportList(@RequestParam("wpoId") Long wpoId,
										           @SessionAttribute("empId") Long empId) {
		
		Map<String, Object> params = new HashMap<>();
		
	    //params.put("offset", page * size);
	    //params.put("size", size);
	    params.put("empId", empId);
	    params.put("wpoId", wpoId);
		
	    List<Map<String, Object>> list = workerService.getWorkerList(params);
	    Map<String, Object> result = new HashMap<>();
	    result.put("list", list);

	    return result;
	}
	
	@PatchMapping("/updateMemo")
	public ResponseEntity<?> updateMemo(@RequestBody Map<String, Object> map,
										@SessionAttribute("empId") Long empId) {

		Long wreId   = ((Number) map.get("wreId")).longValue();
	    String memo  = (String) map.get("newMemo");
	    
	    map.put("wreId", wreId);
	    map.put("wreMemo", memo);
	    map.put("wreDate", LocalDateTime.now());

	    int updated = workerService.updateWorkerMemo(map); // 1 반환 시 성공

	    return (updated == 1)
	           ? ResponseEntity.ok().build()
	           : ResponseEntity.status(HttpStatus.BAD_REQUEST).body("update fail");
	}

}
