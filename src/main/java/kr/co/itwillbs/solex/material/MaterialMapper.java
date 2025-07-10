package kr.co.itwillbs.solex.material;

import java.util.List;
import java.util.Map;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
@Mapper
public interface MaterialMapper {
	
	// 자재리스트
	List<Map<String, Object>> getMeterialNameList();

	//자재 목록
	List<Map<String, Object>> getMaterial();
	
	//자재 무한스크롤
	List<Map<String, Object>> getMaterialList(@Param("offset") int offset, @Param ("size") int size);

	//자재등록 공통코드 가져오기
	
	//자재등록 공통코드 세부사항 가져오기 
	List<Map<String, Object>> getCommonCodeDetails();
	
	//자재 단위 공코 가져오기
	List<Map<String, Object>> getMatUnits();

	//자재 등록이요 
	void registMat(Map<String, Object> matMap);
	
	// 자재 수정이요
	void updateGridCell(Map<String, Object> payload);
	
	
}
