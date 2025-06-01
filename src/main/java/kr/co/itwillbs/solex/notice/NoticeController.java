package kr.co.itwillbs.solex.notice;

import java.util.List;
import java.util.Map;

import kr.co.itwillbs.solex.SolexApplication;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;


@Controller
public class NoticeController {

    private final SolexApplication solexApplication;
	
	@Autowired
	private NoticeService noticeService;

    NoticeController(SolexApplication solexApplication) {
        this.solexApplication = solexApplication;
    }
	

    // 공지사항 페이지로 단순 이동
    @GetMapping("/notice")
    public String getNoticePage() {
        return "notice/noticeList"; 
    }
    
	
	// 비동기: JSON 데이터 반환 (fetch API 호출용)
    @GetMapping("/api/notice")
    @ResponseBody
    public List<Map<String, Object>> apiNoticeList(@RequestParam("page") int page, @RequestParam("size") int size) {
    	int offset = page * size;  // 페이징 계산
    	
        return noticeService.getNoticeList(offset, size);
    }
}
