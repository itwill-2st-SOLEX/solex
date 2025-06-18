package kr.co.itwillbs.solex.boms;

import java.util.List;
import java.util.Map;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface BomsMapper {
	List<Map<String, Object>> selectBomList(
					@Param("opt_id") String opt_id, 
					@Param("offset") int offset,
					@Param("limit") int limit);

	int selectTotalBomCount(String opt_id);


}
