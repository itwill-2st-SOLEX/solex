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
	public Map<String, Object> getTodoDocumentDetail(String docId, String docTypeCode, long loginEmpId) {
		switch (docTypeCode) {
        case "doc_type_01":
        	return documentMapper.selectDetailLeave(docId);
        case "doc_type_02":
        	return documentMapper.selectDetailOutwork(docId);
        case "doc_type_03":
        	return documentMapper.selectDetailResignation(docId);
        default:
        	throw new IllegalArgumentException("알 수 없는 문서 타입입니다: " + docTypeCode);
		}
	}
	
	// 기안서 결재 (승인/반려)
	public void approvalDocument(Map<String, Object> approvalRequest, long loginEmpId) {
		approvalRequest.put("emp_id", loginEmpId);
		
		approvalMapper.updateApprovalLine(approvalRequest);
		
		String status = (String) approvalRequest.get("status");
        Long   docId  = ((Number)approvalRequest.get("docId")).longValue();
        Long   aplId  = ((Number)approvalRequest.get("aplId")).longValue();
        Integer step  = (Integer)approvalRequest.get("stepNo");
        
        if (status.equals("apl_sts_02")) {
        	approvalRequest.replace("status", "doc_sts_02");
        	documentMapper.updateDocumentStatus(approvalRequest);
        }
        else if (status.equals("apl_sts_03")) {
        	approvalRequest.replace("status", "doc_sts_03");
        	if (step == 1) {
        		documentMapper.updateDocumentStatus(approvalRequest);
        	} 	
        } 
        else {
        	System.out.println("말도 안되는 상태값임");
        }
       
    }
}
