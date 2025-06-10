package kr.co.itwillbs.solex.emp;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RequestParam;

import lombok.extern.log4j.Log4j2;
@Log4j2
@Controller
@RequestMapping("/emp")
public class EmpRestController {
	
	@Autowired
	private EmpService empService;
	
	// 무한스크롤
	@ResponseBody
	@GetMapping("/empList")
    public List<Map<String, Object>> getempList(@RequestParam("page") int page, @RequestParam("size") int size) {
		int offset = page * size;
		System.out.println("page:" + page + "size: " + size);
		System.out.println( "SDADSADSADSSAD" + empService.getempList(offset, size));
        return empService.getempList(offset, size);
    }
	
	 // ajax를 통해 json으로 공통 코드 목록을 리턴
    @ResponseBody
    @GetMapping("/codelistJson")
    public Map<String, Object> getCommonCodeListJson() {
        List<Map<String, Object>> commonCodeList = empService.getAllCommonCodesForJson();
        Map<String, Object> response = new HashMap<>();
        response.put("empCodeList", commonCodeList);
        System.out.println("Codelist JSON Response: " + response);
        return response;
    }
    
	
	// AJAX 를 통해 목록 조회 요청 결과를 JSON 으로 리턴하기 위한 요청 매핑
    @ResponseBody
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
		

}
