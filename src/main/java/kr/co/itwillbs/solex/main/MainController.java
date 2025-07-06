package kr.co.itwillbs.solex.main;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.SessionAttribute;

@Controller
public class MainController {
	
	
	@Autowired
	private MainService mainService;
	
	
	//메인 화면 띄우기
		@GetMapping("/")
		public String getMainPage(Model model, @SessionAttribute("empId") Long empId) {
		
	    	
			Map<String, Object> emp = mainService.selectEmpInfo(empId);

		    // 분류 로직 ‑ 예시 : 부서코드가 “dep_erp” 로 시작하면 ERP, 아니면 MES
		    String userType = String.valueOf(emp.get("empDepCd")).startsWith("dep_erp") ? "ERP" : "MES";

		    model.addAttribute("userType", userType);   // 뷰로 전달
		    
			return "index";
		}

}
