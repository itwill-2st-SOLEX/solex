package kr.co.itwillbs.solex.document;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;

import jakarta.servlet.http.HttpSession;

@RestController
@RequestMapping("/approval")
public class DocumentRestController {
	@Autowired
	private DocumentService service;
	

	// 무한스크롤
	@GetMapping("/api/drafts")
    public List<Map<String, Object>> getDraftList(@RequestParam("page") int page, @RequestParam("size") int size,
    											  HttpSession session) {
		int offset = page * size;
		String empIdStr = (String) session.getAttribute("empId");
		Integer emp_id = Integer.valueOf(empIdStr);
        return service.getDraftList(offset, size, emp_id);
    }
	
	// 직급 공통코드 불러오기 
	@GetMapping("/api/codes")
	public List<Map<String, String>> getPosition(@RequestParam("group") String group) {
		return service.getPosition(group);
	}
	
	// 로그인한 사원정보 들고오기
	@GetMapping("/employee/info")
	public Map<String, Object> empInfo(HttpSession session) {
		String empIdStr = (String) session.getAttribute("empId");
		Integer emp_id = Integer.valueOf(empIdStr);
		return service.getEmpInfo(emp_id);
	}
	
	// 기안서 등록
	@PostMapping("/drafts")
	public void registerDarafts(@RequestBody Map<String, Object> map,
								HttpSession session) {
		String empIdStr = (String) session.getAttribute("empId");
		Integer emp_id = Integer.valueOf(empIdStr);
		
		service.registerDarafts(map, emp_id);
	}
	
	// 기안서 상세조회 
	@GetMapping("/select/detail/{doc_id}")
	public Map<String, Object> selectDetailDoc(@PathVariable("doc_id") String doc_id, @RequestParam("doc_type_code") String docTypeCode) {
		return service.selectDetailDoc(doc_id, docTypeCode);
	}
	
}
