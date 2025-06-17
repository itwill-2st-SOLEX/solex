package kr.co.itwillbs.solex.process;

import java.util.List;
import java.util.Map;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface ProcessMapper {

	// 공정정보 리스트 무한스크롤
	List<Map<String, Object>> selectPagedProcessList(@Param("perPage") int perPage, @Param("offset") int offset);
    
	int selectTotalProcessCount();
    
}
