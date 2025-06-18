package kr.co.itwillbs.solex.material;

import java.util.List;
import java.util.Map;

import org.apache.ibatis.annotations.Mapper;
@Mapper
public interface MaterialMapper {

	//자재 목록
	List<Map<String, Object>> getMaterial();
	
	//자재 무한스크롤
	List<Map<String, Object>> getMaterialList(int offset, int size);

	//자재등록 공통코드 가져오기
	List<Map<String, Object>> getCommonCodes();
	
	//자재등록 공통코드 세부사항 가져오기 
	List<Map<String, Object>> getCommonCodeDetails();
	
	
}
