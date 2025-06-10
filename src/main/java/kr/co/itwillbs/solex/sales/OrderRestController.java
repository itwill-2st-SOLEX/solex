package kr.co.itwillbs.solex.sales;

import java.util.Arrays;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;

import jakarta.servlet.http.HttpSession;
import lombok.extern.log4j.Log4j2;
import org.springframework.web.bind.annotation.RequestParam;



@Log4j2
@RestController
@RequestMapping("/orders")
public class OrderRestController {

	@Autowired
	OrderService orderService;
	
	@PostMapping
	public ResponseEntity<Map<String, Object>> createOrder(@RequestBody Map<String, Object> param, HttpSession session) {
		log.info("param = {}", param);
		
		session.setAttribute("emp_id", "201");
		String emp_id = (String) session.getAttribute("emp_id");		
		
		 // 화이트리스트 방식으로 안전한 Map 생성
	    Map<String, Object> safe = new HashMap<>();
	    safe.put("cli_id",       param.get("selectClientCd"));     // JS에서 보낸 키 이름에 맞춰 가져오기
	    safe.put("prd_cd",       param.get("selectProductCd"));
	    safe.put("odd_cnt",      param.get("orderCnt"));
	    safe.put("odd_pay",      param.get("payAmt"));
	    safe.put("odd_end_date", param.get("deliverDate"));
	    safe.put("odd_pay_date", param.get("payDate"));
	    safe.put("odd_pc",       param.get("postCode"));
	    safe.put("odd_add",       param.get("postAdd"));
	    safe.put("odd_da",       param.get("postDetail"));
	    safe.put("emp_id",       emp_id);

	    log.info("safe param = {}", safe);
	    
	    
	    
	    int rows = orderService.createOrder(safe); 
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
	
	
	
	@GetMapping("/gridData") // JavaScript에서 이 URL로 요청을 보낼 것임
	@ResponseBody
	public List<Map<String, Object>> getPagedGridData(
        @RequestParam(name = "page", defaultValue = "0") int page, // <-- name 속성 추가
        @RequestParam(name = "pageSize", defaultValue = "20") int pageSize, // <-- name 속성 추가
        @RequestParam(name = "searchKeyword", required = false) String searchKeyword // <-- name 속성 추가 (있다면)
    ) throws Exception {
        log.info("API - 그리드 데이터 조회 요청 파라미터: page={}, pageSize={}, searchKeyword={}", page, pageSize, searchKeyword);
        List<Map<String, Object>> list = orderService.getPagedGridDataAsMap(page, pageSize, searchKeyword);
        log.info("API - 그리드 데이터 조회 결과: list={}",list);
        
        return list; 
    }
	
	@GetMapping("/clients")
	public List<Map<String, Object>> getSearchClientList(
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "pageSize", defaultValue = "20") int pageSize,
            @RequestParam(name = "searchKeyword", required = false) String searchKeyword
    ) throws Exception {
        log.info("API - 그리드 데이터 조회 요청 파라미터: page={}, pageSize={}, searchKeyword={}", page, pageSize, searchKeyword);
        
        // 회원정보를 받아와서 emp_id값을 넣어줘야 됨 로그인 기능이 다 되면
        int emp_id = 2000;
        List<Map<String, Object>> list = orderService.getSearchClientList(page, pageSize, searchKeyword, emp_id);
        
        log.info("API - 그리드 데이터 조회 결과 건수: {}", list.size());
        log.info("API - 그리드 데이터 조회 결과 건수: {}", list);
        return list;
    }
	
	
	@GetMapping("/products")
	public List<Map<String, Object>> getSearchProductList(
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "pageSize", defaultValue = "20") int pageSize,
            @RequestParam(name = "searchKeyword", required = false) String searchKeyword
    ) throws Exception {
        log.info("API - 그리드 데이터 조회 요청 파라미터: page={}, pageSize={}, searchKeyword={}", page, pageSize, searchKeyword);
        
        // 회원정보를 받아와서 emp_id값을 넣어줘야 됨 로그인 기능이 다 되면
        int emp_id = 2000;
        
        List<Map<String, Object>> list = orderService.getSearchProductList(page, pageSize, searchKeyword);
        
        log.info("API - 그리드 데이터 조회 결과 건수: {}", list.size());
        log.info("API - 그리드 데이터 조회 결과 건수: {}", list);
        return list;
    }
	
	@GetMapping("/stock")
	public ResponseEntity<Map<String, Integer>> getStockCount(@RequestParam(name = "productCode") String productCode) {
        log.info("API - 재고 조회 요청 파라미터: productCode={}", productCode);

        // 서비스는 int를 리턴하도록 변경
        int count = orderService.getStockCount(productCode);
        
        log.info("API - 재고 조회 요청 파라미터: count={} ", count);
        
        // 키를 stockCount로 하는 Map 으로 감싸서 반환
        Map<String, Integer> body = Collections.singletonMap("stockCount", count);
        return ResponseEntity.ok(body);
    }
	
	
	
