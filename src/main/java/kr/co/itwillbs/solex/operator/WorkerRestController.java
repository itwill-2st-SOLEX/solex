package kr.co.itwillbs.solex.operator;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import kr.co.itwillbs.solex.sales.OrderController;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/operator/api")
public class WorkerRestController {

	@Autowired
	public WorkerService workerService;
	
	//로그인 구현 필요
	Long empId = 26L;

	
	//내 부서 정보
	@GetMapping("/workerSummary")
	public Map<String, Object> getWorkerSummary() {
		
	    Map<String, Object> result = workerService.getWorkerSummary(empId);
	    System.out.println("summary : " +  result);
	    return result;
	}
	
	//사원 실적 등록
	@PostMapping("/insertCount")
	public ResponseEntity<?> insertWorkCount(@RequestBody  Map<String, Object> map) {
		
		workerService.insertWorkCount(map);
		return ResponseEntity.ok().build();
	}
	
	@GetMapping("/workerList")
	public Map<String, Object> getWorkerReportList(@RequestParam(name = "page", required = false) Integer page,
												         @RequestParam(name = "size", required = false) Integer size,
												         @RequestParam("empId") Long empId,
												         @RequestParam("wpoId") Long wpoId) {
		
		Map<String, Object> params = new HashMap<>();
		
	    params.put("offset", page * size);
	    params.put("size", size);
	    params.put("empId", empId);
	    params.put("wpoId", wpoId);
		
	    List<Map<String, Object>> list = workerService.getWorkerList(params);
	    Map<String, Object> result = new HashMap<>();
	    result.put("list", list);

	    return result;
	}

}
