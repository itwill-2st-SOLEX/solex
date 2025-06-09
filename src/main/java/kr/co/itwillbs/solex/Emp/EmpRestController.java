package kr.co.itwillbs.solex.Emp;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.AutoConfigureOrder;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import lombok.extern.log4j.Log4j2;
@Log4j2
@Controller
@RequestMapping("/emp")
public class EmpRestController {
	
	@Autowired
	private EmpService empService;
	
	// AJAX 를 통해 목록 조회 요청 결과를 JSON 으로 리턴하기 위한 요청 매핑
		@ResponseBody
		@GetMapping("/listJson")
		public Map<String, Object> getEmpListJson(){
			List<Map<String, Object>> empList = empService.getEmpListFromMapper();
			log.info("~~~~~~~~~~~~~ empList = " + empList);
			log.info("~~~~~~~~~~~empListSize = " + empList.size());
			
			Map<String, Object> map = new HashMap<>();
			map.put("empList", empList);
			List<Map<String, Object>> empCodeList = empService.getEmpCodeListFromMapper();
			map.put("empCodeList", empCodeList);
			System.out.println("########## map = " + map);
			return map;
		}
		
		//AJAX를 활용한 수정 매핑
		@ResponseBody
		@GetMapping("/codelistJson")
		public Map<String, Object> getEmpCodeListJson(){
			List<Map<String, Object>> empCodeList = empService.getEmpCodeListFromMapper();
			log.info("************ empCodeList = " + empCodeList);
			log.info("*******empCodeList = " + empCodeList.size());
			
			Map<String, Object> map = new HashMap<>();
			map.put("empCodeList", empCodeList);
			return map;
		}
}
