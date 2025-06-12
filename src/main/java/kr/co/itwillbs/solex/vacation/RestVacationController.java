package kr.co.itwillbs.solex.vacation;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import kr.co.itwillbs.solex.code.CodeController;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/vacation/api")
public class RestVacationController {


	@Autowired
	public VacationService vacationService;
	
	//로그인 구현 필요
	Long empId = 1L;

	
	//내 휴가 요약 정보
	@GetMapping("/summary")
	public Map<String, Object> getVacationSummary() {
		
	    Map<String, Object> result = vacationService.getVacationSummary(empId);
	    
	    return result;
	}

	
	//내 연차 현황
	@GetMapping("/detail")
	public Map<String, Object> getVacationDetail(@RequestParam(name = "page", required = false) Integer page,
										         @RequestParam(name = "size", required = false) Integer size,
										         @RequestParam("empId") Long empId) {

	    //Long userId = Long.parseLong(empId);

	    Map<String, Object> params = new HashMap<>();
	    params.put("offset", page * size);
	    params.put("size", size);
	    params.put("empId", empId);
	    
	    // 내 휴가 사용 내역, 총 개수 계산
	    List<Map<String, Object>> vacationList = vacationService.getVacationDetail(params);
	    int vacationCount = vacationService.getVacationCount(empId);

	    Map<String, Object> result = new HashMap<>();
	    result.put("list", vacationList);
	    result.put("vacationCount", vacationCount);

	    return result;
	}
	
	//연차 목록
	@GetMapping("/list")
	public Map<String, Object> getVacationList(@RequestParam("page") int page, 
										       @RequestParam("size") int size,
										       @RequestParam(name="keyword", required = false) String keyword) {
		
		Map<String, Object> params = new HashMap<>();
		
		//Long userId = Long.parseLong(empId);
		
		//사원 이름, 부서 가져오기
		Map<String,Object> info = vacationService.getEmployeeInfo(empId);
				
	    params.put("keyword", keyword);
	    params.put("offset", page * size);// 페이징 계산
	    params.put("size", size);
	    
	    // 로그인한 사용자의 직급에 따라 소속 직원들의 정보를 보여주기 위해 부서, 팀, 직급 정보 전달
	    params.put("empId", empId);
	    params.put("empCatCd", info.get("EMP_CAT_CD"));
	    params.put("empDepCd", info.get("EMP_DEP_CD"));
	    params.put("empTeamCd", info.get("EMP_TEAM_CD"));
	    params.put("empPosCd", info.get("EMP_POS_CD"));


	    List<Map<String, Object>> vacationList = vacationService.getVacationList(params);
	    
	    // 표시되는 정보의 개수 계산 (무한 스크롤)
	    int totalCount = vacationService.getVacationAllCount(params); 

	    Map<String, Object> result = new HashMap<>();
	    
	    result.put("list", vacationList);
	    result.put("totalCount", totalCount);
	    
	    return result;
										
	}
	
}
