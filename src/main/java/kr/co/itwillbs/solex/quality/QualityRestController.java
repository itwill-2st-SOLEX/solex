package kr.co.itwillbs.solex.quality;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/quality")
public class QualityRestController {
	
	@Autowired
	public QualityService qualityService;
	
	// 품질검사 항목 리스트
    @GetMapping("")
    public List<Map<String, Object>> getQualityList(@RequestParam("page") int page, @RequestParam("size") int size) {
    	// 로그인 아이디 가져오기 - 나중에 Spring Security 이용해서 가져와야됨
    	Long loginEmpId = 2L;
    	
    	int offset = page * size;
		System.out.println("page:" + page + "size: " + size);
    	
		return qualityService.getQualityList(offset, size);
    }
    
    // 품질검사 항목 등록
   	@PostMapping("")
   	public void registerQuality(@RequestBody Map<String, Object> qualityRequest) {
       	System.out.println("---------------------***********************----------------------");
   		System.out.println(qualityRequest);
   		
   		qualityService.registerQuality(qualityRequest);   	
   	}
 
}
