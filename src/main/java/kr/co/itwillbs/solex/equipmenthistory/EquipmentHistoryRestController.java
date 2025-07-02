package kr.co.itwillbs.solex.equipmenthistory;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/equipmenthistory")
public class EquipmentHistoryRestController {
	
	@Autowired
	private EquipmentHistoryService equipmentHistoryService;
	
	@GetMapping("") // 
	public List<Map<String, Object>> getEquipmentHistory(@RequestParam("page") int page, @RequestParam("size") int size) throws Exception {
        
		int offset = page * size;
		List<Map<String, Object>> aa = equipmentHistoryService.getEquipmentHistory(offset, size);
		return aa;
	}
	
}
