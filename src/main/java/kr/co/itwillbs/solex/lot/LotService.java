package kr.co.itwillbs.solex.lot;

import java.security.Timestamp;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
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
    
    // ---------------- 작업지시 등록 시 ----------------
    public void insertLotCascade(Long oddId) {
        // 1. 제품 + 옵션 정보 조회
        Map<String, Object> lotInfo = lotMapper.selectLotInsertInfo(oddId);

        // 2. product_lot insert
        lotMapper.insertProductLot(lotInfo);
        
        // 3. insert 이후 prd_lot_id 조회
        Long prdLotId = lotMapper.selectPrdLotId(lotInfo);
        if (prdLotId == null) return;

        // 4. 작업지시 리스트 조회
        List<Map<String, Object>> workOrders = lotMapper.selectWorkOrdersByOddId(oddId);

        for (Map<String, Object> wrk : workOrders) {
            wrk.put("prdLotId", prdLotId);
            // 5. process_lot insert
            lotMapper.insertProcessLot(wrk);
            
            // 6. insert 이후 prc_lot_id 조회
            Long prcLotId = lotMapper.selectPrcLotId(wrk);
            if (prcLotId == null) continue;

            // 7. 매핑 insert
            Map<String, Object> mapping = new HashMap<>();
            mapping.put("prdLotId", prdLotId);
            mapping.put("prcLotId", prcLotId);
            lotMapper.insertProductProcessMapping(mapping);
        }
    }
    // ---------------- 자재 입고 시 ----------------
    public void createMaterialLot(Map<String, Object> map) {
    	// 1. 자재ID를 통해 자재코드 조회
    	Long mat_id = Long.parseLong((String) map.get("mat_id"));
    	String matCode = lotMapper.selectMaterialCodeById(mat_id);
    	
    	map.put("mat_code", matCode);
    	
    	// 2. 같은 날짜에 입고한적 있는지 MatLot 조회
        Integer nextSort = lotMapper.selectNextMaterialLotSort(map);
        int sort = (nextSort != null ? nextSort : 0) + 1;

        // LOT 코드 생성
        String matLotCode = "MAT-"
            + LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd")) // 오늘 날짜
            + "-" + matCode // 자재 코드
            + "-" + String.format("%03d", sort); // 순번

        map.put("mat_lot_code", matLotCode);
        map.put("mat_sort", sort);
        
        System.out.println("map : " + map);

        // 3. material_lot insert
        lotMapper.insertMaterialLot(map);
    }

    // ---------------- 최초 공정 시작 시 제품LOT 상태값 변경 ----------------
	public void updatePrdLotStatusWhenProcessStarts(Long wpoId) {
		// 1. 최초 공정인지 확인
	    boolean isFirstProcess = lotMapper.isFirstProcess(wpoId);

	    if (isFirstProcess) {
	        // 2. 최상위 LOT 상태를 '진행중(lot_status_02)'으로 변경
	        lotMapper.updatePrdLotStatusToInProgress(wpoId);
	    }
	}

	// ---------------- 창고 배정 시 제품LOT 상태값 변경 ----------------
	public void updatePrdLotStatusToComplete(Integer oddId) {
		// 1. 제품 LOT 상태를 완료(lot_status_03)로 변경
	    lotMapper.updatePrdLotStatusToComplete(oddId);
	}

}
