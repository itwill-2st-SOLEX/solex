package kr.co.itwillbs.solex.chats;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/chats")
public class ChatRestController {
	@Autowired
	ChatService service;
	
	// 사원 목록 조회
	@GetMapping("/emp")
	public List<Map<String,Object>> getEmpList () {
		return service.getEmpList();
	}
	
}
