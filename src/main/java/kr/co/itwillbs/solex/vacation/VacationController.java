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
    
	// 공지사항 페이지로 단순 이동
    @GetMapping("/vacation")
    public String getVacationPage() {
        return "vacation/vacationDetail"; 
    }
    
}
