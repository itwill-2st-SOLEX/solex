package kr.co.itwillbs.solex.operator;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class OperatorService {
	
	@Autowired
	OperatorMapper operatorMapper;
	
	Map<String, Object> operatorSummary(Long empId) {
		return operatorMapper.operatorSummary(empId);
	}
}
