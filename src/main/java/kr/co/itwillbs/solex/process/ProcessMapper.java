package kr.co.itwillbs.solex.process;

import java.util.List;
import java.util.Map;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface ProcessMapper {

	// 부서명 리스트 조회 API
	List<Map<String, Object>> getDepartmentList();
	
	// 품질검사명 리스트 조회 API
	List<Map<String, Object>> getQualityItemList();
	
	// 공정정보 리스트 무한스크롤
	List<Map<String, Object>> selectPagedProcessList(@Param("perPage") int perPage, @Param("offset") int offset);

	int selectTotalProcessCount();

	// 공정 신규 등록
	void insertProcesses(List<Map<String, Object>> insertList);

	// 공정 기존 수정
	void updateprocesses(List<Map<String, Object>> updateList);
	
	// 제품유형 리스트 무한스크롤
	List<Map<String, Object>> selectPagedPrdTypeList(@Param("perPage") int perPage, @Param("offset") int offset);

	int selectTotalPrdTypeCount();

	// 유형별 공정순서 조회
	List<Map<String, Object>> getTypeProcessList(@Param("prdType") String prdType);
    
}
