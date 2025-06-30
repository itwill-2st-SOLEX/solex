package kr.co.itwillbs.solex.sales;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
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
            @RequestParam(name = "searchKeyword", required = false) String searchKeyword
    ) throws Exception {
        
        // 회원정보를 받아와서 emp_id값을 넣어줘야 됨 로그인 기능이 다 되면
        int emp_id = 2000;
        List<Map<String, Object>> list = orderService.getSearchClientList(page, pageSize, searchKeyword, emp_id);
        
        return list;
    }
	
	
	@GetMapping("/products")
	public List<Map<String, Object>> getSearchProductList(@RequestParam(name = "searchKeyword", required = false) String searchKeyword
    ) throws Exception {
        
        // 회원정보를 받아와서 emp_id값을 넣어줘야 됨 로그인 기능이 다 되면
        int emp_id = 2000;
        
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
		
		session.setAttribute("emp_id", "201");
		String emp_id = (String) session.getAttribute("emp_id");		
		
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

	@GetMapping("/{ord_id}")
	public Map<String, Object> getOrderDetail(@PathVariable("ord_id") int ord_id) {
		Map<String, Object> orderData = orderService.getOrderDetail(ord_id);
		return orderData;
	}

	
}
