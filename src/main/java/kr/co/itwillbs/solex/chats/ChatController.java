package kr.co.itwillbs.solex.chats;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;


@Controller
@RequestMapping("/chats")
public class ChatController {
	
	@GetMapping("")
	public String Chat() {
		return "chat/chat";
	}
	
}
