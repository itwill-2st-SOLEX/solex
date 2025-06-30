package kr.co.itwillbs.solex.sales;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.GetMapping;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;

import lombok.extern.log4j.Log4j2;



@Log4j2
@Controller
@RequestMapping("/clients")
public class ClientController {

	@Autowired
	ClientService clientService;
	
	@GetMapping
	public String getAllClients(Model model) throws Exception {
        Map<String, Object> initialParams = new HashMap<>();
        initialParams.put("limit", 30);
        initialParams.put("offset", 0);
        List<Map<String,Object>> clientList = clientService.selectClients(initialParams); // 서비스 호출

        ObjectMapper mapper = new ObjectMapper();
        mapper.registerModule(new JavaTimeModule()); // LocalDateTime 처리용

        String clientJsonList = mapper.writeValueAsString(clientList);
        model.addAttribute("clientList", clientJsonList); // JSON 문자열을 Model에 추가

        return "sales/clientList"; // client/list.jsp 또는 client/list.html 뷰 반환
    }
	
}
