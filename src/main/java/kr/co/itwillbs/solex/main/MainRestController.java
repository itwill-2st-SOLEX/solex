package kr.co.itwillbs.solex.main;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
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
@RequestMapping("/main/api")
public class MainRestController {

	@Autowired
	private MainService mainService;
	
	//로그인 사용자 정보
	@GetMapping("/loginEmp")
	public Map<String, Object> loginEmp(@SessionAttribute("empId") Long empId) {
	    // depCd·teamCd 까지 필요하니 기존 selectEmpInfo 재사용
	    return mainService.selectEmpInfo(empId);
	}
	
	
	 /* 일정 조회 */
    @GetMapping("/calendar")
    public List<Map<String,Object>> selectEvents( @RequestParam("start") String start,
									              @RequestParam("end") String end,
									              @SessionAttribute("empId") Long empId){
    	
    	 Map<String,Object> params =  mainService.selectEmpInfo(empId);
    	 
    	 params.put("empId", empId);
    	 params.put("start", start);
    	 params.put("end",  end);
	     
        return mainService.selectEvents(params);
    }
    
    @GetMapping("/leave")
    public List<Map<String,Object>> leaveEvents( @RequestParam("start") String start,
									              @RequestParam("end") String end,
									              @SessionAttribute("empId") Long empId){
    	
    	 Map<String,Object> params =  mainService.selectEmpInfo(empId);
    	 
    	 //params.put("empId", empId);
    	 params.put("start", start);
    	 params.put("end",  end);
	     
        return mainService.selectleave(params);
    }
//
//    일정 등록
    @PostMapping("/calendar")
    public Map<String,Object> insertEvent(@RequestBody Map<String,Object> map,
    									  @SessionAttribute("empId") Long empId){
        
    	map.put("empId", empId);
    	
    	System.out.println(map);
        mainService.insertEvent(map);
        return map;                  
    }
//
//  일정 수정
    @PutMapping("/calendar/{id}")
    public void update(@PathVariable("id") long id,
                       @RequestBody Map<String,Object> map,
                       @SessionAttribute("empId") Long empId){
    	map.put("calId", id);
    	map.put("empId", empId);
    	
        mainService.updateEvent(map);
    }
    
//  일정 삭제
    @DeleteMapping("/calendar/{id}")
    public void delete(@PathVariable("id") long id,
    					@SessionAttribute("empId") Long empId){
    	
    	Map map = new HashMap<>();
    	
    	map.put("calId", id);
    	map.put("empId", empId);
    	
    	mainService.deleteEvent(map);
    }
	// 공지사항 목록
	@GetMapping("/noticeList")
	public List<Map<String, Object>> getMainNotice() {
		return mainService.mainNoticeList();
	}
	
	//결재목록
	@GetMapping("/approval")
	public List<Map<String, Object>> getMainApproval(HttpSession session) {
    	String sessionId = (String) session.getAttribute("empId");
    	Long empId = Long.parseLong(sessionId);
    	
		return mainService.mainApprovalList(empId);
	}

}
