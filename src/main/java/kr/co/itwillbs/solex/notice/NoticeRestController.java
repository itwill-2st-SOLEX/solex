package kr.co.itwillbs.solex.notice;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.SessionAttribute;

import jakarta.servlet.http.HttpSession;

@RestController
@RequestMapping("/notice/api")
public class NoticeRestController {
	
	@Autowired
	private NoticeService noticeService;

	// 공지사항 목록
    @GetMapping("")
    public Map<String, Object> apiNoticeList(@RequestParam("page") int page, 
										     @RequestParam("size") int size,
										     @RequestParam(name="keyword", required = false) String keyword,
										     @SessionAttribute("empId") Long empId) {

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
    
    // 글 등록
    @PostMapping("")
    public ResponseEntity<?> insertNotice(@RequestBody Map<String, Object> map, @SessionAttribute("empId") Long empId) {
    	
        map.put("empId", empId);
        
        noticeService.insertNotice(map);
        return ResponseEntity.ok().build();
    }
    
    
    // 글 변경
    @PutMapping("/{id}")
    public ResponseEntity<?> updateNotice(@PathVariable("id") Long notId, 
    									  @RequestBody Map<String, Object> map, 
    									  @SessionAttribute("empId") Long empId) {

        map.put("notId", notId);
    	map.put("notTt", "[수정] " + map.get("notTt"));
        noticeService.updateNotice(map);
        return ResponseEntity.ok().build();
    }
    
    // 글 삭제
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteNotice(@PathVariable("id") Long notId, @SessionAttribute("empId") Long empId) {
    	
    	Map<String, Object> detail = noticeService.getNoticeDetail(notId);
    	System.out.println();
    	
        noticeService.deleteNotice(notId);
        return ResponseEntity.ok().build();
    }
    
    // 공지사항 내용 모달창 띄우기
    @GetMapping("/{id}")
    public Map<String, Object> apiNoticeContent(@PathVariable("id") Long notId, @SessionAttribute("empId") Long empId) {
    	
    	Map<String, Object> detail = noticeService.getNoticeDetail(notId);
    	 
    	return detail;
    }
    
    //로그인한 사용자의 정보 가져오기
    @GetMapping("/userinfo")
    public Map<String, Object> getEmployeeInfo(@SessionAttribute("empId") Long empId) {

    	Map<String, Object> userInfo = noticeService.getEmployeeInfo(empId);

        userInfo.put("loginId", empId);    	
        
        return userInfo;
    }
}
