package kr.co.itwillbs.solex.equipmenthistory;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
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
	
	// 해당 설비의 수리이력 리스트 가져오기
    @GetMapping("/equipment/{eqpId}")
    public List<Map<String, Object>> getEquipmentHistoryDetail(@PathVariable("eqpId") String eqpId) {
    	return equipmentHistoryService.getEquipmentHistoryDetail(eqpId);
    }
	
}
