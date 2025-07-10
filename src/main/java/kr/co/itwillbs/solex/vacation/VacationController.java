package kr.co.itwillbs.solex.vacation;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@RequestMapping("/vacation")
public class VacationController {
	
	@Autowired
	public VacationService vacationService;
    
	// 본인 연차현황페이지로 단순 이동
    @GetMapping("/detail")
    public String getVacationDetail() {
        return "vacation/vacationDetail"; 
    }
    
    // 부하직원 연차현황 페이지 이동
    @GetMapping("/list")
    @PreAuthorize("hasAnyRole('1','2','3','4')")
    public String getVacationList() {
        return "vacation/vacationList"; 
    }
    
}
