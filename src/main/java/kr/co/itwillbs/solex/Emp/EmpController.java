package kr.co.itwillbs.solex.Emp;

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
@RequestMapping("/emp")
public class EmpController {
	
	@Autowired
	private EmpService empService;
	
	@GetMapping("")
	public String main(Model model, @RequestParam(value="includeEmpSts", required = false) String includeEmpSts,
			@RequestParam(name = "searchType", defaultValue = "") String searchType,
			@RequestParam(name = "searchKeyword", defaultValue = "") String searchKeyword){
		List<Map<String, Object>> empList;
		List<Map<String, Object>> codeList;
		List<Map<String, Object>> mm;
		
		
		//퇴사자 포함 
		if("N".equals(includeEmpSts)) {
			empList = empService.getEmpAllList(searchType, searchKeyword);
			
		}else {
			empList = empService.getEmpList(searchType, searchKeyword);
		}
		codeList = empService.getDepCode();
		model.addAttribute("codeList", codeList);
		model.addAttribute("empList", empList);
		model.addAttribute("includeEmpSts", includeEmpSts); // 체크박스 유지용
		model.addAttribute("searchType", searchType);
		model.addAttribute("searchKeyword", searchKeyword);
		
		return "emp/emp_main";
	}
	
	
	@PostMapping("/registration")
	public String register_post(@RequestParam Map<String, Object> empMap) {
		log.info("@@@@@@@@@@@@@ Received empData: {}", empMap);
		int insertCount;
		
		try {
		    insertCount = empService.registerEmp(empMap); // 인스턴스를 통한 호출
		} catch(Exception e) {
		    e.printStackTrace();
		}
		
		return "redirect:/emp";		
	}
	
	
	
	

	
	
}
