package kr.co.itwillbs.solex.code;

import java.util.List;
import java.util.Map;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface CodeMapper {

	// 공통코드 리스트 조회
	List<CodeDTO> getCodeList();
	
	// 공통코드 무한스크롤
	List<CodeDTO> selectPagedCodeList(@Param("offset") int offset,
            @Param("perPage") int perPage,
            @Param("sort") String sort,
            @Param("dir") String dir,
            @Param("codYn") String codYn);

	int selectTotalCount(@Param("codYn") String codYn);

	// 공통코드 신규 행 추가
	void insertCodes(List<CodeDTO> insertList);

	// 공통코드 기존 행 수정
	void updateCodes(List<CodeDTO> updateList);

	// 상세공통코드 무한스크롤
	List<Map<String, Object>> selectPagedDetailCodeList(@Param("codId") String codId,
            @Param("offset") int offset,
            @Param("limit") int limit,
            @Param("sortColumn") String sortColumn,
            @Param("sortDirection") String sortDirection);

	int selectDetailCodeTotalCount(@Param("codId") String codId);

	// 상세공통코드 신규 행 추가
	void insertDetailCodes(List<Map<String, Object>> insertList);

	// 상세공통코드 기존 행 수정
	void updateDetailCodes(List<Map<String, Object>> updateList);
	
	

}
