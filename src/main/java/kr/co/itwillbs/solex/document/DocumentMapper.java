package kr.co.itwillbs.solex.document;

import java.util.List;
import java.util.Map;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface DocumentMapper {
	
	// 모달 기안서 공통코드로 불러오기
	List<Map<String, String>> getdocTypeList();
	// 기안서 목록 무한스크롤
	List<Map<String, Object>> selectDraftList(@Param("offset") int offset, @Param("size") int size);
	// 직급 공통코드 불러오기
	List<Map<String, String>> getPosition(String group);
	// 로그인한 사원정보 들고오기
	Map<String, Object> getEmpInfo(int emp_id);
	// 기안서 등록
	void registerDocument(Map<String, Object> map);
	void registerLeaveDoc(Map<String, Object> map);
	void registerbusinessOutworkDoc(Map<String, Object> map);
	void resignationDoc(Map<String, Object> map);
	
	// 기안서 상세조회
	Map<String, Object> selectDetailLeave(String doc_id);
	Map<String, Object> selectDetailOutwork(String doc_id);
	Map<String, Object> selectDetailResignation(String doc_id);
	
	Integer findSteps(String docType);
	
	void updateDocumentStatus(Map<String, Object> approvalRequest);
}
