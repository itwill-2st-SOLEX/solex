package kr.co.itwillbs.solex.orderrequest;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import jakarta.servlet.http.HttpSession;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;


@RestController
@RequestMapping("/order-requests")
public class OrderRequestsRestController {

	@Autowired
	OrderRequestsService orderRequestsService;
	
	@GetMapping("/data") // 
	public List<Map<String, Object>> getPagedGridData(
        @RequestParam(name = "page", defaultValue = "0") int page, // 
        @RequestParam(name = "pageSize", defaultValue = "20") int pageSize
    ) throws Exception {
        List<Map<String, Object>> list = orderRequestsService.getPagedGridDataAsMap(page, pageSize);
        System.out.println(list);
        return list; 
    }
	
	@GetMapping("{odd_id}") // 
	public List<Map<String, Object>> getOrderDetail(@PathVariable("odd_id") String odd_id) throws Exception {
		List<Map<String, Object>> list = orderRequestsService.getOrderDetail(odd_id);
		return list; 
	}
	
	@PostMapping // 1.재고 조회, 2.재고 차감, 3.상태 변경
	public ResponseEntity<String> updateOrderStatus(@RequestBody Map<String, Object> params) throws Exception {		
		try {
            // 서비스 메소드 호출 (리턴값이 없으므로 변수에 담지 않음)
            orderRequestsService.updateOrderStatus(params);
            
            // 예외가 발생하지 않고 여기까지 왔다면 성공한 것.
            return ResponseEntity.ok("정상적으로 처리되었습니다.");

        } catch (RuntimeException e) {
            // 서비스에서 던진 RuntimeException을 여기서 잡습니다.
            // 클라이언트에게 "재고 부족" 등의 실제 오류 메시지를 전달합니다.
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        
        } catch (Exception e) {
            // 그 외 예측하지 못한 다른 모든 예외 처리
            e.printStackTrace(); // 서버 로그에 전체 오류 기록
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("서버 내부 오류가 발생했습니다.");
        }
	}


    // 자재 요청
    @PostMapping("/material-request") 
    public ResponseEntity<String> orderMaterialRequest(@RequestBody Map<String, Object> params, HttpSession httpSession) throws Exception {        
        try {
            // 서비스 메소드 호출 (리턴값이 없으므로 변수에 담지 않음)
            params.put("emp_id", httpSession.getAttribute("empId"));
            orderRequestsService.orderMaterialRequest(params);
            
            // 예외가 발생하지 않고 여기까지 왔다면 성공한 것.
            return ResponseEntity.ok("정상적으로 처리되었습니다.");

        } catch (RuntimeException e) {
            // 서비스에서 던진 RuntimeException을 여기서 잡습니다.
            // 클라이언트에게 "재고 부족" 등의 실제 오류 메시지를 전달합니다.
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        
        } catch (Exception e) {
            // 그 외 예측하지 못한 다른 모든 예외 처리
            e.printStackTrace(); // 서버 로그에 전체 오류 기록
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("서버 내부 오류가 발생했습니다.");
        }
    }


    // 자재 확인
    @PostMapping("/check-material") 
    public ResponseEntity<String> checkOrderMaterial(@RequestBody Map<String, Object> params) throws Exception {        
        try {
            orderRequestsService.checkMaterial(params);
            // 모든 자재가 등록되어 있으면 성공 메시지 반환
            return new ResponseEntity<>("모든 자재가 성공적으로 확인되었습니다.", HttpStatus.OK);
        } catch (RuntimeException e) {
            // 재고가 등록되지 않은 경우 예외 메시지와 함께 400 Bad Request 반환
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            // 그 외 예상치 못한 예외 처리
            return new ResponseEntity<>("알 수 없는 오류가 발생했습니다: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
