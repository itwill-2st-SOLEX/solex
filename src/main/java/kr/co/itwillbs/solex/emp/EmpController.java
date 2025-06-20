package kr.co.itwillbs.solex.emp;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import lombok.extern.log4j.Log4j2;
import org.springframework.web.bind.annotation.RequestBody;


@Log4j2
@Controller
@RequestMapping("/emp")
public class EmpController {

	@Autowired
	private EmpService empService;

	@GetMapping("")
	public String main(Model model, @RequestParam(value="includeEmpSts", required = false) String includeEmpSts){

		List<Map<String, Object>> empList = empService.getEmpList(includeEmpSts);
//		empList = empService.getEmpList(searchType, searchKeyword, includeEmpSts);

		model.addAttribute("empList", empList);
		model.addAttribute("includeEmpSts", includeEmpSts); // 체크박스 유지용

		return "emp/emp_main";
	}


	





}
