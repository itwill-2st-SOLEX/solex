package kr.co.itwillbs.solex.material_orders;

import java.io.Serial;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

import lombok.extern.log4j.Log4j2;

@Log4j2
@Controller
@RequestMapping("/material_orders")
public class MaterialOrdersController {
	@Autowired
	private MaterialOrdersService materialOrdersService;
	
	//자재 메인페이지
	@GetMapping("")
	public String getMethodName() {
		List<Map<String, Object>> materialList = materialOrdersService.getMaterialOrders();
		return "material_orders/material_orders_main";
	}
	
}
