package kr.co.itwillbs.solex.orderrequest;

import java.util.List;
import java.util.Map;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface OrderRequestsMapper {
	
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


	// 자재 주문 쿼리
	Integer insertMaterialOrder(Map<String, Object> params);
	// 자재 주문 상태 변경 쿼리
	Integer updateMaterialOrderStatus(Map<String, Object> params);


	// 자재 확인 쿼리
	List<String> checkMaterial(Map<String, Object> params);

	

	// 주문상세id랑 주문id랑 조인해서 주문상세가 1건이면 주문상세를 삭제하고 주문을 삭제
	List<Map<String, Object>> checkOrderDetail(Map<String, Object> params);

	// 주문상세 삭제 쿼리
	Integer rejectOrderDetailDelete(Map<String, Object> params);

	// 주문 삭제 쿼리
	Integer rejectOrderDelete(Map<String, Object> params);

}
