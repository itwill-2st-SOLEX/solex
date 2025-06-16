package kr.co.itwillbs.solex.approval;

import java.util.List;
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
	
	// 결재할 기안서 리스트 
    @GetMapping("")
    public List<Map<String, Object>> getTodoDocumentList(@RequestParam("page") int page, @RequestParam("size") int size) {
    	// 로그인 아이디 가져오기 - 나중에 Spring Security 이용해서 가져와야됨
    	Long loginEmpId = 2L;
    	
    	int offset = page * size;
		System.out.println("page:" + page + "size: " + size);
    	
    	List<Map<String, Object>> listMap = approvalService.getTodoDocumentList(offset, size, loginEmpId);
    	return listMap;
    }
	
	// 결재할 기안서 상세보기 모달창
    @GetMapping("/document/{doc_id}")
    public Map<String, Object> getTodoDocumentDetail(@PathVariable("doc_id") String doc_id, @RequestParam("doc_type_code") String docTypeCode) {
    	// 로그인 아이디 가져오기 - 나중에 Spring Security 이용해서 가져와야됨
    	Long loginEmpId = 2L;
    	return approvalService.getTodoDocumentDetail(doc_id, docTypeCode, loginEmpId);
    }
	
	//기안서 결재
	@PostMapping("/document/{doc_id}")
	public String approvalDocument(@PathVariable("doc_id") Long doc_id, @RequestBody Map<String, Object> approvalRequest) {
		// 로그인 아이디 가져오기 - 나중에 Spring Security 이용해서 가져와야됨
    	Long loginEmpId = 2L;
    	
    	System.out.println("---------------------***********************----------------------");
		System.out.println(approvalRequest);
		
		approvalService.approvalDocument(approvalRequest, doc_id, loginEmpId);
		return "";
	}
}