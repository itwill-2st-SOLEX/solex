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

	int createSujuOrderDetail(Map<String, Object> safe);

	boolean checkMaterialStock(Map<String, Object> orderData);

	List<Map<String, Object>> sgetLackingMaterials(Map<String, Object> orderData);

	void createPurchaseRequest(Map<String, Object> material);

	void deductStock(Map<String, Object> orderData);

	List<Map<String, Object>> getLackingMaterials(Map<String, Object> orderData);

	List<Map<String, Object>> getColorsByProduct(String prd_cd);

	List<Map<String, Object>> getSizesByProductAndColor(@Param("prd_cd")String prd_cd,@Param("opt_color") String color);
	
	
	
	String getOptionIdByCombination(Map<String, Object> orderData);

	List<Map<String, Object>> getLackingMaterialsWithMine(@Param("opt_id") String opt_id,@Param("ord_cnt") int orderCount);
	
	List<Map<String, Object>> getHeightsByProductColorSize(
			@Param("prd_cd") String prd_cd,
			@Param("opt_color") String color,
			@Param("opt_size") String size);
	
	int getStockCount(
			@Param("prd_cd") String productCode, 
			@Param("opt_color") String color, 
			@Param("opt_size") String size, 
			@Param("opt_height") String height);


	
}
