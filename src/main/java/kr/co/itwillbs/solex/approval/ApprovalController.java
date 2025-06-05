package kr.co.itwillbs.solex.approval;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;


@Controller
@RequestMapping("/approval")
public class ApprovalController {
	
	@Autowired
	private ApprovalService service;
	
	@GetMapping("/drafts")
	public String approvalDrafts(Model model) {
		// 모달 기안서 공통코드로 불러오기
		List<Map<String, String>> docTypeList = service.getdocTypeList();
		model.addAttribute("docTypes", docTypeList);
		return "approval/approvalDrafts";
	}
	
	// 무한스크롤
	@ResponseBody
	@GetMapping("/api/drafts")
    public List<Map<String, Object>> getDraftList(@RequestParam("page") int page, @RequestParam("size") int size) {
		int offset = page * size;
        return service.getDraftList(offset, size);
    }
	
	// 직급 공통코드 불러오기 
	@ResponseBody
	@GetMapping("/api/codes")
	public List<Map<String, String>> getPosition(@RequestParam("group") String group) {
		return service.getPosition(group);
	}
	
	// 기안서 등록
	@ResponseBody
	@PostMapping("register/drafts")
	public void registerDarafts(@RequestBody Map<String, Object> map) {
		System.out.println("ASDASDSA" + map);
		service.registerDarafts(map);
	}
	
}
