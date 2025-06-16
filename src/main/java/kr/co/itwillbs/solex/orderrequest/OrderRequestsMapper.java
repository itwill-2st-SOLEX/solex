package kr.co.itwillbs.solex.orderrequest;

import java.util.List;
import java.util.Map;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface OrderRequestsMapper {
	
	// 페이징된 주문 상세 목록 쿼리
	List<Map<String, Object>> selectPagedOrderDataAsMap(
	    @Param("offset") int offset,
	    @Param("limit") int limit
	);

}
