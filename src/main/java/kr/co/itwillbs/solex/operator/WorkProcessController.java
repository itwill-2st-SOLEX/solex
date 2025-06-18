package kr.co.itwillbs.solex.operator;

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
import org.springframework.web.bind.annotation.RequestMapping;

import jakarta.servlet.http.HttpSession;


@Controller
@RequestMapping("/operator")
public class WorkProcessController {

	//@Autowired
	//private NoticeService noticeService;
	
	Long empId = 26L;


    // 공지사항 페이지로 단순 이동
    @GetMapping("/workProcess")
    public String getworkProcessPage() {
        return "operator/workProcess";
    }
    

}
