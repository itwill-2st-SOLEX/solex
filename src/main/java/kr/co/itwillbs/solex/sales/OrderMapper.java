package kr.co.itwillbs.solex.sales;

import java.util.List;
import java.util.Map;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface OrderMapper {
	
	// 페이징된 주문 상세 목록 쿼리
	List<Map<String, Object>> selectPagedOrderDataAsMap(
	    @Param("offset") int offset,
	    @Param("limit") int limit,
	    @Param("searchKeyword") String searchKeyword // 파라미터 변경
	);

	List<Map<String, Object>> getSearchClientList(@Param("offset") int offset, @Param("limit")  int limit, @Param("searchKeyword") String searchKeyword);

	int countClientsByEmployeeId(int emp_id);

	List<Map<String, Object>> getSelectTop5PopularClients();

	List<Map<String, Object>> getSelectClientsByEmployeeId(int emp_id);

	List<Map<String, Object>> getSelectTop5PopularProducts();

	List<Map<String, Object>> getSearchProductList(@Param("searchKeyword") String searchKeyword);


	int createSujuOrder(Map<String, Object> safe);

	int createSujuOrderDetail(@Param("list") List<Map<String, Object>> items);

	boolean checkMaterialStock(Map<String, Object> orderData);

	

	void createPurchaseRequest(Map<String, Object> material);

	void deductStock(Map<String, Object> orderData);



	
	
	// 옵션 조합으로 옵션 ID 가져오기
	String getOptionIdByCombination(Map<String, Object> orderData);

	List<Map<String, Object>> getLackingMaterialsWithMine(@Param("opt_id") String opt_id,@Param("ord_cnt") int orderCount);
	
	// 상품별 옵션 가져오기
	List<Map<String, Object>> getOptionsByProduct(@Param("prd_id")String prd_id);

	List<Map<String, Object>> selectOptIdsForItems(List<Map<String, Object>> items);

	 /**
     * 1. 주문 기본 정보를 조회 (JOIN 포함)
     */
    Map<String, Object> selectOrderInfoById(long orderId);

    /**
     * 2. 특정 주문에 속한 모든 상세 항목 목록을 조회
     */
    List<Map<String, Object>> selectOrderItemsByOrderId(long orderId);
    
    /**
     * 3. 특정 상품에 속한 선택 가능한 모든 옵션 목록을 조회
     */
    List<Map<String, Object>> selectAllOptionsByProductId(@Param("prd_id") Object prd_id);

	

	// 여러 ID에 해당하는 주문 데이터를 Map 형태로 조회
    List<Map<String, Object>> findOrdersByIds(@Param("oddIds") List<Long> oddIds);

    // 특정 ID에 해당하는 주문을 삭제
    int deleteOrderById(@Param("oddId") Long oddId); // 삭제된 행의 수를 반환
    
    
    
    // 주문 헤더 업데이트 (ord_id 기준)
    int updateOrderHeader(Map<String, Object> orderPayload);

    // 특정 ord_id에 해당하는 모든 주문 상세 삭제
    int deleteOrderDetailsByOrdId(@Param("ordId") int ordId);

    // 주문 상세 항목 하나를 삽입 (새로운 odd_id 생성)
    int insertOrderDetail(Map<String, Object> item);
}
