package kr.co.itwillbs.solex.operator;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@RequestMapping("/operator")
public class WorkerController {

	    // 현장사원 페이지로 단순 이동
	    @GetMapping("/worker")
	    public String getManagerPage() {
	        return "operator/worker";
	    }
}
