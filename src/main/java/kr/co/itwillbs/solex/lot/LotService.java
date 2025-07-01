package kr.co.itwillbs.solex.lot;

import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
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
	
	// ------------------------------- 상세조회 -------------------------------
	// 최상위 LOT 상세조회
	public Map<String, Object> getProductLotDetail(Long prdLotId) {
        Map<String, Object> data = lotMapper.selectProductLotDetail(prdLotId);
        data.put("type", "product");
        return data;
    }

	// 공정 상세조회
    public Map<String, Object> getProcessDetail(Long prcLotId) {
        Map<String, Object> data = lotMapper.selectProcessLotDetail(prcLotId);
        data.put("type", "process");
        return data;
    }

    // 자재 상세조회
    public Map<String, Object> getMaterialDetail(Long matLotId) {
        Map<String, Object> data = lotMapper.selectMaterialLotDetail(matLotId);
        data.put("type", "material");
        return data;
    }

    // 설비 상세조회
    public Map<String, Object> getEquipmentDetail(Long eqpId) {
        Map<String, Object> data = lotMapper.selectEquipmentDetail(eqpId);
        data.put("type", "equipment");
        return data;
    }
    
    // ---------------- Insert ----------------
    public void createProductLot(Long wrkId) {
        Map<String, Object> lotData = lotMapper.getProductInfoByWrkId(wrkId);

        // lot 코드 생성 (예: 날짜 + 시퀀스)
        String lotCode = generateLotCode();
        lotData.put("lotCode", lotCode);

        lotMapper.insertProductLot(lotData);
    }

    private String generateLotCode() {
        return "LOT" + new SimpleDateFormat("yyyyMMddHHmmss").format(new Date());
    }

}
