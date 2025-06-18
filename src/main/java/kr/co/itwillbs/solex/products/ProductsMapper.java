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

}
