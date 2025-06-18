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
	List<Map<String, Object>> getOptionsByProduct(@Param("prd_cd")String prd_cd);


	
}
