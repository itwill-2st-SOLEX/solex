package kr.co.itwillbs.solex.workHistory;

import java.util.List;
import java.util.Map;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface WorkHistoryMapper {

	List<Map<String, Object>> selectWorkHistoryList(
			@Param("offset") int offset, 
			@Param("size") int size);
	
}
