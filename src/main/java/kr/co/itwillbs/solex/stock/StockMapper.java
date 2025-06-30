package kr.co.itwillbs.solex.stock;

import java.util.List;
import java.util.Map;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface StockMapper {

	List<Map<String, Object>> selectStockList(@Param("offset") int offset, @Param("size") int size);

	List<Map<String,Object>> selectWarehouseDetail(String whsId);

	void insertWarehouse(Map<String, Object> warehouseRequest);

	void upadteWarehouse(Map<String, Object> warehouseRequest, Long loginEmpId);

}
