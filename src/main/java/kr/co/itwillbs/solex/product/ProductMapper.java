package kr.co.itwillbs.solex.product;

import java.util.List;
import java.util.Map;

import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface ProductMapper {
	
	// 자재리스트
	List<Map<String, Object>> getProductNameList();

	List<Map<String, Object>> findByProductId(Long itemId);

}
