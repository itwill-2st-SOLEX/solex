package kr.co.itwillbs.solex.vacation;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import kr.co.itwillbs.solex.code.CodeController;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class RestVacationController {

    private final CodeController codeController;
	
	@Autowired
	public VacationService vacationService;
	
	Long empId = 1L;


    RestVacationController(CodeController codeController) {
        this.codeController = codeController;
    }
	
	
	//휴가 요약 정보
	@GetMapping("/vacation/api/summary")
	public Map<String, Object> getVacationSummary() {
		
	    Map<String, Object> result = vacationService.getVacationSummary(empId);
	    
	    return result;
	}

	
	//내 연차 현황
	@GetMapping("/vacation/api/detail")
	public Map<String, Object> getVacationDetail(@RequestParam(name = "page", required = false) Integer page,
										         @RequestParam(name = "size", required = false) Integer size,
										         @RequestParam("empId") Long empId) {

	    //Long userId = Long.parseLong(empId);

	    Map<String, Object> params = new HashMap<>();
	    params.put("offset", page * size);
	    params.put("size", size);
	    params.put("empId", empId);

	    List<Map<String, Object>> vacationList = vacationService.getVacationDetail(params);
	    int vacationCount = vacationService.getVacationCount(empId);

	    Map<String, Object> result = new HashMap<>();
	    result.put("list", vacationList);
	    result.put("vacationCount", vacationCount);

	    return result;
	}
	
	//연차 목록
	@GetMapping("/vacation/api/list")
	public Map<String, Object> getVacationList(@RequestParam("page") int page, 
										       @RequestParam("size") int size,
										       @RequestParam(name="keyword", required = false) String keyword) {
		
		Map<String, Object> params = new HashMap<>();
		
		//Long userId = Long.parseLong(empId);
		
		Map<String,Object> info = vacationService.getEmployeeInfo(empId);
		
		
	    params.put("keyword", keyword);
	    params.put("offset", page * size);// 페이징 계산
	    params.put("size", size);
	    
	    //?????????????
	    // 로그인한 사용자 정보 기반 필터 조건 추가
	    params.put("empId", empId);
	    params.put("empCatCd", info.get("EMP_CAT_CD"));
	    params.put("empDepCd", info.get("EMP_DEP_CD"));
	    params.put("empTeamCd", info.get("EMP_TEAM_CD"));
	    params.put("empPosCd", info.get("EMP_POS_CD"));
	    
	    


	    List<Map<String, Object>> vacationList = vacationService.getVacationList(params);
	    
	    
	    int totalCount = vacationService.getVacationAllCount(params);  // ← 키워드 포함된 카운트로 변경

	    Map<String, Object> result = new HashMap<>();
	    
	    result.put("list", vacationList);
	    result.put("totalCount", totalCount);
	    
	    System.out.println(vacationList);
	    return result;
										
	}
	
}
