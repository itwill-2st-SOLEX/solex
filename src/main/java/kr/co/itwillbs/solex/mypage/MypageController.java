package kr.co.itwillbs.solex.mypage;

import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import lombok.extern.log4j.Log4j2;

@Log4j2
@Controller
@RequestMapping("/mypage")
public class MypageController {
	
	// 마이페이지 
	@GetMapping("")
	public String Mypage() {
		return "mypage/mypage_main";
	}
	
	
	
}
