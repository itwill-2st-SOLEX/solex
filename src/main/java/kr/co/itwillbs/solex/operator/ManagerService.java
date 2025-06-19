package kr.co.itwillbs.solex.operator;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class ManagerService {
	
	@Autowired
	ManagerMapper managerMapper;
	
	public Map<String, Object> getManagerSummary(Long empId) {
		return managerMapper.getManagerSummary(empId);
	}
	
	public int getManagerCount(Long empId) {
		return managerMapper.getManagerCount(empId);
	}
	
	
	public List<Map<String, Object>> getManagerList(Map params){
		return managerMapper.getManagerList(params);
	}
}
