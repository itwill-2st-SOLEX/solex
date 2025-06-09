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

    @GetMapping("/vacation")
    public String getVacationPage(Model model) {
    	
    	//---------------------------------
    	//로그인 구현 후 emp_id 전달 예정
    	
        
    	Map<String, Object> vacationList = vacationService.getVacationSummary(1);
    	
    	System.out.println(vacationList);
    	model.addAttribute("vacationList", vacationList);
    	
    	
    	return "vacation/vacationList";
    }
}
