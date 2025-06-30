package kr.co.itwillbs.solex.equipment;

import java.util.List;
import java.util.Map;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface EquipmentMapper {
	
	// 페이징된 설비 목록 쿼리
	List<Map<String, Object>> selectPagedEquipmentDataAsMap(
	    @Param("offset") int offset,
	    @Param("limit") int limit
	);


	// 공정 정보, 제조사 정보 조회
	List<Map<String, Object>> getProcessList();
	List<Map<String, Object>> getClientList();


	// 설비 생성
	Integer createEquipment(Map<String, Object> params);

	// 설비 상세 조회
	List<Map<String, Object>> getEquipmentDetail(@Param("eqp_code") String eqp_code);

	// 설비 수정
	Integer updateEquipment(Map<String, Object> params);


	List<Map<String, Object>> getTeam(int processId);

	// // 주문 상세 조회 쿼리
	// List<Map<String, Object>> getOrderDetail(@Param("odd_id") String odd_id);


	// // 승인시 동작되는 쿼리 //
	// // 재고 조회 쿼리
	// List<String> checkStock(Map<String, Object> params);

	// // 재고 차감 쿼리
	// Integer updateStock(Map<String, Object> params);

	// // 주문 상태 변경 쿼리
	// Integer updateOrderStatus(Map<String, Object> params);
	// // 승인시 동작되는 쿼리 //

}
