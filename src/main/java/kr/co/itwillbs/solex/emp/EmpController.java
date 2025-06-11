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
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

import lombok.extern.log4j.Log4j2;
import org.springframework.web.bind.annotation.RequestBody;


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


		List<Map<String, Object>> empList = empService.getEmpList(searchType, searchKeyword, includeEmpSts);
//		empList = empService.getEmpList(searchType, searchKeyword, includeEmpSts);

		model.addAttribute("empList", empList);
		model.addAttribute("includeEmpSts", includeEmpSts); // 체크박스 유지용
		model.addAttribute("searchType", searchType);
		model.addAttribute("searchKeyword", searchKeyword);

		return "emp/emp_main";
	}

	// 등록 모달 
	@PostMapping("/registration")
	public String register_post(@RequestParam Map<String, Object> empMap) {

		try {
			int  insertCount = empService.registerEmp(empMap); // 인스턴스를 통한 호출
		} catch(Exception e) {
		    e.printStackTrace();
		}

		return "redirect:/emp";
	}

	// 수정 모달(업데이트)
	@PostMapping("/modify")
	public String modify_post(@ModelAttribute HashMap<String, Object> empModifyMap) {
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
	        return "redirect:/emp";
	}
	





}
