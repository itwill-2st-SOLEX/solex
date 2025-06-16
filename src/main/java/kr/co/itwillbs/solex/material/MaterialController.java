package kr.co.itwillbs.solex.material;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

import lombok.extern.log4j.Log4j2;

@Log4j2
@Controller
@RequestMapping("/material")
public class MaterialController {
	
	@GetMapping("")
	public String getMethodName() {
		return "material/material_main";
	}
}
