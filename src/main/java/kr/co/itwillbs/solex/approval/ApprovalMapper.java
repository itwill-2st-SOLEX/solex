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
	
	List<Map<String, Object>> selectTodoDocumentList(long loginEmpId);
	
	List<Map<String, String>> insertAL(Map<String, Object> aplmap);
	Map<String, Object> selectById(long aplId);
	Map<String, Object> selectByEmpIdAndDocId(long loginEmpId, long docId);
	void updateByMap(Map<String, Object> apl);
}
