package kr.co.itwillbs.solex.material_orders;

import java.util.List;
import java.util.Map;

import org.apache.ibatis.annotations.Mapper;
@Mapper
public interface MaterialOrdersMapper {

	//자재 목록
	List<Map<String, Object>> getMaterialOrders();
	
	
}
