package kr.co.itwillbs.solex.Hr;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

import lombok.extern.log4j.Log4j2;

@Log4j2
@Controller
@RequestMapping("/hr")
public class HrController {
	
	@Autowired
	private HrService hrService;
	
	@GetMapping
	public String main() {
		return "hr/hr_main";
	}
	
	@GetMapping("/registration")
	public String register() {
		return "hr/hr_registration";
	}
	
	
	@PostMapping("/registration")
	public String register_post(@RequestParam Map<String, String> empMap) {
		System.out.println("============== empMap = " + empMap); //map은 생성됨
		
		int insertCount = 0;
		
		try {
		    insertCount = hrService.registerEmp(empMap); // 인스턴스를 통한 호출
		} catch(Exception e) {
		    e.printStackTrace();
		}
		
		if(insertCount > 0) {
			System.out.println("insert 성공 ");
			return "redirect:/Hr_registration";
		}else {
			//fail 이라는 거 띄우기
			return "result/fail";
		}
		
	}
	
	@GetMapping("/correction")
	public String correction() {
		return "hr/hr_correction";
	}
	@GetMapping("/modal")
	public String modal() {
		return "hr/hr_modal";
	}
}
