package kr.co.itwillbs.solex.material;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/material")
public class MaterialRestController {
	
	@Autowired
	private MaterialService materialService;
	
	@GetMapping("")
    public List<Map<String, Object>> getMeterialNameList() {
        return materialService.getMeterialNameList();
    }

}
