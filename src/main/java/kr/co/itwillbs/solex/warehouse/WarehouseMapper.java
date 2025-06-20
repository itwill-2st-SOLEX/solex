package kr.co.itwillbs.solex.warehouse;

import java.util.List;
import java.util.Map;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface WarehouseMapper {

	List<Map<String, Object>> selectWarehouseList(@Param("offset") int offset, @Param("size") int size);

	List<Map<String,Object>> selectWarehouseDetail(String whsId);

	void insertWarehouse(Map<String, Object> warehouseRequest);

	void upadteWarehouse(Map<String, Object> warehouseRequest, Long loginEmpId);

}
