package kr.co.itwillbs.solex.emp;

import java.util.List;
import java.util.Map;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

@Mapper
public interface EmpMapper {
	
	//인사등록
	int insertEmp(Map<String, Object> empMap);
	
	//인사목록 (재직중)
	List<Map<String, Object>> getEmpListFiltered(@Param("searchType")String searchType, @Param("searchKeyword")String searchKeyword, @Param("includeEmpSts")String includeEmpSts);
	
	//인사수정을 위한 json 생성 
    List<Map<String, Object>> findAllItems();

    List<Map<String, Object>> getAllCodeDetails();
    
    List<Map<String, Object>> getStsCodes(); // 재직 상태 코드만

	List<Map<String, Object>> getempList(@Param("offset") int offset, @Param("size") int size);


    
}
