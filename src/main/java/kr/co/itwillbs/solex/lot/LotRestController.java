package kr.co.itwillbs.solex.lot;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;

@RestController
@RequestMapping("lot")
public class LotRestController {
	
	@Autowired
	private LotService lotService;

	@GetMapping("list")
	public Map<String, Object> getLotList() {
		
		Map<String, Object> list = new HashMap<>();
		
		return list;
	}
	
	
}
