package kr.co.itwillbs.solex.document;

import java.math.BigDecimal;
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
		return documentMapper.getEmpInfo(emp_id);
	}
	
	// 기안서 등록
	@Transactional
	public void registerDarafts(Map<String, Object> map, long loginEmpId) {
		map.put("emp_id", loginEmpId);
		documentMapper.registerDocument(map);
		
		long docId = ((Integer) map.get("doc_id")).longValue();
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
        
        int docEmployeePosSort = ((BigDecimal) docEmployee.get("POS_SORT")).intValue();
        // 필요 상위 단계 수
        Integer steps = documentMapper.findSteps(docType);
        System.out.println("saASDSASSAD           " + steps);
        
		String catCd = (String) docEmployee.get("EMP_CAT_CD");
		
		String depCd = null;
		if (docEmployee.get("EMP_DEP_CD") != null) {
			depCd = (String) docEmployee.get("EMP_DEP_CD");
		}
		String teamCd = null;
		if (docEmployee.get("EMP_DEP_CD") != null) {
			teamCd = (String) docEmployee.get("EMP_TEAM_CD");
		}
        
		System.out.println("docEmployeePosSort    " + docEmployeePosSort);
		System.out.println("catCd   ----------  " + catCd);
		System.out.println("depCd    ---------- " + depCd);
		System.out.println("teamCd   ----------   " + teamCd);
		
        // 상위 결재자 체인 탐색
        List<Map<String, Object>> upperRanks = employeeMapper.selectUpperPositions(docEmployeePosSort);        
        
        System.out.println("upperRanks                  :           " + upperRanks);
        System.out.println("upperRanks.size()           :           " + upperRanks.size());
        
        for (int i = 0; i < Math.min(steps, upperRanks.size()); i++) {
            Map<String, Object> rank = upperRanks.get(i);
            String posCd = (String) rank.get("POS_CD");
            
            System.out.println("rank                  :           " + rank);
            System.out.println("posCd                  :           " + posCd);
            System.out.println("i                  :           " + i);
            
            approvalMapper.insertApprovalLine(
                docId,
                i + 1,
                catCd,
                depCd,
                teamCd,
                posCd
            );
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
