package kr.co.itwillbs.solex.approval;

import java.util.Map;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/approval")
public class ApprovalRestController {
	
	private final ApprovalService approvalService;
	
	// 결재할 기안서 상세보기 모달창
    @GetMapping("/")
    public String getTodoDocumentDetail(@PathVariable("doc_id") String doc_id, @RequestParam("doc_type_code") String docTypeCode) {
    	// 로그인 아이디 가져오기 - 나중에 Spring Security 이용해서 가져와야됨
    	Long loginEmpId = 1L;
    	
    	approvalService.getTodoDocumentDetail(doc_id, docTypeCode, loginEmpId);
    	return "";
    }
	
	//기안서 결재
	@PostMapping("/")
	public String approvalDocument(@RequestBody Map<String, Object> approvalRequest) {
		// 로그인 아이디 가져오기 - 나중에 Spring Security 이용해서 가져와야됨
    	Long loginEmpId = 1L;
    	
		approvalService.approvalDocument(approvalRequest, loginEmpId);
		return "";
	}
}