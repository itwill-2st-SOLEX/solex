package kr.co.itwillbs.solex.chats;

import java.util.List;
import java.util.Map;import java.util.Scanner;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;

import jakarta.servlet.http.HttpSession;



@RestController
@RequestMapping("/chats")
public class ChatRestController {
	@Autowired
	ChatService service;
	
	// 사원 목록 조회
	@GetMapping("/emp")
	public List<Map<String,Object>> getEmpList (HttpSession session) {
		String empNum = (String)session.getAttribute("empNum");
		return service.getEmpList(empNum);
	}
	
	// 대화 목록 조회
	@GetMapping("/list")
	public List<Map<String, Object>> getChatList(HttpSession session) {
		String empNum = (String)session.getAttribute("empNum");
		return service.getChatList(empNum);
	}
	
	// 채팅방 메세지 불러오기
	@GetMapping("/history/{partnerId}")
	public List<Map<String, Object>> getChatHistory(@PathVariable("partnerId") String partnerId,
													HttpSession session) {
		String empNum = (String)session.getAttribute("empNum");
		return service.getChatHistory(empNum, partnerId);
	}
	
	// 채팅방 읽음 수정
	@PatchMapping("")
	public void chatRead(@RequestBody Map<String, Object> readInfo) {
		System.out.println("readInfo" + readInfo);
		service.chatRead(readInfo);
	}
	
	// 채팅방 나가기
	@DeleteMapping("/{roomId}")
	public void leaveChatRoom(@PathVariable("roomId") String roomId, 
						      @RequestBody Map<String, Object> chatInfo) {
		System.out.println("roomId" + roomId);
		System.out.println("chatInfo" + chatInfo);
	    service.leaveChatRoom(roomId, chatInfo);
	}
	
}
