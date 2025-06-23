package kr.co.itwillbs.solex.emp;

import java.util.List;
import java.util.Map;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface EmpMapper {

	//인사등록
	void insertEmp(Map<String, Object> empMap);

	//인사목록 (재직중)
	List<Map<String, Object>> getEmpListFiltered(@Param("searchType")String searchType, @Param("searchKeyword")String searchKeyword, @Param("includeEmpSts")String includeEmpSts);

	//인사수정을 위한 json 생성
    List<Map<String, Object>> findAllItems();

    List<Map<String, Object>> getAllCodeDetails();

    List<Map<String, Object>> getStsCodes(); // 재직 상태 코드만

	List<Map<String, Object>> getempList(@Param("offset") int offset, @Param("size") int size);

	//공코 가져오기 위한
	List<Map<String, Object>> getAllcodes();

	//수정하기 위한
	Map<String, Object> getEmpDetail(@Param("empNum") String empNum);
	
	//수정한 내용을 등록하기 위한 
	int modifyMap(Map<String, Object> empModifyMap);



}
