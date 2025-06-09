package kr.co.itwillbs.solex.document;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class DocumentService {

	@Autowired
	private DocumentMapper mapper;
	
	// 모달 기안서 공통코드로 불러오기
	public List<Map<String, String>> getdocTypeList() {
        return mapper.getdocTypeList();
    }
	
	// 기안서 목록 무한스크롤
	public List<Map<String, Object>> getDraftList(int offset, int size) {
        return mapper.selectDraftList(offset, size);
    }
	
	// 직급 공통코드 불러오기
	public List<Map<String, String>> getPosition(String group) {
		return mapper.getPosition(group);
	}
	
	// 로그인한 사원정보 
	public Map<String, Object> getEmpInfo(int emp_id) {
		return mapper.getEmpInfo(emp_id);
	}
	
	// 기안서 등록
	@Transactional
	public void registerDarafts(Map<String, Object> map) {
		mapper.registerDocument(map);
		String docType = (String) map.get("doc_type");

	    switch (docType) {
	        case "doc_type_01":
	            mapper.registerLeaveDoc(map);
	            break;
	        case "doc_type_02":
	            mapper.registerbusinessOutworkDoc(map);
	            break;
	        case "doc_type_03":
	            mapper.resignationDoc(map);
	            break;
	    }
	}
	
	// 기안서 상세조회
	public Map<String, Object> selectDetailDoc(String doc_id, String docTypeCode) {
	    switch (docTypeCode) {
	        case "doc_type_01":
	        	return mapper.selectDetailLeave(doc_id);
	        case "doc_type_02":
	        	return mapper.selectDetailOutwork(doc_id);
	        case "doc_type_03":
	        	return mapper.selectDetailResignation(doc_id);
	        default:
	        	throw new IllegalArgumentException("알 수 없는 문서 타입입니다: " + docTypeCode);
	    }
		
	}

	
}
