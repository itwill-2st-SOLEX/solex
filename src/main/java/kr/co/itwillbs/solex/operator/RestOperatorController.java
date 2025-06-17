package kr.co.itwillbs.solex.operator;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import kr.co.itwillbs.solex.vacation.VacationService;

@RestController
@RequestMapping("/operator/api")
public class RestOperatorController {

	@Autowired
	public OperatorService operatorService;
	
	//로그인 구현 필요
	Long empId = 26L;

	
	//내 휴가 요약 정보
	@GetMapping("/summary")
	public Map<String, Object> getOperatorSummary() {
		
	    Map<String, Object> result = operatorService.operatorSummary(empId);
	    
	    return result;
	}


}
