package kr.co.itwillbs.solex.products;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class ProductsService {

	@Autowired
	private ProductsMapper productsMapper;
	
	public List<Map<String, Object>> getProductsList() {
		return productsMapper.selectProductsLists();
	}

}
