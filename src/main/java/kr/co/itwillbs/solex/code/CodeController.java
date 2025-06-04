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

import com.fasterxml.jackson.databind.ObjectMapper;

@Controller
@RequestMapping("/SOLEX")
public class CodeController {
	
	@Autowired
	private CodeService codeService;

	// 공통코드 리스트 조회
	@GetMapping("/code")
	public String getCodeList(Model model) throws Exception {
		
		List<CodeDTO> codeList = codeService.getCodeList();
		
		ObjectMapper mapper = new ObjectMapper();
	    String json = mapper.writeValueAsString(codeList);
	    
		model.addAttribute("codeList", json);
		
		return "code/code";
	}
	
	// 공통코드 저장
	@PostMapping("/code/save")
	@ResponseBody
	public Map<String, Object> saveCode(@RequestBody Map<String, List<CodeDTO>> map) {
		
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
