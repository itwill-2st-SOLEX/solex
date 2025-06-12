package kr.co.itwillbs.solex.employee;

import java.util.List;
import java.util.Map;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface EmployeeMapper {

    List<Map<String, Object>> selectOrgChartData();

	Map<String, Object> selectJoinCodeDetail(long loginEmpId);

	List<Map<String, Object>> selectUpperPositions(
				int docEmployeePosSort
			);

}

	