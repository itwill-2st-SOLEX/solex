package kr.co.itwillbs.solex.warehouse;

import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import kr.co.itwillbs.solex.area.AreaMapper;
import kr.co.itwillbs.solex.employee.EmployeeMapper;
import kr.co.itwillbs.solex.product.ProductMapper;
import lombok.RequiredArgsConstructor;

@Service
public class WarehouseService {
	
	@Autowired
	public WarehouseMapper warehouseMapper;
	@Autowired
	public EmployeeMapper employeeMapper;
	@Autowired 
	public AreaMapper areaMapper;
	@Autowired 
	public ProductMapper productMapper;
	
	public List<Map<String, Object>> getWarehouseList(int offset, int size) {
		// TODO Auto-generated method stub
		return warehouseMapper.selectWarehouseList(offset, size);
	}

	public Map<String, Object> getWarehouseDetail(String whsId, Long loginEmpId) {
		// TODO Auto-generated method stub
		List<Map<String,Object>> rows = warehouseMapper.selectWarehouseDetail(whsId);
		 
		// ── ① 창고명·담당자 (첫 행에서만 꺼내면 됨) ──
		Map<String,Object> first = rows.get(0);
		Map<String,Object> result = new LinkedHashMap<>();
		result.put("WHS_NM", first.get("WHS_NM"));
		result.put("MGR_NM", first.get("MGR_NM"));
		
		// ── ② 구역 리스트 만들기 ──
        List<Map<String,Object>> areas = rows.stream()
            .map(r -> {
                Map<String,Object> a = new HashMap<>();
                a.put("AREA_ID", r.get("ARE_ID"));
                a.put("AREA_NM", r.get("ARE_NM"));
                return a;
            })
            .collect(Collectors.toList());
		
        result.put("AREAS", areas);
        return result;
	}

	@Transactional
	public void registerWarehouse(Map<String, Object> warehouseRequest) {
		long empNum   = Long.parseLong((String) warehouseRequest.get("whs_mgr"));       
		Map<String, Object> empMap = employeeMapper.findByEmpNum(empNum);
        Long empId = ((Number) empMap.get("EMP_ID")).longValue();
        
        // 2) Map 에 실제 PK 주입
        warehouseRequest.put("emp_id", empId);
		warehouseMapper.insertWarehouse(warehouseRequest);
		Long whsId = ((Number) warehouseRequest.get("whs_id")).longValue();
						
		List<Map<String, Object>> areas = (List<Map<String, Object>>) warehouseRequest.get("areas");
		
		if (areas == null || areas.isEmpty()) return;
		
		
		for (Map<String, Object> area : areas) {
			area.put("whs_id", whsId);   
			area.put("qty", 0L);
            areaMapper.insertArea(area);        // 단일 INSERT
            
            System.out.println("000000000000000000000000000");
            System.out.println(area);
            
            Long itemId = Long.parseLong((String) area.get("item_id")); 
            Long areaId = ((Number) area.get("are_id")).longValue();
            String areaTp = (String) area.get("area_tp");
            
            /* 3-2) AREA_DETAIL 분기 처리 */
            if ("area_type_02".equals(areaTp)) {
                // (A) 자재가 ‘제품(완제품)’이어서 Product-Option 들을 모두 매핑
                
                List<Map<String, Object>> options = productMapper.findByProductId(itemId);   // 옵션 목록 조회

                for (Map<String, Object> opt : options) {
                    Map<String, Object> detail = new HashMap<>();
                    detail.put("areaId", areaId);
                    detail.put("itemId", opt.get("OPT_ID"));
                    detail.put("qty", 0L); 
                    areaMapper.insertDetail(detail);      // 다건 INSERT
                }

            } else if ("area_type_01".equals(areaTp)) {
                // (B) 자재가 ‘원부자재’라면 옵션 없이 1건만 등록
                Map<String, Object> detail = new HashMap<>();
                detail.put("areaId", areaId);
                detail.put("itemId", itemId);
                detail.put("qty", 0L);
                areaMapper.insertDetail(detail);
            }
        }
        
	}

	public void upadteWarehouse(Map<String, Object> warehouseRequest, Long loginEmpId) {
		warehouseMapper.upadteWarehouse(warehouseRequest, loginEmpId);
		
	}

	public List<Map<String,Object>> getWarehouseAreaHistory(Long areaId, Long loginEmpId) {
		return areaMapper.getWarehouseAreaHistory(areaId);
	}
	
}
