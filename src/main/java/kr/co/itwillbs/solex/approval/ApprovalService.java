package kr.co.itwillbs.solex.approval;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import kr.co.itwillbs.solex.document.DocumentMapper;

@Service
public class ApprovalService {
	
	@Autowired
	private ApprovalMapper approvalMapper;
	@Autowired
	private DocumentMapper documentMapper;
	
	// 결재 해야될 기안서 리스트
	public List<Map<String, Object>> getTodoDocumentList(int offset, int size, long loginEmpId) {
        return approvalMapper.selectTodoDocumentList(offset, size, loginEmpId);
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
	public void approvalDocument(Map<String, Object> approvalRequest, long docId, long loginEmpId) {
		approvalRequest.put("emp_id", loginEmpId);
		approvalRequest.put("docId", docId);
		
		System.out.println(approvalRequest);
		
		approvalMapper.updateApprovalLine(approvalRequest);
		
		
		String status = (String) approvalRequest.get("status");
        Long   aplId  = Long.valueOf(approvalRequest.get("aplId").toString());
        Integer step  = Integer.valueOf(approvalRequest.get("stepNo").toString());
        String docType  = (String) approvalRequest.get("docType");
        String leaveType  = (String) approvalRequest.get("leaveType");
        
        long usedDays;
        
        if (status.equals("apl_sts_02")) {
        	approvalRequest.replace("status", "doc_sts_02");
        	
        	if (docType.equals("doc_type_01")) {
        		
        		Long empId  = Long.valueOf(approvalRequest.get("empId").toString());
        		// 날짜 문자열 → OffsetDateTime 파싱
                OffsetDateTime start = OffsetDateTime.parse((String) approvalRequest.get("leaStartDate"));   // "2025-06-02T03:00:00.000+00:00"
                OffsetDateTime end   = OffsetDateTime.parse((String) approvalRequest.get("leaEndDate"));
        		
        		if ("반차".equals(leaveType)) {
                    usedDays = (long) 0.5;                      // 반차를 1로 처리 (0.5로 쓰고 싶으면 0.5)
                } else {                               // 연차
                    usedDays   = ChronoUnit.DAYS.between(start, end) + 1;   // 양쪽 날짜 모두 포함
                }
        		
        		documentMapper.addUsedDays(empId, usedDays);
        	}
        	if (step == 1) {
        		documentMapper.updateDocumentStatus(approvalRequest);
        	}
        }
        else if (status.equals("apl_sts_03")) {
        	approvalRequest.replace("status", "doc_sts_03");
        	documentMapper.updateDocumentStatus(approvalRequest);
        } 
    }
}
