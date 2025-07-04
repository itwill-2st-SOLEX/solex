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
	
	//마이페이지 수정 
	@PutMapping("/personalDataModify")
	public void putMethodName(@RequestPart("emp") Map<String, Object> personalModifyMap, @RequestPart("emp_img") MultipartFile file, HttpSession session, HttpServletRequest request) throws IOException {
		System.out.println(personalModifyMap);
		//사진등록을 위한 코드
		 // ① 파일 저장 경로
	    String uploadDir = "C:/solex_uploads/emp";
        Files.createDirectories(Paths.get(uploadDir));
        String ext = FilenameUtils.getExtension(file.getOriginalFilename());
        String filename = UUID.randomUUID() + "." + ext;
        Path savePath = Paths.get(uploadDir, filename);
        file.transferTo(savePath.toFile());

        // 이미지 URL & emp_id 만들기
        String url = request.getContextPath() + "/uploads/emp/" + filename;
        String empId = (String) session.getAttribute("empId");

        // Map에 추가
        personalModifyMap.put("emp_img", url);
		personalModifyMap.put("empId", empId);
		
		
		System.out.println("personalModify = " + personalModifyMap);
		System.out.println("################# keys: " + personalModifyMap.keySet());
		mypageService.personalDataModify(personalModifyMap);
	}
	
	
}