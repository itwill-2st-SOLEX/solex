package kr.co.itwillbs.solex.equipment_history;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;


@Controller
@RequestMapping("/equipment_his")
public class EquipmentHistoryController {
	
	@GetMapping("")
	public String getMethodName() {
		
		return "equipment_his/equipment_his_main";
	}
	
}
