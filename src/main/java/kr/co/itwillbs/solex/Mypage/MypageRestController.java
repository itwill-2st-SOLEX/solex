package kr.co.itwillbs.solex.Mypage;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import lombok.extern.log4j.Log4j2;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;


@Log4j2
@RestController
@RequestMapping("/mypage")
public class MypageRestController {
	
	//로그인 된 회원의 정보 가져오기
	@GetMapping("/codes/{empNum}")
	public String getMethodName(@RequestParam String param) {
		return new String();
	}
	
	
}
