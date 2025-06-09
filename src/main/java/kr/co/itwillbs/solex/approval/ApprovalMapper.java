package kr.co.itwillbs.solex.approval;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface ApprovalMapper {

	void insertApprovalLine(
			@Param("docId") long docId, 
			@Param("docId") int i, 
			@Param("docId") String catCd, 
			@Param("docId") String depCd, 
			@Param("docId") String teamCd, 
			@Param("docId") String string
			);

}
