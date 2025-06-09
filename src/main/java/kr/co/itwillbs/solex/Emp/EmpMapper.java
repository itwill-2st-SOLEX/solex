package kr.co.itwillbs.solex.Emp;

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
	List<Map<String, Object>> selectEmp(@Param("searchType")String searchType, @Param("searchKeyword")String searchKeyword);

	//인사목록 (퇴사자 포함)
	List<Map<String, Object>> selectAllEmp(@Param("searchType")String searchType, @Param("searchKeyword")String searchKeyword);
	
	//인사수정을 위한 json 생성 
    List<Map<String, Object>> findAllItems();

	List<Map<String, Object>> findAllCodeDetails();

	List<Map<String, Object>> getDepCode();



    
}
