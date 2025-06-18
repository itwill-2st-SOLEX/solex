package kr.co.itwillbs.solex.material;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import lombok.extern.log4j.Log4j2;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;


@Log4j2
@RestController
@RequestMapping("/material")
public class MaterialRestController {
	
	@Autowired
	private MaterialService materialService;
	
	// 자재목록 JSON으로 리턴
	@GetMapping("/materialList")
    public List<Map<String, Object>> getMeterialList(@RequestParam("page") int page, @RequestParam("size") int size) {
		int offset = page * size;
        return materialService.getMaterialList(offset, size);
    }

	//자재 등록 - 공통코드 가져오기
	@GetMapping("/codes")
	public List<Map<String, Object>> getCommonCodes() {
		return materialService.getCommonCodes();
	}
	
	
	//자재 등록 - 단위 및 사용여부 공통코드 가져오기
	@GetMapping("/codeListJson")
	public Map<String, Object> getCommonCodeListJson() {
		List<Map<String, Object>> commonCodeList = materialService.getCommonCodeListJson();
		Map<String, Object> response= new HashMap<>();
		response.put("matCodeList", commonCodeList);
		System.out.println("code list mat =" + response);
		return response;
	}
	
}
