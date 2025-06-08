package kr.co.itwillbs.solex.approval;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ApprovalService {

	@Autowired
	private ApprovalMapper mapper;
	
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
	
	// 기안서 등록
	@Transactional
	public void registerDarafts(Map<String, Object> map) {
		mapper.registerDocument(map);
		System.out.println("생성된 doc_id = " + map.get("doc_id"));
		if(map.get("doc_type").equals("doc_type_01")) {
			mapper.registerLeaveDoc(map);
		} else if(map.get("doc_type").equals("doc_type_02")) {
			mapper.registerbusinessOutworkDoc(map);
		} else if(map.get("doc_type").equals("doc_type_03")) {
			mapper.resignationDoc(map);
		}
	}
	
	// 기안서 상세조회
	public Map<String, Object> selectDetailDoc(String doc_id) {
		return mapper.selectDetailDoc(doc_id);
	}
	
}
