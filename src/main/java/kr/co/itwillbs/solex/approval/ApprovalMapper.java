package kr.co.itwillbs.solex.approval;

import java.util.List;
import java.util.Map;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface ApprovalMapper {

	void insertApprovalLine(
			@Param("docId") long docId, 
			@Param("stepNo") int i, 
			@Param("catCd") String catCd, 
			@Param("depCd") String depCd, 
			@Param("teamCd") String teamCd, 
			@Param("posCd") String posCd
			);
	
	List<Map<String, Object>> selectTodoDocumentList(@Param("offset") int offset, @Param("size") int size, @Param("loginEmpId") long loginEmpId);

	void updateApprovalLine(Map<String, Object> approvalRequest);
	
}
