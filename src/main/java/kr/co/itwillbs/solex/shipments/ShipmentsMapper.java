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

	// 주문 상세 조회 쿼리
	List<Map<String, Object>> getOrderDetail(@Param("odd_id") String odd_id);


	// 승인시 동작되는 쿼리 //
	// 재고 조회 쿼리
	List<String> checkStock(Map<String, Object> params);

	// 재고 차감 쿼리
	Integer updateStock(Map<String, Object> params);

	// 주문 상태 변경 쿼리
	Integer updateOrderStatus(Map<String, Object> params);
	// 승인시 동작되는 쿼리 //

}
