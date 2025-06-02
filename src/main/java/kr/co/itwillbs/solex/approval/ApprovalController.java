package kr.co.itwillbs.solex.approval;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

import lombok.RequiredArgsConstructor;

@Controller
@RequiredArgsConstructor
public class ApprovalController {
	
	private final ApprovalService approvalService;
	
	@GetMapping("/approval/pending")
	public String approvalList() {
		
		approvalService.get();
		
		return "";
	}

}
