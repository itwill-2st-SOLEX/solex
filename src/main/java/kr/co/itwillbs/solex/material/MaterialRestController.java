package kr.co.itwillbs.solex.material;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import lombok.extern.log4j.Log4j2;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;


@Log4j2
@RestController
@RequestMapping("/material")
public class MaterialRestController {
	
	@Autowired
	private MaterialService materialService;
	
	@GetMapping("")
    public List<Map<String, Object>> getMeterialNameList() {
        return materialService.getMeterialNameList();
    }
	
	//자재목록 JSON으로 리턴
	@GetMapping("/materialList")
    public List<Map<String, Object>> getMeterialList(@RequestParam("page") int page, @RequestParam("size") int size) {
		int offset = page * size;
        return materialService.getMaterialList(offset, size);
    }
	
	//자재 등록 - 단위 및 사용여부 공통코드 가져오기
	@GetMapping("/code")
	public List<Map<String, Object>> getMatUnits() {
		return materialService.getMatUnits();
	}
	
	//자재등록 - post 
	@PostMapping("")
	public void registrationPost(@RequestBody Map<String, Object> matMap) throws Exception {
		System.out.println(matMap);
		materialService.registerMat(matMap); // 인스턴스를 통한 호출
	}
	
	// toast_ui grid 자재 수정
	@PutMapping("/updateGridCell")
	public ResponseEntity<Map<String, String>> updateGridCell(@RequestBody Map<String, Object> payload) {
		
		Map<String, String> response = new HashMap<>();
		materialService.updateGridCell(payload);
		
        response.put("status", "success");
        response.put("message", "자재 정보가 성공적으로 업데이트되었습니다.");
		return new ResponseEntity<>(response, HttpStatus.OK);
	}
	

	
}
