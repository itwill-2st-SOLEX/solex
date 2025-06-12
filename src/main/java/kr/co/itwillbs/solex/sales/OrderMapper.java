package kr.co.itwillbs.solex.sales;

import java.util.List;
import java.util.Map;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface OrderMapper {
	
//	List<Map<String, Object>> selectClients(Map<String, Object> params);
//
//	int createClients(Map<String , Object>param);
//
//	Map<String, Object> getClientById(int clientId);
//
//	int updateClient(Map<String, Object> param);
//
//	List<Map<String, Object>> getSearchClients(Map<String, Object> keyword);
	
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

	int getStockCount(@Param("productCode") String productCode);

	int createSujuOrder(Map<String, Object> safe);

	int createSujuOrderDetail(Map<String, Object> safe);

	boolean checkMaterialStock(Map<String, Object> orderData);

	List<Map<String, Object>> sgetLackingMaterials(Map<String, Object> orderData);

	void createPurchaseRequest(Map<String, Object> material);

	void deductStock(Map<String, Object> orderData);

	List<Map<String, Object>> getLackingMaterials(Map<String, Object> orderData);

	List<Map<String, Object>> getColors(String prd_cd);
	
}
