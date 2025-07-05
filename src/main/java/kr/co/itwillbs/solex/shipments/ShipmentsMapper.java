package kr.co.itwillbs.solex.shipments;

import java.util.List;
import java.util.Map;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface ShipmentsMapper {
	
	// 페이징된 주문 상세 목록 쿼리
	List<Map<String, Object>> selectPagedOrderDataAsMap(
	    @Param("offset") int offset,
	    @Param("limit") int limit
	);

	// 주문 생성 쿼리
	int createOrderRequest(Map<String, Object> params);

	int createSujuOrderDetail(@Param("list") List<Map<String, Object>> items);

	int incrementOddSts(int odd_id);

	List<Map<String, Object>> selectOrderDetailById(int odd_id);
	
	
	
	
	

}
