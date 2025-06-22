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

	List<Map<String, String>> selectPrdUnitTypeList();

	List<Map<String, String>> selectPrdUnitTypesAsMap(String groupCode);

//	void insertProduct(Map<String, Object> productData);
//	void insertProductOptions(List<Map<String, String>> optionsList);
	
	// 제품 기본 정보 삽입
    // useGeneratedKeys와 keyProperty 설정으로 삽입 후 productMap에 prd_id가 채워집니다.
    int insertProduct(Map<String, Object> productMap);

    // 제품 옵션 정보 다건 삽입
    // List<Map<String, String>> 형태의 옵션 리스트를 받습니다.
//    int insertProductOption(List<Map<String, String>> options);
//    void insertProductOption(@Param("optionMap") Map<String, String> optionMap);
    void insertProductOption(Map<String, String> optionMap);
}
