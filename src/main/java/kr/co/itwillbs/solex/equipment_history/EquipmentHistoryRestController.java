package kr.co.itwillbs.solex.equipment_history;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@RequestMapping("/equipment_his")
public class EquipmentHistoryRestController {
	
	@Autowired
	private EquipmentHistoryService equipmentHistoryService;
}
