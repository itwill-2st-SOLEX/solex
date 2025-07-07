package kr.co.itwillbs.solex.products;

import java.util.List;
import java.util.Map;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface ProductsMapper {

	List<Map<String, Object>> selectProductsLists();

	List<Map<String, Object>> selectPagedProductList(@Param("offset") int offset,
													@Param("perPage") int perPage, 
													@Param("prdYn") String prdYn);
	int selectTotalProductCount(String prdYn);
	
	// 셀렉트 박스 정보 가져오기
	List<Map<String, String>> selectPrdUnitTypeList();
	List<Map<String, String>> selectPrdUnitTypesAsMap(String groupCode);
	
	// 제품 기본 정보 삽입
    int insertProduct(Map<String, Object> productMap);

    // 제품 옵션 정보 다건 삽입
    void insertProductOption(Map<String, String> optionMap);
    
    // 최근 제품 prd_id 가져옴.
	Long selectLatestProductId();

	List<Map<String, Object>> getProductOptionsByProductId(String prdId);

	void updateProduct(Map<String, Object> productData);
	void deleteProductOptions(String prdIdToUpdate);

	int selectOptionTotalCount(String prdId);

	int countExistingOption(Map<String, String> option);

	int existsByPrdCode(String prdCode);
	
	
	
}
