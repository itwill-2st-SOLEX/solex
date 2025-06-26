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
	
	// 트리구조 조회
	public List<Map<String, Object>> getFilteredProductLots(String id, String lotCode, String lotStatus, String prdType) {
		
		if (id != null && id.trim().isEmpty()) id = null;
		if (lotCode != null && lotCode.trim().isEmpty()) lotCode = null;
	    if (lotStatus != null && lotStatus.trim().isEmpty()) lotStatus = null;
	    if (prdType != null && prdType.trim().isEmpty()) prdType = null;
	    
        if (id == null) {
        	// 최상위 LOT 목록 조회
        	List<Map<String, Object>> rawList = lotMapper.getFilteredProductLots(lotCode, lotStatus, prdType);
        	
            List<Map<String, Object>> converted = new ArrayList<>();
            for (Map<String, Object> row : rawList) {
                Map<String, Object> newRow = new HashMap<>();
                newRow.put("id", row.get("ID"));
                newRow.put("text", row.get("TEXT"));
                
                // children을 boolean으로 변환
                Object childrenVal = row.get("CHILDREN");
                boolean hasChildren = false;
                if (childrenVal instanceof Number) {
                    hasChildren = ((Number) childrenVal).intValue() > 0;
                } else if (childrenVal instanceof String) {
                    hasChildren = "1".equals(childrenVal);
                }
                newRow.put("children", hasChildren);
                
                converted.add(newRow);
            }
            
            return converted;
        } else if (id.startsWith("prd_")) {
        	// 하위 공정 LOT 조회
            int prdLotId = Integer.parseInt(id.replace("prd_", ""));
            
            List<Map<String, Object>> rawList = lotMapper.selectProcessLotNodes(prdLotId);
            
            List<Map<String, Object>> converted = new ArrayList<>();
            for (Map<String, Object> row : rawList) {
                Map<String, Object> newRow = new HashMap<>();
                newRow.put("id", row.get("ID"));
                newRow.put("text", row.get("TEXT"));
                newRow.put("children", ((Number) row.get("CHILDREN")).intValue() > 0); // boolean으로 변환
                converted.add(newRow);
            }
            
            return converted;
        } else if (id.startsWith("prc_")) {
        	// 최하위 자재 / 설비 LOT 조회
            int prcLotId = Integer.parseInt(id.replace("prc_", ""));
            
            
            List<Map<String, Object>> rawList = lotMapper.selectMaterialAndEquipmentNodes(prcLotId);
            
            List<Map<String, Object>> converted = new ArrayList<>();
            for (Map<String, Object> row : rawList) {
                Map<String, Object> newRow = new HashMap<>();
                newRow.put("id", row.get("ID"));
                newRow.put("text", row.get("TEXT"));
                newRow.put("children", false);
                converted.add(newRow);
            }
            
            return converted;
        }
        return Collections.emptyList();
    }

}
