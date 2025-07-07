package kr.co.itwillbs.solex.mypage;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Map;
import java.util.UUID;

import org.apache.commons.io.FilenameUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import lombok.extern.log4j.Log4j2;



@Log4j2
@RestController
@RequestMapping("/mypage")
public class MypageRestController {
	
	@Autowired
	private MypageService mypageService; 
	
	//로그인 된 회원의 정보 가져오기
	@GetMapping("/empData")
	public Map<String, Object> getEmpData(HttpSession session) {
		
		String empId = (String) session.getAttribute("empId");
		System.out.println("empId = " + empId);
		
		return mypageService.getEmpData(empId);
		
	}
	
	// 마이페이지 수정
	@PutMapping("/personalDataModify")
    public void modifyPersonalData(
            @RequestPart("emp") Map<String, Object> empMap,
            @RequestPart(value = "emp_img", required = false) MultipartFile file, // ✅ 'required = false'로 설정
            HttpSession session) throws IOException {

        String empId = (String) session.getAttribute("empId");
        
        System.out.println("------------------------------------------   마이페이지 수정시 컨트롤러에 들어오는 Map ------------------------------------------");
		System.out.println("personalModifyMap = " + empMap);
		
		mypageService.modifyPersonalData(empId, empMap, file);
    }
	
}