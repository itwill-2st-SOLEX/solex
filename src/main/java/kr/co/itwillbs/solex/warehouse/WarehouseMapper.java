package kr.co.itwillbs.solex.warehouse;

import java.util.List;
import java.util.Map;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface WarehouseMapper {

	List<Map<String, Object>> selectWarehouseList(@Param("offset") int offset, @Param("size") int size);

	Map<String, Object> selectWarehouseDetail(String whsId, Long loginEmpId);

	void insertWarehouse(Map<String, Object> warehouseRequest, Long loginEmpId);

	void upadteWarehouse(Map<String, Object> warehouseRequest, Long loginEmpId);

}
