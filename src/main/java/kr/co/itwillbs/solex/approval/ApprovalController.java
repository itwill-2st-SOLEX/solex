package kr.co.itwillbs.solex.approval;

import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

import lombok.RequiredArgsConstructor;

@Controller
@RequiredArgsConstructor
@RequestMapping("/approval")
public class ApprovalController {
	
	private final ApprovalService approvalService;
	
	// 결재할 기안서 리스트 페이지
    @GetMapping("/todo")
    public String getTodoDocumentList(Model model) {
    	// 로그인 아이디 가져오기 - 나중에 Spring Security 이용해서 가져와야됨
    	Long loginEmpId = 1L;
    	
    	List<Map<String, Object>> listMap = approvalService.getTodoDocumentList(loginEmpId);
    	
        return "";
    }
    
}
