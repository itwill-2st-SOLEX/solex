package kr.co.itwillbs.solex.document;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import kr.co.itwillbs.solex.approval.ApprovalMapper;
import kr.co.itwillbs.solex.employee.EmployeeMapper;

@Service
public class DocumentService {

	@Autowired
	private DocumentMapper documentMapper;
	@Autowired
	private EmployeeMapper employeeMapper;
	@Autowired
	private ApprovalMapper approvalMapper;
	
	// 모달 기안서 공통코드로 불러오기
	public List<Map<String, String>> getdocTypeList() {
        return documentMapper.getdocTypeList();
    }
	
	// 기안서 목록 무한스크롤
	public List<Map<String, Object>> getDraftList(int offset, int size) {
        return documentMapper.selectDraftList(offset, size);
    }
	
	// 직급 공통코드 불러오기
	public List<Map<String, String>> getPosition(String group) {
		return documentMapper.getPosition(group);
	}
	
	// 로그인한 사원정보 
	public Map<String, Object> getEmpInfo(int emp_id) {
		return mapper.getEmpInfo(emp_id);
	}
	
	// 기안서 등록
	@Transactional
	public void registerDarafts(Map<String, Object> map, long loginEmpId) {
		// 파라미터의 map에 저장한 기안서의 id 가 저장된다는데 맞나 ?
		documentMapper.registerDocument(map);
		
		long docId = (Long) map.get("doc_id");
		String docType = (String) map.get("doc_type");

	    switch (docType) {
	        case "doc_type_01":  // 반/연차
	            documentMapper.registerLeaveDoc(map);
	            break;
	        case "doc_type_02":  // 출장/외근
	            documentMapper.registerbusinessOutworkDoc(map);
	            break;
	        case "doc_type_03":   // 사직
	            documentMapper.resignationDoc(map);
	            break;
	    }
	    
	    // 작성자 직급 sort 
        Map<String, Object> docEmployee = employeeMapper.selectJoinCodeDetail(loginEmpId);
        int docEmployeePosSort = (int) docEmployee.get("posSort");
        
        // 필요 상위 단계 수
        int steps = documentMapper.findSteps(docType);
        
		String catCd = (String) docEmployee.get("catCd");  // null 가능
		String depCd = (String) docEmployee.get("depCd");  // null 가능
		String teamCd = (String) docEmployee.get("teamCd"); // null 가능
        
        // 상위 결재자 체인 탐색
        List<Map<String, Object>> approverList = employeeMapper.selectApprovers(
	        		catCd,
	        		depCd, 
	        		teamCd, 
		        	docEmployeePosSort
        		);	
        
        for (int i = 0; i < Math.min(approverList.size(), steps); i++) {
            Map<String, Object> approver = approverList.get(i);
            approvalMapper.insertApprovalLine(docId, i + 1, catCd, depCd, teamCd, (String) approver.get("emp_pos_cd"));
        }

	}
	
	// 기안서 상세조회
	public Map<String, Object> selectDetailDoc(String doc_id, String docTypeCode) {
	    switch (docTypeCode) {
	        case "doc_type_01":
	        	return documentMapper.selectDetailLeave(doc_id);
	        case "doc_type_02":
	        	return documentMapper.selectDetailOutwork(doc_id);
	        case "doc_type_03":
	        	return documentMapper.selectDetailResignation(doc_id);
	        default:
	        	throw new IllegalArgumentException("알 수 없는 문서 타입입니다: " + docTypeCode);
	    }
		
	}

	
}
