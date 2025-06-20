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
import lombok.extern.log4j.Log4j2;



@Log4j2
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
	
	
	
	@GetMapping("/prd_cd/{prd_cd}")
	public List<Map<String, Object>> getColorsByProduct(@PathVariable(name = "prd_cd") String prd_cd) {
		return orderService.getColors(prd_cd);
	}
	@GetMapping("/prd_cd/{prd_cd}/color/{color}")
	public List<Map<String, Object>> getSizesByProductColor(@PathVariable(name = "prd_cd") String prd_cd,@PathVariable(name = "color") String color) {
		return orderService.getSizesByProductAndColor(prd_cd,color);
	}
	
	@GetMapping("/prd_cd/{prd_cd}/color/{color}/size/{size}")
	public List<Map<String, Object>> getHeightsByProductColorSize(
			@PathVariable(name = "prd_cd") String prd_cd,
			@PathVariable(name = "color") String color,
			@PathVariable(name = "size") String size
			) {
		return orderService.getHeightsByProductColorSize(prd_cd,color,size);
	}
	@GetMapping("/prd_cd/{prd_cd}/color/{color}/size/{size}/height/{height}")
	public int getStockCount(
			@PathVariable(name = "prd_cd") String prd_cd,
			@PathVariable(name = "color") String color,
			@PathVariable(name = "size") String size,
			@PathVariable(name = "height") String height
			) {
		int count = orderService.getStockCount(prd_cd,color,size,height);
		
		return count;
	}
	
	@PostMapping("/check-stock")
    public List<Map<String, Object>> checkStock(@RequestBody Map<String, Object> orderData) {
		List<Map<String ,Object>> result = orderService.checkLackingMaterials(orderData);
		
        return result;
    }
	
	@PostMapping
	public ResponseEntity<Map<String, Object>> createOrder(@RequestBody Map<String, Object> param, HttpSession session) {
		
		session.setAttribute("emp_id", "201");
		String emp_id = (String) session.getAttribute("emp_id");		
		
		 // 화이트리스트 방식으로 안전한 Map 생성
	    Map<String, Object> safe = new HashMap<>();
	    safe.put("cli_id",       param.get("cli_id"));     // JS에서 보낸 키 이름에 맞춰 가져오기
	    safe.put("prd_cd",       param.get("prd_cd"));
	    safe.put("odd_cnt",      param.get("odd_cnt"));
	    safe.put("odd_pay",      param.get("odd_pay"));
	    safe.put("odd_end_date", param.get("odd_end_date"));
	    safe.put("odd_pay_date", param.get("odd_pay_date"));
	    safe.put("odd_pc",       param.get("odd_pc"));
	    safe.put("odd_add",       param.get("odd_add"));
	    safe.put("odd_da",       param.get("odd_da"));
	    
	    safe.put("opt_color",       param.get("opt_color"));
	    safe.put("opt_size",       param.get("opt_size"));
	    safe.put("opt_height",       param.get("opt_height"));
		safe.put("stk_cn",       param.get("stk_cn"));
	    
	    safe.put("emp_id",       emp_id);
	    
	    
	    
	    int rows = orderService.createOrderProcess(safe); 
		Map<String, Object> response = new HashMap<>();

		if (rows == 1) { 
		    response.put("status", "OK"); 
		    response.put("message", "거래처 등록 완료");
		    return ResponseEntity.ok(response); 
		} else { 
		    response.put("status", "ERROR"); 
		    response.put("message", "거래처 생성 실패");
		    return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
		}
	}
	
}
