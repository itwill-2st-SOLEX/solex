package kr.co.itwillbs.solex.products;

import java.util.List;
import java.util.Map;

import org.apache.ibatis.annotations.Param;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class ProductsService {

	@Autowired
	private ProductsMapper productsMapper;
	
	public List<Map<String, Object>> getProductsList() {
		return productsMapper.selectProductsLists();
	}

	public List<Map<String, Object>> getPagedProductList(@Param("offset") int offset,
														@Param("perPage") int perPage, 
														@Param("prd_yn") String prdYn) {
		return productsMapper.selectPagedProductList(offset, perPage, prdYn);
	}

	public int getTotalProductCount(String prdYn) {
		return productsMapper.selectTotalProductCount(prdYn);
	}

	public List<Map<String, String>> getPrdUnitTypeList() {
		return productsMapper.selectPrdUnitTypeList();
	}

}
