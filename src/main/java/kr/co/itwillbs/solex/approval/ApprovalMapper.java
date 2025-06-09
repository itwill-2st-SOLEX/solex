package kr.co.itwillbs.solex.approval;

import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface ApprovalMapper {

	void insertApprovalLine(long docId, int i, String catCd, String depCd, String teamCd, String string);

}
