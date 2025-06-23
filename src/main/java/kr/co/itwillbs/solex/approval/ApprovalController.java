package kr.co.itwillbs.solex.approval;

import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

import lombok.RequiredArgsConstructor;

@Controller
@RequestMapping("/approval")
public class ApprovalController {
	
	// 결재할 기안서 리스트 페이지
    @GetMapping("/todo")
    public String getTodoDocumentList() {    	
        return "approval/approvalDrafts";
    }
    
}
