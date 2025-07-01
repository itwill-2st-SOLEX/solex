package kr.co.itwillbs.solex.equipment_history;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

@Controller
@RequestMapping("/equipmenthistory")
public class EquipmentHistoryRestController {
	
	@Autowired
	private EquipmentHistoryService equipmentHistoryService;
	
	@GetMapping("") // 
	public List<Map<String, Object>> getEquipmentHistory(@RequestParam("page") int page, @RequestParam("size") int size) throws Exception {
        
		int offset = page * size;
		System.out.println("~~~~~~~~~~~~~~~~~~~~~~~~~~~page:" + page + " size: " + size + " offset = " + offset);
		return equipmentHistoryService.getEquipmentHistory(offset, size);
    }
	
	//설비수리이력 목록조회
	@GetMapping("/equipmenthistoryList")
	public List<Map<String, Object>> equipmenthistoryList() {
		
		return equipmentHistoryService.equipmenthistoryList();
	}
	
}
