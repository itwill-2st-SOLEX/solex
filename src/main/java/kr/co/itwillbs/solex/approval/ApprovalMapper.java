package kr.co.itwillbs.solex.approval;

import java.util.List;
import java.util.Map;

import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface ApprovalMapper {
	
	List<Map<String, String>> selectApprovalList();

}
