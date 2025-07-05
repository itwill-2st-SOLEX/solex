package kr.co.itwillbs.solex.main;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import jakarta.servlet.http.HttpSession;
import kr.co.itwillbs.solex.notice.NoticeService;

@Controller
public class MainRestController {
	
	@Autowired
	private MainService mainService;
	
	@Autowired
	private NoticeService noticeService;
	
	@GetMapping("/")
	public String getNoticeList(Model model,HttpSession session) {
		
		String sessionId = (String) session.getAttribute("empId");
    	Long empId = Long.parseLong(sessionId);
		
    	model.addAttribute("empId", empId);
		model.addAttribute("mainNotices", mainService.mainNoticeList());
		model.addAttribute("mainDocs", mainService.mainDocumentList(empId));
		 
		System.out.println(model.getAttribute("mainNotices"));
		return "index";
	}
	

}
