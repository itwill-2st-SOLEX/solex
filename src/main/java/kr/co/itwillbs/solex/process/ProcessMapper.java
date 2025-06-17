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

	// 부서명 리스트 조회 API
	List<Map<String, Object>> getDepartmentList();

	// 품질검사명 리스트 조회 API
	List<Map<String, Object>> getQualityItemList();
    
}
