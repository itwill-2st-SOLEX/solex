package kr.co.itwillbs.solex.warehouse;

import java.util.List;
import java.util.Map;

import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface WarehouseMapper {

	List<Map<String, Object>> selectWarehouseList(int offset, int size, Long loginEmpId);

	Map<String, Object> selectWarehouseDetail(String whsId, Long loginEmpId);

	void insertWarehouse(Map<String, Object> warehouseRequest, Long loginEmpId);

	void upadteWarehouse(Map<String, Object> warehouseRequest, Long loginEmpId);

}
