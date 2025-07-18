package kr.co.itwillbs.solex.code;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class CodeController {
	
	// 공통코드 화면 이동
	@GetMapping("/code")
	@PreAuthorize("hasAnyRole('1')")
	public String getCodeList(Model model) throws Exception {
		return "code/code";
	}
	
}
