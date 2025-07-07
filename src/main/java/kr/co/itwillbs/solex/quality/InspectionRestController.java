package kr.co.itwillbs.solex.quality;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import kr.co.itwillbs.solex.document.DocumentController;
import kr.co.itwillbs.solex.orderrequest.OrderRequestsService;
import kr.co.itwillbs.solex.sales.OrderController;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import jakarta.servlet.http.HttpSession;

@RestController
@RequestMapping("/quality/api/inspection")
public class InspectionRestController {

    private final OrderRequestsService orderRequestsService;



	@Autowired
	public InspectionService inspectionService;
	
	//로그인 구현 필요
	Long empId = null;


    InspectionRestController(OrderRequestsService orderRequestsService) {
        this.orderRequestsService = orderRequestsService;
    }

	
	//내 부서 정보
	@GetMapping("/managerSummary")
	public Map<String, Object> getManagerSummary(HttpSession httpSession) {
		empId = Long.parseLong(httpSession.getAttribute("empId").toString());
	
	    Map<String, Object> result = inspectionService.getManagerSummary(empId);
	    System.out.println(result);

	    return result;
	}

	// 모든 작업 목록 가져오기
	@GetMapping("/managerList")
	public Map<String, Object> getInspectionList(@RequestParam(name = "page", required = false) Integer page,
								         @RequestParam(name = "size", required = false) Integer size,
								         @RequestParam("empId") Long empId,
								         @RequestParam("yearMonth") String yearMonth) {

	    Map<String, Object> params = new HashMap<>();
	    params.put("offset", page * size);
	    params.put("size", size);
	    params.put("empId", empId);
	    params.put("yearMonth", yearMonth);
	    
	    // 내 작업 전체 목록
	    List<Map<String, Object>> inspectionList = inspectionService.getInspectionList(params);

	    Map<String, Object> result = new HashMap<>();
	    result.put("list", inspectionList);

		System.out.println("result : " + result);
	    
	    
	    return result;
	}
	
	// 작업 순서 업데이트
	@PatchMapping("/updateStatus")
	public ResponseEntity<?> updateStatus(@RequestBody Map<String, Object> map) {
		
		map.put("empId", empId);		
		
		inspectionService.updateWpoSts(map);
		
		return ResponseEntity.ok().build();
	}
	
	//불량수량 저장
	@PostMapping("/saveBcount")
	public ResponseEntity<?> postBcount(@RequestBody Map<String, Object> map) {
		System.out.println("save : " + map);
		return ResponseEntity.ok().build();
	
	}
	
	// 각 사원별 작업내역 모달표시
    @GetMapping("/workerReport/{wpoId}")
    public Map<String, Object> apiWorkerReport(@PathVariable("wpoId") Long wpoId,
					    		@RequestParam(name = "page", required = false) Integer page,
						         @RequestParam(name = "size", required = false) Integer size
						         ) {
    	
    	Map<String, Object> params = new HashMap<>();
    	
    	params.put("offset", page * size);
 	    params.put("size", size);
 	    params.put("wpoId",	wpoId);
 	    
 	    List<Map<String, Object>> workerList = inspectionService.selectWorkerList(params);
 	    
 	    int wpoOcount = 0;
 	    
 	    if (!workerList.isEmpty() && workerList.get(0).get("WPO_OCOUNT") != null) {
 	        wpoOcount = ((Number) workerList.get(0).get("WPO_OCOUNT")).intValue();
 	    }

 	    // 
 	    Map<String, Object> result = new HashMap<>();
 	    result.put("list",      workerList); // 실적 목록
 	    result.put("wpoOcount", wpoOcount);  // 작업지시 수량

 	    return result;
    }
    
    // 실적 수정
    @PatchMapping("/workerCount")
    public ResponseEntity<?> updateWorkerCount(@RequestBody Map<String, Object> map) {
        
    	map.put("wreDate", LocalDateTime.now());
    	
    	System.out.println(map);
    	int updated = inspectionService.updateWorkerCount(map);
    	
    	System.out.println(updated);
        
        if (updated == 1) {
        	
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("update fail");
    }

}
