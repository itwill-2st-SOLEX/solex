package kr.co.itwillbs.solex.product;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class ProductService {
	
	@Autowired
	private ProductMapper productMapper;

	public List<Map<String, Object>> getProductNameList() {
		// TODO Auto-generated method stub
		return productMapper.getProductNameList();
	}

	public List<Map<String, Object>> getProductOptions(String prd_id) {
		return productMapper.getProductOptions(prd_id);
	}

}
