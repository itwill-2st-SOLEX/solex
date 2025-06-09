package kr.co.itwillbs.solex.notice;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class RestNoticeController {
	
	@Autowired
	private NoticeService noticeService;
	
	// 공지사항 목록
		// 비동기: JSON 데이터 반환 (fetch API 호출용)
	    @GetMapping("/api/notice")
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
	    public Map<String, Object> apiNoticeContent(@PathVariable("notId") int notId) {
	    	 
	    	Map<String, Object> detail = noticeService.getNoticeDetail(notId);
	    	 
	    	 return detail;
	    }
}
