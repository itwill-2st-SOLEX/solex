package kr.co.itwillbs.solex.code;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

@Controller
@RequestMapping("/SOLEX")
public class CodeController {
	
	@Autowired
	private CodeService codeService;

	// 공통코드 리스트 조회
	@GetMapping("/code")
	public String getCodeList(Model model) {
		
		List<CodeDTO> codeList = codeService.getCodeList();
		
		System.out.println("코드리스트 : " + codeList);
		
		model.addAttribute("codeList", codeList);
		
		return "code/code";
	}
	
	// 공통코드 저장
	@PostMapping("/code/save")
	@ResponseBody
	public Map<String, Object> saveCode(@RequestBody Map<String, List<CodeDTO>> map) {
		
		System.out.println("추가 행 : " + map.get("insertList"));
		System.out.println("수정한 행 : " + map.get("updateList"));
		
		List<CodeDTO> insertList = map.get("insertList");
	    List<CodeDTO> updateList = map.get("updateList");

	    // 공통코드 신규 행 추가
	    if (insertList != null && !insertList.isEmpty()) {
	        codeService.insertCodes(insertList);
	    }

	    // 공통코드 기존 행 수정
	    if (updateList != null && !updateList.isEmpty()) {
	        codeService.updateCodes(updateList);
	    }
		
		return Map.of("result", "seccess");
	}
	
	
	
}
