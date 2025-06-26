package kr.co.itwillbs.solex.material_orders;

import java.util.List;
import java.util.Map;

import org.apache.ibatis.annotations.Mapper;
@Mapper
public interface MaterialOrdersMapper {

	//자재 목록
	List<Map<String, Object>> getMaterialOrders();

	void materialOrderRegist(Map<String, Object> matordMap);

	//자재 발주등록에서 자재 id 가져오는 코드
	List<Map<String, Object>> getMatId();

	List<Map<String, Object>> getMaterialOrderList(int offset, int size);

	// 창고목록 - select box 
	List<Map<String, Object>> getWarehouseAndArea();
	
	
}
