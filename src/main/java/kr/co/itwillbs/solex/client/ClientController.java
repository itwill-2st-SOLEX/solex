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
	    List<Map<String,Object>> clientList = clientService.getAllClients();

	    ObjectMapper mapper = new ObjectMapper();
	    mapper.registerModule(new JavaTimeModule()); // LocalDateTime 처리용

	    String clientJsonList = mapper.writeValueAsString(clientList);
	    model.addAttribute("clientList", clientJsonList);

	    return "client/list";
	}
	
	@PostMapping("")
	public ResponseEntity<Map<String, Object>> createClient(@RequestBody Map<String, Object> param, HttpSession session) {
		session.setAttribute("emp_id", "200");
		String emp_id = (String) session.getAttribute("emp_id");
		
		param.put("emp_id", emp_id);
		log.info(param);
	    // 1) 서비스에서 생성 로직 수행
		int rows = clientService.createClient(param);   // INSERT 결과

	    // 3) 결과에 따라 서로 다른 HTTP 코드·바디 반환
	    if (rows == 1) {
	        return ResponseEntity.status(HttpStatus.CREATED)   // 201
	                .body(Map.of(
	                        "success", true,
	                        "message", "거래처 등록 완료"));
	    } else {
	        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR) // 500
	                .body(Map.of(
	                        "success", false,
	                        "message", "거래처 생성 실패"));
	    }
	}
	
	 

	
	
	
	@GetMapping("/{cli_id}") // /{clientId} 경로 변수를 사용하여 클라이언트 ID를 받습니다.
    public ResponseEntity<Map<String, Object>> getClientDetail(@PathVariable("cli_id") int cli_id) {
		Map<String, Object> response = new HashMap<>();

        try {
            // 서비스 계층을 호출하여 clientId에 해당하는 거래처 정보를 가져옵니다.
            Map<String, Object> clientDetail = clientService.getClientById(cli_id);

            if (clientDetail != null && !clientDetail.isEmpty()) {
                // 정보가 성공적으로 조회되면 "OK" 상태와 데이터를 반환합니다.
                response.put("status", "OK");
                response.put("message", "거래처 상세 정보 조회 성공");
                response.put("data", clientDetail); // 조회된 거래처 데이터
                return ResponseEntity.ok(response); // HTTP 200 OK
            } else {
                // 해당 ID의 거래처를 찾을 수 없을 경우
                response.put("status", "NOT_FOUND");
                response.put("message", "해당 ID의 거래처를 찾을 수 없습니다: " + cli_id);
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response); // HTTP 404 Not Found
            }
        } catch (Exception e) {
            // 예외 발생 시 에러 응답을 반환합니다.
            response.put("status", "ERROR");
            response.put("message", "거래처 상세 정보 조회 중 오류 발생: " + e.getMessage());
            // 실제 운영 환경에서는 상세한 에러 메시지를 클라이언트에 직접 노출하지 않는 것이 좋습니다.
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response); // HTTP 500 Internal Server Error
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
