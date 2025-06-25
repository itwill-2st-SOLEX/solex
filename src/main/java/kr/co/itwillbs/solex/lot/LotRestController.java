package kr.co.itwillbs.solex.lot;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Collections;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;

@RestController
@RequestMapping("lot")
public class LotRestController {
	
	@Autowired
	private LotService lotService;

	// 제품유형 리스트 조회
	@GetMapping("/productType/list")
	public List<Map<String, Object>> getProductTypes() {
		return lotService.getCodeDetails("prd_type");
	}
	
	// LOT상태 리스트 조회
	@GetMapping("/lotStatus/list")
	public List<Map<String, Object>> getLotStatuses() {
		return lotService.getCodeDetails("lot_status");
	}
	
	// 트리구조 조회
	@GetMapping("list")
	public List<Map<String, Object>> getLotTree(@RequestParam Map<String, String> params) {
		
		String id = params.get("id");
	    String lotCode = params.get("lotCode");
	    String lotStatus = params.get("lotStatus");
	    String prdType = params.get("prdType");
	    
	    System.out.println("id : " + id + ", lotCode : " + lotCode + ", lotStatus : " + lotStatus + ", prdType : " + prdType);

	    if (id == null || id.trim().isEmpty()) {
	        return lotService.getFilteredProductLots(id, lotCode, lotStatus, prdType);
	    } else if (id.startsWith("prd_")) {
//	        return lotService.getProcessLotsByProductId(id.replace("prd_", ""));
	    } else if (id.startsWith("prc_")) {
//	        return lotService.getMaterialsAndEquipments(id.replace("prc_", ""));
	    }
	    
	    return Collections.emptyList();
	}
	
}
