package kr.co.itwillbs.solex.notice;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import jakarta.servlet.http.HttpSession;
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
    public Map<String, Object> apiNoticeList(@RequestParam("page") int page, 
    											   @RequestParam("size") int size,
    											   @RequestParam(name="keyword", required = false) String keyword) {

    	Map<String, Object> params = new HashMap<>();
    	
	    params.put("keyword", keyword);
	    params.put("offset", page * size);// 페이징 계산
	    params.put("size", size);
    	
	    List<Map<String, Object>> noticeList = noticeService.getNoticeList(params);
	    int totalCount = noticeService.getNoticeCount(params);  // ← 키워드 포함된 카운트로 변경

	    Map<String, Object> result = new HashMap<>();
	    result.put("list", noticeList);
	    result.put("totalCount", totalCount);
	    
	    return result;
    }
    
    // 공지사항 내용 모달창 띄우기
    @GetMapping("/api/notice/{notId}")
    @ResponseBody
    public Map<String, Object> apiNoticeContent(@PathVariable("notId") int notId) {
    	 
    	Map<String, Object> detail = noticeService.getNoticeDetail(notId);
    	 
    	 return detail;
    }
    
    // 글 등록
    @PostMapping("/api/notice")
    public ResponseEntity<?> insertNotice(@RequestBody Map<String, Object> map, HttpSession session) {
        System.out.println(map);
        
        //-------------------------------------
        //일단 기본으로 작성(로그인 후 구현예정)
        map.put("notId", 7);	
        map.put("empId", 2);
        //-------------------------------------
        
        noticeService.insertNotice(map);
        return ResponseEntity.ok().build();
    }
    
    
    // 글 변경
    @PutMapping("/api/notice/{id}")
    public ResponseEntity<?> updateNotice(@PathVariable("id") int notId, @RequestBody Map<String, Object> map) {
        map.put("notId", notId);
        map.put("notTt", "[수정] " + map.get("notTt"));
        noticeService.updateNotice(map);
        return ResponseEntity.ok().build();
    }
    
    // 글 삭제
    @DeleteMapping("/api/notice/{id}")
    public ResponseEntity<?> deleteNotice(@PathVariable("id") int notId) {

        noticeService.deleteNotice(notId);
        return ResponseEntity.ok().build();
    }
}
