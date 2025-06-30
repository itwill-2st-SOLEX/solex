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

		if (id == null || id.trim().isEmpty()) {
			// 1. 최상위 LOT 조회
			return lotService.getFilteredProductLots(lotCode, lotStatus, prdType);
		} else if (id.endsWith("_prc")) {
			String[] parts = id.split("_");
			if (parts.length >= 3) {
				Long prdLotId = Long.parseLong(parts[1]);
				return lotService.getProcessNodes(prdLotId);
			}
		} else if (id.endsWith("_mat")) {
			String[] parts = id.split("_");
			if (parts.length >= 3) {
				Long prdLotId = Long.parseLong(parts[1]);
				return lotService.getMaterialNodes(prdLotId);
			}
		} else if (id.endsWith("_eqp")) {
			String[] parts = id.split("_");
			if (parts.length >= 3) {
				Long prdLotId = Long.parseLong(parts[1]);
				return lotService.getEquipmentNodes(prdLotId);
			}
		} else if (id.startsWith("prd_")) {
			// 이건 LOT 자체 클릭 시에만 걸리도록 마지막에!
			Long prdLotId = Long.parseLong(id.substring(4));
			return lotService.getLotNodeCategories(prdLotId);
		}

		return Collections.emptyList();
	}

}
