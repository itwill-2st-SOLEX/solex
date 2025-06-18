package kr.co.itwillbs.solex.process;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

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
	public void insertProcesses(List<Map<String, Object>> insertList) {
		
		for (Map<String, Object> row : insertList) {
		    Object quaNm = row.get("QUA_NM");

		    if (quaNm != null) {
		        try {
		            // 문자열이든 숫자든 상관없이 int로 변환 시도
		            int quaId = Integer.parseInt(quaNm.toString());
		            row.put("QUA_ID", quaId);  // DB insert 시 이걸 사용
		        } catch (NumberFormatException e) {
		            System.out.println("QUA_ID 변환 실패: " + quaNm);
		            row.put("QUA_ID", null); // 또는 적절한 예외 처리
		        }
		    }
		}

		processMapper.insertProcesses(insertList);
	}

	// 공정 기존 수정
	public void updateprocesses(List<Map<String, Object>> updateList) {
		
		for (Map<String, Object> row : updateList) {
		    Object quaNm = row.get("QUA_NM");

		    if (quaNm != null) {
		        try {
		            // 문자열이든 숫자든 상관없이 int로 변환 시도
		            int quaId = Integer.parseInt(quaNm.toString());
		            row.put("QUA_ID", quaId);  // DB insert 시 이걸 사용
		        } catch (NumberFormatException e) {
		            System.out.println("QUA_ID 변환 실패: " + quaNm);
		            row.put("QUA_ID", null); // 또는 적절한 예외 처리
		        }
		    }
		}
		
		processMapper.updateprocesses(updateList);
	}

}
