package kr.co.itwillbs.solex.warehouse;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class WarehouseService {
	
	@Autowired
	public WarehouseMapper warehouseMapper;

	public List<Map<String, Object>> getWarehouseList(int offset, int size, Long loginEmpId) {
		// TODO Auto-generated method stub
		return warehouseMapper.selectWarehouseList(offset, size, loginEmpId);
	}

	public Map<String, Object> getWarehouseDetail(String whsId, Long loginEmpId) {
		// TODO Auto-generated method stub
		return warehouseMapper.selectWarehouseDetail(whsId, loginEmpId);
	}

	public void registerWarehouse(Map<String, Object> warehouseRequest, Long loginEmpId) {
		warehouseMapper.insertWarehouse(warehouseRequest, loginEmpId);
		
	}

	public void upadteWarehouse(Map<String, Object> warehouseRequest, Long loginEmpId) {
		warehouseMapper.upadteWarehouse(warehouseRequest, loginEmpId);
		
	}
	

}
