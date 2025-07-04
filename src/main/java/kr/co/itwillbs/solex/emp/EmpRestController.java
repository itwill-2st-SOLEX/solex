package kr.co.itwillbs.solex.emp;

import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.log4j.Log4j2;

@Log4j2
@RestController
@RequestMapping("/emp")
public class EmpRestController {

	@Autowired
	private EmpService empService;

	// 인사등록
	@PostMapping("")
	public void registerEmployee(
			@RequestPart("emp") Map<String, Object> empMap, 
			@RequestPart("emp_img") MultipartFile file,   
			HttpServletRequest request) throws IOException {
		
		System.out.println("------------------------------------------   인사등록시 컨트롤러에 들어오는 Map ------------------------------------------");
		System.out.println(empMap);
		
		empService.registerEmployee(empMap, file);
	
	}

	// 무한스크롤
	@GetMapping("/empList")
    public List<Map<String, Object>> getempList(@RequestParam("page") int page, @RequestParam("size") int size) {
		int offset = page * size;
        return empService.getempList(offset, size);
    }

	 // ajax를 통해 json으로 공통 코드 목록을 리턴
    @GetMapping("/codelistJson")
    public Map<String, Object> getCommonCodeListJson() {
        List<Map<String, Object>> commonCodeList = empService.getAllCommonCodesForJson();
        Map<String, Object> response = new HashMap<>();
        response.put("empCodeList", commonCodeList);
        System.out.println("Codelist JSON Response: " + response);
        return response;
    }


	// AJAX 를 통해 목록 조회 요청 결과를 JSON 으로 리턴하기 위한 요청 매핑
    @GetMapping("/listJson")
    public Map<String, Object> getEmpListJson(
        @RequestParam(name = "searchType", defaultValue = "", required = false) String searchType,
        @RequestParam(name = "searchKeyword", defaultValue = "", required = false) String searchKeyword,
        @RequestParam(value="includeEmpSts", required = false) String includeEmpSts) {

    	System.out.println("searchType " + searchType);
    	System.out.println("searchKeyword " +  searchKeyword);
    	System.out.println("includeEmpSts " + includeEmpSts);

        List<Map<String, Object>> empList = empService.getEmpList(searchType, searchKeyword, includeEmpSts);

        Map<String, Object> responseMap = new HashMap<>();
        responseMap.put("empList", empList);

        return responseMap;
    }

    // 등록 json으로 반환하기 위한 매핑
    @GetMapping("/codes")
    public List<Map<String, Object>> getCodes() {
        return empService.getAllcodes();
    }

    // 수정을 위한 매핑
    @GetMapping("/codes/{empNum}")
    public Map<String, Object> getEmpDetail(@PathVariable("empNum") String empNum) { //pathVariable = url 경로에 포함된 값을 자바 메서드의 파라미터로 받아오기위해
    	Map<String, Object> data = empService.getEmpDetail(empNum);
        return data;
    }
    
 // 수정 모달(업데이트)
 	@PutMapping("/modify")
 	public void modify_post(@RequestBody HashMap<String, Object> empModifyMap) {
 		System.out.println("Received empData: " + empModifyMap);
 		  try {
 	            // empModifyMap에 프론트에서 보낸 FormData의 모든 필드값이 Map 형태로 들어옵니다.
 	            // 여전히 Map에서 값을 꺼낼 때는 직접 캐스팅하거나 안전하게 처리해야 합니다.
 	            // 예시: String empNum = (String) empModifyMap.get("emp_num");
 	            // 날짜 데이터도 String 형태로 들어올 것입니다.
 	            int updateCount = empService.modifyMap(empModifyMap); // 서비스 메서드는 HashMap을 계속 받도록 유지

 	            if (updateCount > 0) {
 	                System.out.println("Update success !!");
 
 	            } else {
 	                System.out.println("Update failed: No rows affected.");
 	            }

 	        } catch(Exception e) {
 	            e.printStackTrace();
 	            System.out.println("Update fail due to exception !!");
 	        }
 	}
 	


}