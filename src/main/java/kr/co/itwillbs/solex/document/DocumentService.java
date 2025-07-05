package kr.co.itwillbs.solex.document;

import java.math.BigDecimal;
import java.time.LocalDateTime;
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
	public List<Map<String, Object>> getDraftList(int offset, int size, int emp_id) {
		System.out.println(emp_id);
        return documentMapper.selectDraftList(offset, size, emp_id);
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
	public void registerDarafts(Map<String, Object> map, int loginEmpId) {
		map.put("emp_id", loginEmpId);
		map.put("doc_reg_time", LocalDateTime.now());
		
		documentMapper.registerDocument(map);
		
		long docId = ((Integer) map.get("doc_id")).longValue();
		String docType = (String) map.get("doc_type");

	    switch (docType) {
	        case "doc_type_01":
	            documentMapper.registerLeaveDoc(map);
	            break;
	        case "doc_type_02":
	            documentMapper.registerbusinessOutworkDoc(map);
	            break;
	        case "doc_type_03":
	            documentMapper.resignationDoc(map);
	            break;
	    }
	    
	    // 작성자 직급 sort 
        Map<String, Object> docEmployee = employeeMapper.selectJoinCodeDetail(loginEmpId);
        
        int docEmployeePosSort = ((BigDecimal) docEmployee.get("POS_SORT")).intValue();
        // 필요 상위 단계 수
        Integer steps = documentMapper.findSteps(docType);
		String catCd = (String) docEmployee.get("EMP_CAT_CD");
		
		String depCd = null;
		if (docEmployee.get("EMP_DEP_CD") != null) {
			depCd = (String) docEmployee.get("EMP_DEP_CD");
		}
		String teamCd = null;
		if (docEmployee.get("EMP_DEP_CD") != null) {
			teamCd = (String) docEmployee.get("EMP_TEAM_CD");
		}
        
        // 상위 결재자 체인 탐색
        List<Map<String, Object>> upperRanks = employeeMapper.selectUpperPositions(docEmployeePosSort);        
        int total = Math.min(steps, upperRanks.size());   // 실제로 돌아야 할 횟수
        for (int i = 0; i < total; i++) {
            Map<String, Object> rank = upperRanks.get(i);
            String posCd = (String) rank.get("POS_CD");

            int stepNo = total - i;

            // 기본값은 ‘실제 코드’를 그대로 사용
            String catParam  = catCd;
            String depParam  = depCd;
            String teamParam = teamCd;

            switch (posCd) {
                case "pos_01":
                    // 사장 (예시) – 모두 공통 코드 00
                    catParam  = "cat_00";
                    depParam  = "dep_00";
                    teamParam = "team_00";
                    break;

                case "pos_02":
                    // 이사 – 부서·팀만 00
                    depParam  = "dep_00";
                    teamParam = "team_00";
                    break;

                case "pos_03":
                    // 부장 – 팀만 00
                    teamParam = "team_00";
                    break;

                case "pos_04":
                    // 팀장 – 그대로 사용
                    break;
            }

            approvalMapper.insertApprovalLine(
                docId,
                stepNo,
                catParam,
                depParam,
                teamParam,
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
