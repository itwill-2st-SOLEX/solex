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
import org.springframework.security.access.prepost.PreAuthorize;
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
@PreAuthorize("hasAnyRole('1','2','3','4')")
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
	@GetMapping("/data")
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
	
	@PostMapping()
	public ResponseEntity<?> getDefectiveCountByWarehouse(@RequestBody Map<String, Object> map) {
		
		List<Map<String, Object>> resultList = inspectionService.getDefectiveCountByWarehouse(map);
		System.out.println(resultList.get(0).get("STATUS"));
		// resultList의 status가 출고 가능한지 확인
		if (resultList.isEmpty() || resultList.get(0).get("STATUS") == null || "출고 불가능".equals(resultList.get(0).get("STATUS"))) {
			return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("출고 불가능한 상태이거나 재고를 초과할 수 없습니다.");
		}
		
		return ResponseEntity.ok(resultList);
	}
	
	
	@PostMapping("/outbound")
    public ResponseEntity<Map<String, Object>> processStockOutbound(@RequestBody Map<String, Object> requestBody) {
        try {
            // 요청 바디에서 oddId와 qhiBcount 추출
            // JSON Number는 Java에서 Integer, Long, Double 등으로 파싱될 수 있으므로,
            // 명시적으로 Long으로 변환하는 것이 안전합니다.
            Long oddId = ((Number) requestBody.get("oddId")).longValue();
            Long qhiBcount = ((Number) requestBody.get("qhiBcount")).longValue();

            // 서비스 계층의 프로시저 실행 메소드 호출
            Map<String, Object> result = inspectionService.executeOutboundProcedure(oddId, qhiBcount);

            // 프로시저 반환 결과에서 상태 코드와 메시지 추출
            String statusCode = (String) result.get("oStatusCode");
            String statusMessage = (String) result.get("oStatusMessage");

            // 상태 코드에 따라 적절한 HTTP 상태 코드와 응답 반환
            if ("SUCCESS".equals(statusCode)) {
                return new ResponseEntity<>(result, HttpStatus.OK);
            } else if ("NOT_ENOUGH_STOCK".equals(statusCode)) {
                return new ResponseEntity<>(result, HttpStatus.BAD_REQUEST); // 400 Bad Request
            } else if ("NOT_FOUND_DATA".equals(statusCode)) {
                return new ResponseEntity<>(result, HttpStatus.NOT_FOUND); // 404 Not Found
            } else {
                // 기타 프로시저 내부 오류 또는 예상치 못한 상태
                return new ResponseEntity<>(result, HttpStatus.INTERNAL_SERVER_ERROR); // 500 Internal Server Error
            }

        } catch (ClassCastException | NullPointerException e) {
            // 요청 바디의 데이터 타입이 예상과 다르거나 필수 필드가 누락된 경우
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("oStatusCode", "ERROR");
            errorResponse.put("oStatusMessage", "요청 파라미터 형식 오류 또는 누락: " + e.getMessage());
            return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            // 그 외 예상치 못한 서버 처리 중 예외 발생
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("oStatusCode", "ERROR");
            errorResponse.put("oStatusMessage", "서버 처리 중 예외 발생: " + e.getMessage());
            return new ResponseEntity<>(errorResponse, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
	
	// 작업 순서 업데이트
	@PatchMapping("/updateStatus")
	public ResponseEntity<?> updateStatus(@RequestBody Map<String, Object> map) {
		
		inspectionService.updateStatus(map);
		
		return ResponseEntity.ok().build();
	}
	
    

}
