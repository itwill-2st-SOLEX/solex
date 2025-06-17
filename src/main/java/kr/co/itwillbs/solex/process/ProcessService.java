package kr.co.itwillbs.solex.process;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class ProcessService {
	
	@Autowired
	private ProcessMapper processMapper;

	// 공정정보 리스트 무한스크롤
	public List<Map<String, Object>> selectPagedProcessList(int perPage, int offset) {
		
		List<Map<String, Object>> processList = processMapper.selectPagedProcessList(perPage, offset);
		
		return processList;
	}

	public int selectTotalProcessCount() {
		return processMapper.selectTotalProcessCount();
	}

	// 부서명 리스트 조회 API
	public List<Map<String, Object>> getDepartmentList() {
		return processMapper.getDepartmentList();
	}

	// 품질검사명 리스트 조회 API
	public List<Map<String, Object>> getQualityItemList() {
		return processMapper.getQualityItemList();
	}

}
