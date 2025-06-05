package kr.co.itwillbs.solex.Hr;

import java.io.InputStream;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.apache.ibatis.io.Resources;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import lombok.extern.log4j.Log4j2;

@Log4j2
@Controller
@RequestMapping("/hr")
public class HrController {
	
	@Autowired
	private HrService hrService;
	
	@GetMapping("")
	public String main(Model model, @RequestParam(value="includeEmpSts", required = false) String includeEmpSts,
			@RequestParam(name = "searchType", defaultValue = "") String searchType,
			@RequestParam(name = "searchKeyword", defaultValue = "") String searchKeyword){
		List<Map<String, Object>> empList;
		
		//퇴사자 포함 
		if("N".equals(includeEmpSts)) {
			empList = hrService.getEmpAllList(searchType, searchKeyword);
		}else {
			empList = hrService.getEmpList(searchType, searchKeyword);
		}
		model.addAttribute("empList", empList);
		model.addAttribute("includeEmpSts", includeEmpSts); // 체크박스 유지용
		model.addAttribute("searchType", searchType);
		model.addAttribute("searchKeyword", searchKeyword);
		
		return "hr/hr_main";
	}
	
	
	@PostMapping("/registration")
	public String register_post(@RequestParam Map<String, Object> empMap) {
		
		int insertCount;
		
		try {
		    insertCount = hrService.registerEmp(empMap); // 인스턴스를 통한 호출
		} catch(Exception e) {
		    e.printStackTrace();
		}
		
		return "redirect:/hr";		
	}
	
	// AJAX 를 통해 목록 조회 요청 결과를 JSON 으로 리턴하기 위한 요청 매핑
	@ResponseBody
	@GetMapping("/listJson")
	public Map<String, Object> getEmpListJson(){
		List<Map<String, Object>> empList = hrService.getEmpListFromMapper();
		log.info("~~~~~~~~~~~~~ empList = " + empList);
		log.info("~~~~~~~~~~~empListSize = " + empList.size());
		
		Map<String, Object> map = new HashMap<>();
		map.put("empList", empList);
		return map;
	}
	
	//AJAX를 활용한 수정 매핑
	
	
	
}
