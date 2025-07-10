package kr.co.itwillbs.solex.chats;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.GetMapping;


@Controller
@RequestMapping("/chats")
public class ChatController {
	
	@GetMapping("")
	public String Chat() {
		return "chat/chat";
	}
	
}
