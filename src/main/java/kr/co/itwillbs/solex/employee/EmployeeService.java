package kr.co.itwillbs.solex.employee;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class EmployeeService {

	@Autowired
	private EmployeeMapper employeeMapper;

	public List<Map<String, Object>> getOrgChartData() {
		return employeeMapper.getOrgChartData();
	}
}
