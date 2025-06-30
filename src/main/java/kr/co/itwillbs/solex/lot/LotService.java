package kr.co.itwillbs.solex.lot;

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class LotService {
	
	@Autowired
	private LotMapper lotMapper;
	
	// 제품유형 / 생산상태 리스트 조회
	public List<Map<String, Object>> getCodeDetails(String codId) {
		List<Map<String, Object>> list = lotMapper.selectDetailCodeListByCodId(codId);
        return list;
    }
	
	// 완제품 LOT
	public List<Map<String, Object>> getFilteredProductLots(String lotCode, String lotStatus, String prdType) {
		
		List<Map<String, Object>> rawList = lotMapper.selectFilteredProductLots(lotCode, lotStatus, prdType);
		
		List<Map<String, Object>> converted = new ArrayList<>();
		for (Map<String, Object> row : rawList) {
            Map<String, Object> newRow = new HashMap<>();
            newRow.put("id", row.get("ID"));
            newRow.put("text", row.get("TEXT"));
            newRow.put("children", ((Number) row.get("CHILDREN")).intValue() > 0); // boolean으로 변환
            converted.add(newRow);
        }
		
	    return converted;
	}

	// 하위 LOT (공정리스트, 자재리스트, 설비리스트)
	public List<Map<String, Object>> getLotNodeCategories(Long prdLotId) {
	    List<Map<String, Object>> children = new ArrayList<>();

	    children.add(Map.of(
	        "id", "prd_" + prdLotId + "_prc",
	        "text", "공정",
	        "children", true
	    ));

	    children.add(Map.of(
	        "id", "prd_" + prdLotId + "_mat",
	        "text", "자재",
	        "children", true
	    ));

	    children.add(Map.of(
	        "id", "prd_" + prdLotId + "_eqp",
	        "text", "설비",
	        "children", true
	    ));
	    
	    return children;
	}

	// 공정리스트
	public List<Map<String, Object>> getProcessNodes(Long prdLotId) {
		
		List<Map<String, Object>> rawList = lotMapper.selectProcessNodes(prdLotId);
		
		List<Map<String, Object>> converted = new ArrayList<>();
		for (Map<String, Object> row : rawList) {
            Map<String, Object> newRow = new HashMap<>();
            newRow.put("id", row.get("ID"));
            newRow.put("text", row.get("TEXT"));
            newRow.put("children", ((Number) row.get("CHILDREN")).intValue() > 0); // boolean으로 변환
            converted.add(newRow);
        }
		
	    return converted;
	}

	// 자재리스트
	public List<Map<String, Object>> getMaterialNodes(Long prdLotId) {
		
		List<Map<String, Object>> rawList = lotMapper.selectMaterialNodes(prdLotId);
				
		List<Map<String, Object>> converted = new ArrayList<>();
		for (Map<String, Object> row : rawList) {
            Map<String, Object> newRow = new HashMap<>();
            newRow.put("id", row.get("ID"));
            newRow.put("text", row.get("TEXT"));
            newRow.put("children", ((Number) row.get("CHILDREN")).intValue() > 0); // boolean으로 변환
            converted.add(newRow);
        }
		
	    return converted;
	}

	// 설비리스트
	public List<Map<String, Object>> getEquipmentNodes(Long prdLotId) {
		
		List<Map<String, Object>> rawList = lotMapper.selectEquipmentNodes(prdLotId);
		
		List<Map<String, Object>> converted = new ArrayList<>();
		for (Map<String, Object> row : rawList) {
            Map<String, Object> newRow = new HashMap<>();
            newRow.put("id", row.get("ID"));
            newRow.put("text", row.get("TEXT"));
            newRow.put("children", ((Number) row.get("CHILDREN")).intValue() > 0); // boolean으로 변환
            converted.add(newRow);
        }
		
	    return converted;
	}

}
