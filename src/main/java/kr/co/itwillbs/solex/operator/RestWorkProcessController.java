package kr.co.itwillbs.solex.operator;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/operator/api")
public class RestWorkProcessController {

	@Autowired
	public WorkProcessService wpService;
	
	//로그인 구현 필요
	Long empId = 26L;

	
	//내 부서 정보
	@GetMapping("/wpSummary")
	public Map<String, Object> getWpSummary() {
		
	    Map<String, Object> result = wpService.getWpSummary(empId);

	    return result;
	}

	// 모든 작업 목록 가져오기
	@GetMapping("/wpList")
	public Map<String, Object> getWpList(@RequestParam(name = "page", required = false) Integer page,
								         @RequestParam(name = "size", required = false) Integer size,
								         @RequestParam("empId") Long empId) {

	    Map<String, Object> params = new HashMap<>();
	    params.put("offset", page * size);
	    params.put("size", size);
	    params.put("empId", empId);
	    
	    // 내 작업 전체 목록
	    List<Map<String, Object>> wpList = wpService.getWpList(params);
	    int vacationCount = wpService.getWpCount(empId);

	    Map<String, Object> result = new HashMap<>();
	    result.put("list", wpList);
	    //result.put("vacationCount", vacationCount);
	    System.out.println(result);
	    return result;
	}

}