//  Map<String, Object> initialParams = new HashMap<>();
//  initialParams.put("limit", 30);
//  initialParams.put("offset", 0);
//  List<Map<String,Object>> clientList = clientService.selectClients(initialParams); // 서비스 호출
//
//  ObjectMapper mapper = new ObjectMapper();
//  mapper.registerModule(new JavaTimeModule()); // LocalDateTime 처리용
//
//  String clientJsonList = mapper.writeValueAsString(clientList);
//  model.addAttribute("clientList", clientJsonList); // JSON 문자열을 Model에 추가
	
	
	
	
	
	
//    @GetMapping("/data") // 예: /clients/data?limit=20&offset=0&search_term=김미
//    @ResponseBody
//    public ResponseEntity<Map<String, Object>> getClientsData(@RequestParam Map<String, Object> params) {
//        log.info("API - 거래처 목록 조회 요청 파라미터: {}", params);
//
//        Map<String, Object> response = new HashMap<>();
//
//        try {
//            List<Map<String,Object>> clients = clientService.selectClients(params);
//
//            response.put("status", "OK");
//            response.put("message", "거래처 목록 조회 성공");
//            response.put("data", clients); // 조회된 클라이언트 리스트
//            return ResponseEntity.ok(response); // HTTP 200 OK, JSON 응답
//        } catch (Exception e) {
//            log.error("API - 거래처 목록 조회 중 오류 발생: {}", e.getMessage(), e);
//            response.put("status", "ERROR");
//            response.put("message", "거래처 목록 조회 중 오류 발생: " + e.getMessage());
//            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
//        }
//    }
//	
//	@PostMapping("")
//	public ResponseEntity<Map<String, Object>> createClient(@RequestBody Map<String, Object> param, HttpSession session) {
//		session.setAttribute("emp_id", "200");
//		String emp_id = (String) session.getAttribute("emp_id");
//		
//		param.put("emp_id", emp_id);
//		log.info(param);
//		
//		int rows = clientService.createClient(param);   
//		Map<String, Object> response = new HashMap<>();
//
//		if (rows == 1) { 
//		    response.put("status", "OK"); 
//		    response.put("message", "거래처 등록 완료");
//		    return ResponseEntity.ok(response); 
//		} else { 
//		    response.put("status", "ERROR"); 
//		    response.put("message", "거래처 생성 실패");
//		    return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
//		}
//	}
//	
//	
	
	// 이거 클릭하면 뜨게 하자
//	@GetMapping("/clientList") 
//    public ResponseEntity<Map<String, Object>> getClientDetail(@PathVariable("cli_id") int cli_id) {
//		Map<String, Object> response = new HashMap<>();
//        try {
//            Map<String, Object> clientDetail = clientService.getClientById(cli_id);
//
//            if (clientDetail != null && !clientDetail.isEmpty()) {
//                response.put("status", "OK");
//                response.put("message", "거래처 상세 정보 조회 성공");
//                response.put("data", clientDetail); 
//                return ResponseEntity.ok(response); 
//            } else {
//                response.put("status", "NOT_FOUND");
//                response.put("message", "해당 ID의 거래처를 찾을 수 없습니다: " + cli_id);
//                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response); 
//            }
//        } catch (Exception e) {
//            response.put("status", "ERROR");
//            response.put("message", "거래처 상세 정보 조회 중 오류 발생: " + e.getMessage());
//            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response); // HTTP 500 Internal Server Error
//        }
//	}
//	
//	@PutMapping("/{cli_id}")
//    public ResponseEntity<Map<String, Object>> updateClient(@PathVariable("cli_id") int cli_id, @RequestBody Map<String , Object> param) {
//		Map<String, Object> response = new HashMap<>();
//
//        try {
//
//            int rowAffected = clientService.updateClient(param);
//            log.info(rowAffected);
//
//            if (rowAffected > 0) {
//                response.put("status", "OK");
//                response.put("message", "거래처 정보 수정 성공");
//                return ResponseEntity.ok(response); // HTTP 200 OK
//            } else {
//                response.put("status", "NOT_FOUND");
//                response.put("message", "해당 ID의 거래처를 찾을 수 없거나 수정에 실패했습니다: " + cli_id);
//                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response); 
//            }
//        } catch (Exception e) {
//            log.error("거래처 정보 수정 중 오류 발생: " + e.getMessage(), e);
//            response.put("status", "ERROR");
//            response.put("message", "거래처 정보 수정 중 오류 발생: " + e.getMessage());
//            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response); 
//        }
//	}
//	
//	
//	@GetMapping("/client-types")
//	@ResponseBody
//	public List<Map<String, String>> getClientType() throws Exception {
//		return Arrays.stream(ClientType.values())
//		        .map(ct -> Map.of(
//		            "code", ct.name(),
//		            "name", ct.getLabel()
//		        ))
//		        .collect(Collectors.toList());
//	}
//	
//	@PostMapping("/check-biz")
//	@ResponseBody
//	 public ResponseEntity<Map<String, Object>> checkBiz(@RequestBody Map<String, String> request) {
//		log.info("정보 받아옴");
//        String bizNumber = request.get("bizNumber");
//        log.info("정보 받아옴"+bizNumber);
//        Map<String, Object>  taxType = clientService.queryBizNumber(bizNumber);
//        log.info("taxType : "+taxType);
//        return ResponseEntity.ok(Map.of("taxType", taxType));
//    }
//	
//	
	
	
	
	
	
	
}
