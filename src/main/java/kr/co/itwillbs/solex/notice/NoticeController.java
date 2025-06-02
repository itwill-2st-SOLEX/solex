package kr.co.itwillbs.solex.notice;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import kr.co.itwillbs.solex.SolexApplication;


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
    
    
	// 공지사항 목록
	// 비동기: JSON 데이터 반환 (fetch API 호출용)
    @GetMapping("/api/notice")
    @ResponseBody
    public List<Map<String, Object>> apiNoticeList(@RequestParam("page") int page, @RequestParam("size") int size) {
    	int offset = page * size;  // 페이징 계산
    	
        return noticeService.getNoticeList(offset, size);
    }
    
    // 공지사항 내용 모달창 띄우기
    @GetMapping("/api/notice/{notId}")
    @ResponseBody
    public Map<String, Object> apiNoticeContent(@PathVariable("notId") int notId) {
    	 
    	Map<String, Object> detail = noticeService.getNoticeDetail(notId);
        
    	System.out.println(detail);
    	System.out.println(notId);
//    	 if (detail == null) {
//             return (Map<String, Object>) ResponseEntity.notFound().build();
//         }
//         return (Map<String, Object>) ResponseEntity.ok(detail);
//    }
    	 
    	 return detail;
    }
}
