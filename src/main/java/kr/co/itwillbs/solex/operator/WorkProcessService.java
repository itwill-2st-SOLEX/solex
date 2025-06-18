package kr.co.itwillbs.solex.operator;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class WorkProcessService {
	
	@Autowired
	WorkProcessMapper wpMapper;
	
	public Map<String, Object> getWpSummary(Long empId) {
		return wpMapper.getWpSummary(empId);
	}
	
	public int getWpCount(Long empId) {
		return wpMapper.getWpCount(empId);
	}
	
	
	public List<Map<String, Object>> getWpList(Map params){
		return wpMapper.getWpList(params);
	}
}
