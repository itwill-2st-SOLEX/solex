package kr.co.itwillbs.solex.approval;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;

import kr.co.itwillbs.solex.document.DocumentMapper;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ApprovalService {
	
	private final ApprovalMapper approvalMapper;
	private final DocumentMapper documentMapper;
	// 결재 해야될 기안서 리스트
	public List<Map<String, Object>> getTodoDocumentList(long loginEmpId) {
        return approvalMapper.selectTodoDocumentList(loginEmpId);
    }
	
	// 결재 해야하는 기안서 상세보기
	public Map<String, Object> getTodoDocumentDetail(long docId, String docTypeCode, long loginEmpId) {
		switch (docTypeCode) {
        case "doc_type_01":
        	return approvalMapper.selectDetailLeave(doc_id);
        case "doc_type_02":
        	return approvalMapper.selectDetailOutwork(doc_id);
        case "doc_type_03":
        	return approvalMapper.selectDetailResignation(doc_id);
        default:
        	throw new IllegalArgumentException("알 수 없는 문서 타입입니다: " + docTypeCode);
		}
		
        return null;
    }
	
	// 기안서 결재 (승인/반려)
	public void approvalDocument(Map<String, Object> approvalRequest, long loginEmpId) {
		long docId = (Long) approvalRequest.get("docId");
		
		Map<String, Object> approvalLine = approvalMapper.selectByEmpIdAndDocId(loginEmpId, docId);
		
		// 3) 승인/반려 처리
		approvalLine.put("approveSts", approvalRequest.get("sts"));
		approvalLine.put("actionTime", LocalDateTime.now());
		approvalMapper.updateByMap(approvalLine);
		
		String decision = null;
		if(approvalRequest.get("sts").equals("REJECTED")) {
			decision = "REJECTED";
		} else if(approvalRequest.get("sts").equals("APPROVED")) {
			decision = "APPROVED";
		}
		
		documentMapper.updateFinalSts(docId, decision);
    }
	
}
