package kr.co.itwillbs.solex.document;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import jakarta.servlet.http.HttpSession;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;


@Controller
@RequestMapping("/approval")
public class DocumentController {
	
	@Autowired
	private DocumentService service;
	
	@GetMapping("/drafts")
	public String approvalDrafts(Model model) {
		// 모달 기안서 공통코드로 불러오기
		List<Map<String, String>> docTypeList = service.getdocTypeList();
		model.addAttribute("docTypes", docTypeList);
		return "document/documentDrafts";
	}
	
	// 무한스크롤
	@ResponseBody
	@GetMapping("/api/drafts")
    public List<Map<String, Object>> getDraftList(@RequestParam("page") int page, @RequestParam("size") int size) {
		int offset = page * size;
		System.out.println("page:" + page + "size: " + size);
        return service.getDraftList(offset, size);
    }
	
	// 직급 공통코드 불러오기 
	@ResponseBody
	@GetMapping("/api/codes")
	public List<Map<String, String>> getPosition(@RequestParam("group") String group) {
		return service.getPosition(group);
	}
	
	// 로그인한 사원정보 들고오기
	@ResponseBody
	@GetMapping("/employee/info")
	public Map<String, Object> empInfo(HttpSession session) {
//		[TODO] 로그인 만들어지면 넘겨주기
//		session.getAttribute("emp_id");
		int emp_id = 31;
		return service.getEmpInfo(emp_id);
	}
	
	// 기안서 등록
	@ResponseBody
	@PostMapping("register/drafts")
	public void registerDarafts(@RequestBody Map<String, Object> map) {
//		[TODO] 로그인 만들어지면 넘겨주기
//		session.getAttribute("emp_id");
		
		// 로그인 아이디 가져오기 - 나중에 Spring Security 이용해서 가져와야됨
    	long loginEmpId = 31L;
		service.registerDarafts(map, loginEmpId);
	}
	
	// 기안서 상세조회 
	@ResponseBody
	@GetMapping("/select/detail/{doc_id}")
	public Map<String, Object> selectDetailDoc(@PathVariable("doc_id") String doc_id, @RequestParam("doc_type_code") String docTypeCode) {
		System.out.println(doc_id);
		System.out.println("SADSAD"+service.selectDetailDoc(doc_id, docTypeCode));
		return service.selectDetailDoc(doc_id, docTypeCode);
	}
	
}
