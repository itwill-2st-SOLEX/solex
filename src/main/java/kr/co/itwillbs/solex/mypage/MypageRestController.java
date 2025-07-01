package kr.co.itwillbs.solex.mypage;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.servlet.http.HttpSession;
import lombok.extern.log4j.Log4j2;



@Log4j2
@RestController
@RequestMapping("/mypage")
public class MypageRestController {
	
	@Autowired
	private MypageService mypageService; 
	
	//로그인 된 회원의 정보 가져오기
	@GetMapping("/empData")
	public Map<String, Object> getEmpData(HttpSession session) {
		
		String empNum = (String) session.getAttribute("empNum");
		System.out.println("empNUm = " + empNum);
		Map<String, Object> empData = mypageService.getEmpData(empNum); 
		System.out.println("@@@@@@@@@@@@@@@ " + empData);
		return empData;
	}
	
	//마이페이지 수정 
	@PutMapping("/personalDataModify")
	public void putMethodName(@RequestBody Map<String, Object> personalModifyMap, HttpSession session) {
		String empNum = (String) session.getAttribute("empNum");
		personalModifyMap.put("emp_num", empNum);
		System.out.println("personalModify = " + personalModifyMap);
		mypageService.personalDataModify(personalModifyMap);
	}
	
	
}
