package kr.co.itwillbs.solex.equipmenthistory;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;


@Controller
@RequestMapping("/equipmenthistory")
public class EquipmentHistoryController {
	
	@GetMapping("/page")
	public String getMethodName() {
		
		return "equipmenthistory/equipmenthistoryDrafts";
	}
	
}
