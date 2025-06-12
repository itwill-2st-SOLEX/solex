package kr.co.itwillbs.solex.approval;

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

}
