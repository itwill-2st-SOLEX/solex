package kr.co.itwillbs.solex.sales;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;

import jakarta.servlet.http.HttpSession;


@RestController
@RequestMapping("/orders")

public class OrderRestController {

	@Autowired
	OrderService orderService;
	
	@GetMapping("/gridData") // JavaScript에서 이 URL로 요청을 보낼 것임
	@ResponseBody
	public List<Map<String, Object>> getPagedGridData(
        @RequestParam(name = "page", defaultValue = "0") int page, // <-- name 속성 추가
        @RequestParam(name = "pageSize", defaultValue = "20") int pageSize, // <-- name 속성 추가
        @RequestParam(name = "searchKeyword", required = false) String searchKeyword // <-- name 속성 추가 (있다면)
    ) throws Exception {
        List<Map<String, Object>> list = orderService.getPagedGridDataAsMap(page, pageSize, searchKeyword);
        
        return list; 
    }
	
	@GetMapping("/clients")
	public List<Map<String, Object>> getSearchClientList(
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "pageSize", defaultValue = "20") int pageSize,
            @RequestParam(name = "searchKeyword", required = false) String searchKeyword,HttpSession session
    ) throws Exception {
        
        // 회원정보를 받아와서 emp_id값을 넣어줘야 됨 로그인 기능이 다 되면
        
		
		int emp_id = Integer.parseInt((String) session.getAttribute("empId")); // 만약 emp_id가 String이라면
		
        List<Map<String, Object>> list = orderService.getSearchClientList(page, pageSize, searchKeyword, emp_id);
        
        return list;
    }
	
	
	@GetMapping("/products")
	public List<Map<String, Object>> getSearchProductList(@RequestParam(name = "searchKeyword", required = false) String searchKeyword , HttpSession session
    ) throws Exception {
        

        List<Map<String, Object>> list = orderService.getSearchProductList(searchKeyword);
        return list;
    }
	
	
	
	@GetMapping("/product/{prd_id}")
	public List<Map<String, Object>> getOptionsByProduct(@PathVariable(name = "prd_id") String prd_id) {
		List<Map<String, Object>> list = orderService.getOptionsByProduct(prd_id);
		return list;
	}



	
	@PostMapping
	public ResponseEntity<Map<String, Object>> createOrder(@RequestBody Map<String, Object> param, HttpSession session) {
		String emp_id = (String) session.getAttribute("empId");		
		
		 // 화이트리스트 방식으로 안전한 Map 생성
	    Map<String, Object> safe = new HashMap<>();
	    safe.put("emp_id",       emp_id);
	    safe.put("cli_id",       param.get("cli_id"));     // JS에서 보낸 키 이름에 맞춰 가져오기
		safe.put("pay_type",       param.get("pay_type"));     // JS에서 보낸 키 이름에 맞춰 가져오기
	    
	    safe.put("ord_pay",      param.get("ord_pay"));
	    safe.put("ord_end_date", param.get("ord_end_date"));
	    safe.put("ord_pay_date", param.get("ord_pay_date"));
		
	    safe.put("ord_pc",       param.get("ord_pc"));
	    safe.put("ord_add",       param.get("ord_add"));
	    safe.put("ord_da",       param.get("ord_da"));
	    safe.put("items",       param.get("items"));
	    
	    int rows = orderService.createOrderProcess(safe); 
		Map<String, Object> response = new HashMap<>();

		if (rows >= 1) { 
		    response.put("status", "OK"); 
		    response.put("message", "수주 등록 완료");
		    return ResponseEntity.ok(response); 
		} else { 	
		    response.put("status", "ERROR"); 
		    response.put("message", "수주 등록 실패");
		    return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
		}
	}

	@PreAuthorize("hasAnyRole('1','2','3','4')")
	@PutMapping
	public ResponseEntity<Map<String, Object>> updateOrder(@RequestBody Map<String, Object> param, HttpSession session) {
		String emp_id = (String) session.getAttribute("empId");
		
		 // 화이트리스트 방식으로 안전한 Map 생성
	    Map<String, Object> safe = new HashMap<>();
	    safe.put("ord_id", param.get("ord_id"));
	    safe.put("emp_id",       emp_id);
	    safe.put("cli_id",       param.get("cli_id"));     // JS에서 보낸 키 이름에 맞춰 가져오기
		safe.put("pay_type",       param.get("pay_type"));     // JS에서 보낸 키 이름에 맞춰 가져오기
	    
	    safe.put("ord_pay",      param.get("ord_pay"));
	    safe.put("ord_end_date", param.get("ord_end_date"));
	    safe.put("ord_pay_date", param.get("ord_pay_date"));
		
	    safe.put("ord_pc",       param.get("ord_pc"));
	    safe.put("ord_add",       param.get("ord_add"));
	    safe.put("ord_da",       param.get("ord_da"));
	    safe.put("items",       param.get("items"));
	    
	    int rows = orderService.updateOrderProcess(safe); 
		Map<String, Object> response = new HashMap<>();

		if (rows >= 1) { 
		    response.put("status", "OK"); 
		    response.put("message", "수주 수정 완료");
		    return ResponseEntity.ok(response); 
		} else { 	
		    response.put("status", "ERROR"); 
		    response.put("message", "수주 수정 실패");
		    return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
		}
	}

	@GetMapping("/{ord_id}")
	public Map<String, Object> getOrderDetail(@PathVariable("ord_id") int ord_id) {
		Map<String, Object> orderData = orderService.getOrderDetail(ord_id);
		return orderData;
	}

	@PreAuthorize("hasAnyRole('1','2','3','4')")
	@DeleteMapping
	public ResponseEntity<Map<String, Object>> deleteOrders(@RequestBody List<Long> oddIds) {
		Map<String, Object> responseMap = new HashMap<>();
		List<Long> deletedIds = new ArrayList<>();
		List<Long> skippedIds = new ArrayList<>();
		try {
			// 서비스 계층에서 삭제 로직 호출
			// 서비스 메소드는 삭제 성공/실패 ID 목록을 반환하도록 설계
			Map<String, List<Long>> result = orderService.processBulkOrderDeletion(oddIds);
			deletedIds.addAll(result.get("deletedIds"));
			skippedIds.addAll(result.get("skippedIds"));

			responseMap.put("status", "SUCCESS");
			responseMap.put("deletedIds", deletedIds);
			responseMap.put("skippedIds", skippedIds);
			
			if (deletedIds.isEmpty() && !skippedIds.isEmpty()) {
				responseMap.put("message", "선택된 삭제할 수 없었습니다.");
			} else if (!deletedIds.isEmpty() && !skippedIds.isEmpty()) {
				responseMap.put("message", "일부 주문은 삭제할 수 없었으나, 나머지는 성공적으로 삭제되었습니다.");
			} else {
				responseMap.put("message", "선택된 주문이 성공적으로 삭제되었습니다.");
			}
			
			return new ResponseEntity<>(responseMap, HttpStatus.OK);

		} catch (Exception e) {
			// 예상치 못한 서버 내부 오류
			responseMap.put("status", "ERROR");
			responseMap.put("message", "서버 내부 오류: " + e.getMessage());
			return new ResponseEntity<>(responseMap, HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	
}
