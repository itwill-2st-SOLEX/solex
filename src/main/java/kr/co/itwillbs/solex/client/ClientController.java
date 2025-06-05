package kr.co.itwillbs.solex.client;

import java.util.Arrays;
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
@Controller
@RequestMapping("/clients")
public class ClientController {

	@Autowired
	ClientService clientService;
	
	@GetMapping("")
	public String getAllClients(Model model) throws Exception {
		log.info("이거 시작됨");
        Map<String, Object> initialParams = new HashMap<>();
        initialParams.put("limit", 30);
        initialParams.put("offset", 0);
        List<Map<String,Object>> clientList = clientService.selectClients(initialParams); // 서비스 호출

        ObjectMapper mapper = new ObjectMapper();
        mapper.registerModule(new JavaTimeModule()); // LocalDateTime 처리용

        String clientJsonList = mapper.writeValueAsString(clientList);
        model.addAttribute("clientList", clientJsonList); // JSON 문자열을 Model에 추가

        return "client/list"; // client/list.jsp 또는 client/list.html 뷰 반환
    }
	
    @GetMapping("/data") // 예: /clients/data?limit=20&offset=0&search_term=김미
    @ResponseBody
    public ResponseEntity<Map<String, Object>> getClientsData(@RequestParam Map<String, Object> params) {
        log.info("API - 거래처 목록 조회 요청 파라미터: {}", params);

        Map<String, Object> response = new HashMap<>();

        try {
            List<Map<String,Object>> clients = clientService.selectClients(params);

            response.put("status", "OK");
            response.put("message", "거래처 목록 조회 성공");
            response.put("data", clients); // 조회된 클라이언트 리스트
            return ResponseEntity.ok(response); // HTTP 200 OK, JSON 응답
        } catch (Exception e) {
            log.error("API - 거래처 목록 조회 중 오류 발생: {}", e.getMessage(), e);
            response.put("status", "ERROR");
            response.put("message", "거래처 목록 조회 중 오류 발생: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
	
	@PostMapping("")
	public ResponseEntity<Map<String, Object>> createClient(@RequestBody Map<String, Object> param, HttpSession session) {
		session.setAttribute("emp_id", "200");
		String emp_id = (String) session.getAttribute("emp_id");
		
		param.put("emp_id", emp_id);
		log.info(param);
		
		int rows = clientService.createClient(param);   
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
	
	
	@GetMapping("/{cli_id}") 
    public ResponseEntity<Map<String, Object>> getClientDetail(@PathVariable("cli_id") int cli_id) {
		Map<String, Object> response = new HashMap<>();
        try {
            Map<String, Object> clientDetail = clientService.getClientById(cli_id);

            if (clientDetail != null && !clientDetail.isEmpty()) {
                response.put("status", "OK");
                response.put("message", "거래처 상세 정보 조회 성공");
                response.put("data", clientDetail); 
                return ResponseEntity.ok(response); 
            } else {
                response.put("status", "NOT_FOUND");
                response.put("message", "해당 ID의 거래처를 찾을 수 없습니다: " + cli_id);
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response); 
            }
        } catch (Exception e) {
            response.put("status", "ERROR");
            response.put("message", "거래처 상세 정보 조회 중 오류 발생: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response); // HTTP 500 Internal Server Error
        }
	}
	
	@PutMapping("/{cli_id}")
    public ResponseEntity<Map<String, Object>> updateClient(@PathVariable("cli_id") int cli_id, @RequestBody Map<String , Object> param) {
		Map<String, Object> response = new HashMap<>();

        try {

            int rowAffected = clientService.updateClient(param);
            log.info(rowAffected);

            if (rowAffected > 0) {
                response.put("status", "OK");
                response.put("message", "거래처 정보 수정 성공");
                return ResponseEntity.ok(response); // HTTP 200 OK
            } else {
                response.put("status", "NOT_FOUND");
                response.put("message", "해당 ID의 거래처를 찾을 수 없거나 수정에 실패했습니다: " + cli_id);
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response); 
            }
        } catch (Exception e) {
            log.error("거래처 정보 수정 중 오류 발생: " + e.getMessage(), e);
            response.put("status", "ERROR");
            response.put("message", "거래처 정보 수정 중 오류 발생: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response); 
        }
	}
	
	
	@GetMapping("/client-types")
	@ResponseBody
	public List<Map<String, String>> getClientType() throws Exception {
		return Arrays.stream(ClientType.values())
		        .map(ct -> Map.of(
		            "code", ct.name(),
		            "name", ct.getLabel()
		        ))
		        .collect(Collectors.toList());
	}
	
	@PostMapping("/check-biz")
	@ResponseBody
	 public ResponseEntity<Map<String, Object>> checkBiz(@RequestBody Map<String, String> request) {
		log.info("정보 받아옴");
        String bizNumber = request.get("bizNumber");
        log.info("정보 받아옴"+bizNumber);
        Map<String, Object>  taxType = clientService.queryBizNumber(bizNumber);
        log.info("taxType : "+taxType);
        return ResponseEntity.ok(Map.of("taxType", taxType));
    }
	
	
	
	
	
	
	
	
}
