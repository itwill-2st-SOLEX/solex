package kr.co.itwillbs.solex.main;

import java.util.List;
import java.util.Map;

import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface MainMapper {
	
	Map<String, Object> selectEmpInfo(Long empId);
	
	List<Map<String,Object>> selectEvents(Map map);
	
	List<Map<String,Object>> selectleave(Map map);
	
	int insertEvent(Map map);
	
	int updateEvent(Map map);
	
	int deleteEvent(Map map);
	
	List<Map<String, Object>> mainNoticeList() ;
	
	List<Map<String, Object>> mainApprovalList(Long empId);
}
