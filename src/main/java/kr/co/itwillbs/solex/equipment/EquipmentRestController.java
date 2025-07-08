package kr.co.itwillbs.solex.equipment;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;


@RestController
@RequestMapping("/equipment")
@PreAuthorize("hasAnyRole('1','2','3','4')")
public class EquipmentRestController {

	@Autowired
	EquipmentService equipmentService;
	
	@GetMapping("/name") // 
	public List<Map<String, Object>> getEquipmentName() {
		return equipmentService.getEquipmentName();
    }
	
	@GetMapping("/data") // 
	public List<Map<String, Object>> getPagedGridData(
        @RequestParam(name = "page", defaultValue = "0") int page, // 
        @RequestParam(name = "pageSize", defaultValue = "20") int pageSize
    ) throws Exception {
        List<Map<String, Object>> list = equipmentService.getPagedGridDataAsMap(page, pageSize);
        return list; 
    }
	
	@GetMapping("/form-data") // 
	public Map<String, Object> getFormData() throws Exception {
        Map<String, Object> list = equipmentService.getFormData();
        return list; 
    }
	
	@PostMapping
	public ResponseEntity<String> createEquipment(@RequestBody Map<String, Object> params) throws Exception {	

    try {
          // 서비스 메소드 호출 (리턴값이 없으므로 변수에 담지 않음)
			equipmentService.createEquipment(params);
          
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
	
	
//	
	@GetMapping("{eqp_code}") // 
	public List<Map<String, Object>> getEquipmentDetail(@PathVariable("eqp_code") String eqp_code) throws Exception {
		List<Map<String, Object>> list = equipmentService.getEquipmentDetail(eqp_code);
		return list; 
	}


    @PatchMapping("/{eqp_code}")
	public ResponseEntity<String> updateEquipment(@PathVariable("eqp_code") String eqp_code, @RequestBody Map<String, Object> params) throws Exception {
        try {
            // 서비스 메소드 호출 (리턴값이 없으므로 변수에 담지 않음)
            params.put("eqp_code", eqp_code);

            equipmentService.updateEquipment(params);
            
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

    @GetMapping("/{processId}/teams") // 
	public List<Map<String, Object>> getTeam(@PathVariable("processId") int processId) throws Exception {
		List<Map<String, Object>> list = equipmentService.getTeam(processId);
		return list; 
	}
    
    
    




//	
//	@PostMapping // 1.재고 조회, 2.재고 차감, 3.상태 변경
//	public ResponseEntity<String> updateOrderStatus(@RequestBody Map<String, Object> params) throws Exception {		
//		try {
//            // 서비스 메소드 호출 (리턴값이 없으므로 변수에 담지 않음)
//            orderRequestsService.updateOrderStatus(params);
//            
//            // 예외가 발생하지 않고 여기까지 왔다면 성공한 것.
//            return ResponseEntity.ok("정상적으로 처리되었습니다.");
//
//        } catch (RuntimeException e) {
//            // 서비스에서 던진 RuntimeException을 여기서 잡습니다.
//            // 클라이언트에게 "재고 부족" 등의 실제 오류 메시지를 전달합니다.
//            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
//        
//        } catch (Exception e) {
//            // 그 외 예측하지 못한 다른 모든 예외 처리
//            e.printStackTrace(); // 서버 로그에 전체 오류 기록
//            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("서버 내부 오류가 발생했습니다.");
//        }
//	}
}