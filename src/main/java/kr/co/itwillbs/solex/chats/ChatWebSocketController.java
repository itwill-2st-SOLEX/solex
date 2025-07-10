package kr.co.itwillbs.solex.chats;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

@Controller
public class ChatWebSocketController {

	@Autowired
	SimpMessagingTemplate template;
	@Autowired
	ChatService service;
	
	// 메세지 디비 저장
	@MessageMapping("/chat.send")
	public void sendMessage(@Payload Map<String, Object> message) {
		String roomId = (String) message.get("roomId");

		service.saveMessage(message);
		// 여기서 직접 전송 (roomId가 포함된 경로로)
		template.convertAndSend("/topic/chatroom/" + roomId, message);
	}
}
