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
	    
	    System.out.println("lotCode = " + id); // 255 확인
	    System.out.println("lotCode = " + lotCode); // 255 확인
	    System.out.println("lotStatus = " + lotStatus); // null
	    System.out.println("prdType = " + prdType); // null
		
        if (id == null) {
            // 최상위 노드: 완제품 LOT
        	List<Map<String, Object>> rawList = lotMapper.getFilteredProductLots(lotCode, lotStatus, prdType);
        	
        	System.out.println("rawList : " + rawList);
        	
            List<Map<String, Object>> converted = new ArrayList<>();
            for (Map<String, Object> row : rawList) {
                Map<String, Object> newRow = new HashMap<>();
                newRow.put("id", row.get("ID"));
                newRow.put("text", row.get("TEXT"));
                newRow.put("children", row.get("CHILDREN"));
                converted.add(newRow);
            }
            
            System.out.println("converted : " + converted);

            return converted;
        } else if (lotCode.startsWith("prd_")) {
            int prdLotId = Integer.parseInt(lotCode.replace("prd_", ""));
            return lotMapper.selectProcessLotNodes(prdLotId);
        } else if (lotCode.startsWith("prc_")) {
            int prcLotId = Integer.parseInt(lotCode.replace("prc_", ""));
            return lotMapper.selectMaterialAndEquipmentNodes(prcLotId);
        }
        return Collections.emptyList();
    }


}
