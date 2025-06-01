package kr.co.itwillbs.solex.code;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@RequestMapping("/SOLEX")
public class CodeController {
	
	@Autowired
	private CodeService codeService;

	@GetMapping("/code")
	public String showCommonCodeList(Model model) {
		
		List<CodeDTO> codeList = codeService.getCodeList();
		
		System.out.println("코드리스트 : " + codeList);
		
		model.addAttribute("codeList", codeList);
		
		return "code/code";
	}
	
	
}
