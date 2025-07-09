package kr.co.itwillbs.solex.workHistory;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class WorkHistoryService {
	
	@Autowired
	private WorkHistoryMapper workHistoryMapper;

	public List<Map<String, Object>> getWorkHistoryList(int offset, int size) {
		return workHistoryMapper.selectWorkHistoryList(offset, size);
	}
	
	public Map<String, Object> getWorkDetailHistoryList(String oddId) {
		List<Map<String, Object>> list = workHistoryMapper.selectWorkDetailHistoryList(oddId);
		List<Map<String, Object>> teamList = workHistoryMapper.selectWorkDetailHistoryTeamList(oddId);
		// map에 두개 합치기
		Map<String, Object> map = new HashMap<>();
		map.put("list", list);
		map.put("teamList", teamList);
		return map;
	}

}
