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
import lombok.RequiredArgsConstructor;

@Service
public class WarehouseService {
	
	@Autowired
	public WarehouseMapper warehouseMapper;
	@Autowired
	public EmployeeMapper employeeMapper;
	@Autowired 
	public AreaMapper areaMapper;
	
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
		
		if (areas != null && !areas.isEmpty()) {
			for (Map<String, Object> a : areas) {
	            a.put("whs_id", whsId);          // FK
	            areaMapper.insertArea(a);        // 단일 INSERT
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
