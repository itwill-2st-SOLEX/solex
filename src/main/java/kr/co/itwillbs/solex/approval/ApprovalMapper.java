package kr.co.itwillbs.solex.approval;

import java.util.List;
import java.util.Map;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface ApprovalMapper {
	
	// 모달 기안서 공통코드로 불러오기
	List<Map<String, String>> getdocTypeList();
	// 기안서 목록 무한스크롤
	List<Map<String, Object>> selectDraftList(@Param("offset") int offset, @Param("size") int size);
	// 직급 공통코드 불러오기
	List<Map<String, String>> getPosition(String group);
	// 기안서 등록
	void registerDocument(Map<String, Object> map);
	void registerLeaveDoc(Map<String, Object> map);
}
