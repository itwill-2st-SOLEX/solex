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
}
