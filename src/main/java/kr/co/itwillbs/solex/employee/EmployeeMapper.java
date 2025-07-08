package kr.co.itwillbs.solex.employee;

import java.util.List;
import java.util.Map;

import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface EmployeeMapper {

    List<Map<String, Object>> selectOrgChartData();

	Map<String, Object> selectJoinCodeDetail(long loginEmpId);

	List<Map<String, Object>> selectUpperPositions(int docEmployeePosSort);

	Map<String, Object> findByEmpNum(long empNum);

}

	