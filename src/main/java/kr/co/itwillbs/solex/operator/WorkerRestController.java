package kr.co.itwillbs.solex.operator;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
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

	    return result;
	}

	/*
	 * // 모든 작업 목록 가져오기
	 * 
	 * @GetMapping("/workerList") public Map<String, Object>
	 * getManagerList(@RequestParam(name = "page", required = false) Integer page,
	 * 
	 * @RequestParam(name = "size", required = false) Integer size,
	 * 
	 * @RequestParam("empId") Long empId) {
	 * 
	 * Map<String, Object> params = new HashMap<>(); params.put("offset", page *
	 * size); params.put("size", size); params.put("empId", empId);
	 * 
	 * // 내 작업 전체 목록 List<Map<String, Object>> workerList =
	 * workerService.getManagerList(params); int vacationCount =
	 * workerService.getManagerCount(empId);
	 * 
	 * Map<String, Object> result = new HashMap<>(); result.put("list", workerList);
	 * 
	 * System.out.println(result); return result; }
	 * 
	 * // 작업 순서 업데이트
	 * 
	 * @PatchMapping("/updateStatus") public ResponseEntity<?>
	 * updateStatus(@RequestBody Map<String, Object> map) {
	 * 
	 * System.out.println(map);
	 * 
	 * workerService.updateWpoSts(map);
	 * 
	 * return ResponseEntity.ok().build(); }
	 */
	

}
