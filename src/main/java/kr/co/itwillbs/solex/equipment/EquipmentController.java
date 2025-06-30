package kr.co.itwillbs.solex.equipment;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.GetMapping;


@Controller
@RequestMapping("/equipment")
public class EquipmentController {	
	@GetMapping
	public String equipmentList(){
        return "equipment/list"; 
    }
}
