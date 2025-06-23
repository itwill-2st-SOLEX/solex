package kr.co.itwillbs.solex.process;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ProcessService {
	
	@Autowired
	private ProcessMapper processMapper;

	// 부서명 리스트 조회 API
	public List<Map<String, Object>> getDepartmentList() {
		return processMapper.getDepartmentList();
	}
	
	// 품질검사명 리스트 조회 API
	public List<Map<String, Object>> getQualityItemList() {
		return processMapper.getQualityItemList();
	}

	// 공정정보 리스트 무한스크롤
	public List<Map<String, Object>> selectPagedProcessList(int perPage, int offset) {
		
		List<Map<String, Object>> processList = processMapper.selectPagedProcessList(perPage, offset);
		
		return processList;
	}

	public int selectTotalProcessCount() {
		return processMapper.selectTotalProcessCount();
	}

	// 공정 신규 등록
	@Transactional
	public void insertProcesses(List<Map<String, Object>> insertList) {
	    for (Map<String, Object> row : insertList) {
	        Object quaNm = row.get("QUA_NM");

	        if (quaNm != null) {
	            try {
	                int quaId = Integer.parseInt(quaNm.toString());
	                row.put("QUA_ID", quaId);
	            } catch (NumberFormatException e) {
	                System.out.println("QUA_ID 변환 실패: " + quaNm);
	                row.put("QUA_ID", null);
	            }
	        }
	        
	        processMapper.insertProcess(row); // 여기서 단일 insert 호출
	    }
	}

	// 공정 기존 수정
	@Transactional
	public void updateProcesses(List<Map<String, Object>> updateList) {
	    for (Map<String, Object> row : updateList) {
	        Object quaNm = row.get("QUA_NM");

	        if (quaNm != null) {
	            try {
	                int quaId = Integer.parseInt(quaNm.toString());
	                row.put("QUA_ID", quaId);
	            } catch (NumberFormatException e) {
	                System.out.println("QUA_ID 변환 실패: " + quaNm);
	                row.put("QUA_ID", null);
	            }
	        }

	        processMapper.updateProcess(row); // 단건 update로 변경
	    }
	}

	// 제품유형 리스트 무한스크롤
	public List<Map<String, Object>> selectPagedPrdTypeList(int perPage, int offset) {
		return processMapper.selectPagedPrdTypeList(perPage, offset);
	}

	public int selectTotalPrdTypeCount() {
		return processMapper.selectTotalPrdTypeCount();
	}

	// 유형별 공정순서 조회
	public List<Map<String, Object>> getTypeProcessList(String prdType) {
		return processMapper.getTypeProcessList(prdType);
	}
	
	// 공정리스트 조회
	public List<Map<String, Object>> getAllProcessList() {
	    return processMapper.selectAllProcesses();
	}
	
	// 공정순서 신규 등록
	@Transactional
	public void insertTypeProcesses(List<Map<String, Object>> insertList) {
	    for (Map<String, Object> row : insertList) {
	        Object pcp_seq = row.get("PCP_SEQ");

	        if (pcp_seq != null) {
	            try {
	                int pcpSeq = Integer.parseInt(pcp_seq.toString());
	                row.put("PCP_SEQ", pcpSeq);
	            } catch (NumberFormatException e) {
	                System.out.println("PCP_SEQ 변환 실패: " + pcp_seq);
	                row.put("PCP_SEQ", null);
	            }
	        }

	        processMapper.insertTypeProcess(row);  // 👈 단건 호출로 변경 필요
	    }
	}

	// 공정순서 기존 수정
	@Transactional
	public void updateTypeProcesses(List<Map<String, Object>> updateList) {
	    for (Map<String, Object> row : updateList) {
	        try {
	            int pcpID = Integer.parseInt(row.get("PCP_ID").toString());
	            int prcID = Integer.parseInt(row.get("PRC_ID").toString());
	            int pcpSeq = Integer.parseInt(row.get("PCP_SEQ").toString());

	            row.put("PCP_ID", pcpID);
	            row.put("PRC_ID", prcID);
	            row.put("PCP_SEQ", pcpSeq);

	            processMapper.updateTypeProcess(row);  // 👈 단건 호출
	        } catch (NumberFormatException e) {
	            System.out.println("공정순서 수정 중 변환 실패: " + row);
	        }
	    }
	}
	
	// 공정순서 삭제
	@Transactional
    public void deleteTypeProcesses(List<Map<String, Object>> deleteList) {
        for (int i = deleteList.size() - 1; i >= 0; i--) {
            Map<String, Object> row = deleteList.get(i);

            Object pcpIdObj = row.get("PCP_ID");
            if (pcpIdObj != null) {
                try {
                    int pcpId = Integer.parseInt(pcpIdObj.toString());
                    row.put("PCP_ID", pcpId);
                    
                    System.out.println("서비스row : " + row);

                    processMapper.deleteTypeProcess(row);
                } catch (NumberFormatException e) {
                    System.out.println("PCP_ID 변환 실패: " + pcpIdObj);
                }
            }
        }
    }

}
