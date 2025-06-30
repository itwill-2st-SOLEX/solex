package kr.co.itwillbs.solex.area;

import java.util.List;
import java.util.Map;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface AreaMapper {

	void insertArea(Map<String, Object> area);

	List<Map<String,Object>> getWarehouseAreaHistory(Long areaId);

	List<Map<String, Object>> selectStockList(int offset, int size);

	void insertDetail(Map<String, Object> detail);

	List<Map<String, Object>> getStockDetail(@Param("itemId") int itemId, @Param("type") String type);

}
