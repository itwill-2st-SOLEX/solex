package kr.co.itwillbs.solex.vacation;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class VacationController {
	
	@Autowired
	public VacationService vacationService;
    
	// 본인 연차현황페이지로 단순 이동
    @GetMapping("/vacation/detail")
    public String getVacationDetail() {
        return "vacation/vacationDetail"; 
    }
    
    // 부하직원 연차현황 페이지 이동
    @GetMapping("/vacation/list")
    public String getVacationList() {
        return "vacation/vacationList"; 
    }
    
}
