package kr.co.itwillbs.solex.employee;

import java.util.List;
import java.util.Map;

import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface EmployeeMapper {

	Map<String, Object> selectJoinCodeDetail(long loginEmpId);

	List<Map<String, Object>> selectApprovers(String catCd, String depCd, String teamCd, int docEmployeePosSort);

}
