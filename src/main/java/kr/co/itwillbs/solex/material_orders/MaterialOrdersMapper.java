package kr.co.itwillbs.solex.material_orders;

import java.util.List;
import java.util.Map;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.springframework.web.bind.annotation.RequestBody;
@Mapper
public interface MaterialOrdersMapper {

	//자재 목록
	List<Map<String, Object>> getMaterialOrders();

	void materialOrderRegist(Map<String, Object> matordMap);

	//자재 발주등록에서 자재 id 가져오는 코드
	List<Map<String, Object>> getMatId();

	List<Map<String, Object>> getMaterialOrderList(int offset, int size);

	// 창고목록 - select box 
	List<Map<String, Object>> getWarehouse(long matId);
	
	//창고구역 목록 - select_box
	List<Map<String, Object>> getArea(@Param("whsId") Integer whsId, @Param("matId") Integer matId);

	// 승인버튼 누르면 insert - 창고이력 warehouse_history
	int matAppWareHis(Map<String, Object> map);
	
	// 승인버튼 누르면 update - 구역 디테일 AreaDetail
	int matAppAreaDetail(Map<String, Object> map);

	// 승인버튼 누르면 update - 구역 Area
	int matAppArea(Map<String, Object> map);

	// 승인버튼 누르면 insert - 선입선출 StockLeger
	int matAppStockLeger(Map<String, Object> map);
	
	
}
