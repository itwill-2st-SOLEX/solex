package kr.co.itwillbs.solex.code;

import java.util.List;
import java.util.Map;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface CodeMapper {

	// 공통코드 무한스크롤
	List<Map<String, Object>> selectPagedCodeList(@Param("offset") int offset,
            @Param("perPage") int perPage,
            @Param("sort") String sort,
            @Param("dir") String dir,
            @Param("codYn") String codYn,
            @Param("keyword") String keyword);

	int selectTotalCount(@Param("codYn") String codYn);

	// 공통코드 신규 행 추가
	void insertCodes(List<Map<String, Object>> insertList);

	// 공통코드 기존 행 수정
	void updateCodes(List<Map<String, Object>> updateList);

	// 상세공통코드 무한스크롤
	List<Map<String, Object>> selectPagedDetailCodeList(@Param("codId") String codId,
            @Param("offset") int offset,
            @Param("limit") int limit,
            @Param("sortColumn") String sortColumn,
            @Param("sortDirection") String sortDirection,
            @Param("keyword") String keyword);

	int selectDetailCodeTotalCount(@Param("codId") String codId);

	// 상세공통코드 신규 행 추가
	void insertDetailCodes(List<Map<String, Object>> insertList);

	// 상세공통코드 기존 행 수정
	void updateDetailCodes(List<Map<String, Object>> updateList);
	
	

}
