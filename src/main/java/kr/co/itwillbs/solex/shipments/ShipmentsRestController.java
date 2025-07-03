package kr.co.itwillbs.solex.shipments;

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
@RequestMapping("/shipments")
public class ShipmentsRestController {

	@Autowired
	ShipmentsService shipmentsService;

	
	@GetMapping("/data") // 
	public List<Map<String, Object>> getPagedGridData(
        @RequestParam(name = "page", defaultValue = "0") int page, // 
        @RequestParam(name = "pageSize", defaultValue = "20") int pageSize
    ) throws Exception {
        List<Map<String, Object>> list = shipmentsService.getPagedGridDataAsMap(page, pageSize);
        return list; 
    }


    @PostMapping
    public ResponseEntity<String> createOrderRequest(@RequestBody Map<String, Object> params, HttpSession httpSession) throws Exception {
        try {
            String emp_id = (String) httpSession.getAttribute("empId");
            params.put("emp_id", emp_id);
            System.out.println(params);
            shipmentsService.createOrderRequest(params);
            return ResponseEntity.ok("정상적으로 처리되었습니다.");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("서버 내부 오류가 발생했습니다.");
        }
    }




	
	@GetMapping("{odd_id}") // 
	public List<Map<String, Object>> getOrderDetail(@PathVariable("odd_id") String odd_id) throws Exception {
		List<Map<String, Object>> list = shipmentsService.getOrderDetail(odd_id);
		return list; 
	}
	
}
