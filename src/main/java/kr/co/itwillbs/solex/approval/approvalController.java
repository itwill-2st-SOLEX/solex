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


@RequestMapping("/approval")
@Controller
public class approvalController {
	
	@Autowired
	private approvalService service;
	
	@GetMapping("/drafts")
	public String approvalDrafts(Model model) {
		// 모달 기안서 공통코드로 불러오기
		List<Map<String, String>> docTypeList = service.getdocTypeList();
		model.addAttribute("docTypes", docTypeList);
		return "approval/approvalDrafts";
	}
	
	@GetMapping("/api/drafts")
	@ResponseBody
    public List<Map<String, Object>> getDraftList(@RequestParam("page") int page, @RequestParam("size") int size) {
		int offset = page * size;
        return service.getDraftList(offset, size);
    }
}
