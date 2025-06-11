package kr.co.itwillbs.solex.notice;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;

import jakarta.servlet.http.HttpSession;


@Controller
public class NoticeController {

	@Autowired
	private NoticeService noticeService;
	
	Long empId = 11L;

    // 공지사항 페이지로 단순 이동
    @GetMapping("/notice")
    public String getNoticePage() {
        return "notice/noticeList"; 
    }
    
    // 글 등록
    @PostMapping("/notice/api")
    public ResponseEntity<?> insertNotice(@RequestBody Map<String, Object> map, HttpSession session) {
        System.out.println(map);
        
        //-------------------------------------
        //일단 기본으로 작성(로그인 후 구현예정)
        //map.put("notId", 7);	
        map.put("empId", empId);
        //-------------------------------------
        
        noticeService.insertNotice(map);
        return ResponseEntity.ok().build();
    }
    
    
    // 글 변경
    @PutMapping("/notice/api/{id}")
    public ResponseEntity<?> updateNotice(@PathVariable("id") int notId, @RequestBody Map<String, Object> map) {
        map.put("notId", notId);
        //map.put("notTt", "[수정] " + map.get("notTt"));
        noticeService.updateNotice(map);
        return ResponseEntity.ok().build();
    }
    
    // 글 삭제
    @DeleteMapping("/notice/api/{id}")
    public ResponseEntity<?> deleteNotice(@PathVariable("id") int notId) {

        noticeService.deleteNotice(notId);
        return ResponseEntity.ok().build();
    }
}
