package kr.co.itwillbs.solex.approval;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/approval")
public class ApprovalRestController {
	
	@Autowired
	private ApprovalService approvalService;
	
	// 결재할 기안서 리스트 
    @GetMapping("")
    public List<Map<String, Object>> getTodoDocumentList(@RequestParam("page") int page, @RequestParam("size") int size, HttpSession session) {
		
		String empId = (String) session.getAttribute("empId");
		Long loginEmpId = Long.parseLong(empId);
		System.out.println("empId = " + loginEmpId);
    	
    	int offset = page * size;
		System.out.println("page:" + page + "size: " + size);
    	
    	List<Map<String, Object>> listMap = approvalService.getTodoDocumentList(offset, size, loginEmpId);
    	return listMap;
    }
	
	// 결재할 기안서 상세보기 모달창
    @GetMapping("/document/{doc_id}")
    public Map<String, Object> getTodoDocumentDetail(@PathVariable("doc_id") String doc_id, @RequestParam("doc_type_code") String docTypeCode, HttpSession session) {
		
		String empId = (String) session.getAttribute("empId");
		Long loginEmpId = Long.parseLong(empId);
		System.out.println("empId = " + loginEmpId);
		
    	return approvalService.getTodoDocumentDetail(doc_id, docTypeCode, loginEmpId);
    }
	
	//기안서 결재
	@PostMapping("/document/{doc_id}")
	public void approvalDocument(@PathVariable("doc_id") Long doc_id, @RequestBody Map<String, Object> approvalRequest, HttpSession session) {
		
		String empId = (String) session.getAttribute("empId");
		Long loginEmpId = Long.parseLong(empId);
		System.out.println("empId = " + loginEmpId);
    	
    	System.out.println("---------------------***********************----------------------");
		System.out.println(approvalRequest);
		
		approvalService.approvalDocument(approvalRequest, doc_id, loginEmpId);
	}
}