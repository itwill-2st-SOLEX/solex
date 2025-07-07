package kr.co.itwillbs.solex.main;

import java.sql.Timestamp;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.TimeZone;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class MainService {

	@Autowired
	private MainMapper mainMapper;
	
	
	public Map<String, Object> selectEmpInfo(Long empId) {
		return mainMapper.selectEmpInfo(empId);
	}
	
	public List<Map<String,Object>> selectEvents(Map map){
		
		return mainMapper.selectEvents(map);
	}
	
	public List<Map<String,Object>> selectleave(Map map) {
		
		return mainMapper.selectleave(map);
	}
	
	public int insertEvent(Map map){

        // 이후 MyBatis 호출
        return mainMapper.insertEvent(map);
	}
	
	public int updateEvent(Map map) {
	
		return mainMapper.updateEvent(map);
	}
	
	public int deleteEvent(Map map) {
		
		return mainMapper.deleteEvent(map);
	}
		
	public List<Map<String, Object>> mainNoticeList() {
		return mainMapper.mainNoticeList();
	}
	
	public List<Map<String, Object>> mainApprovalList(Long empId) {
		return mainMapper.mainApprovalList(empId);
	}

}
