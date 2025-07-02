package kr.co.itwillbs.solex.workHistory;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import ch.qos.logback.core.net.SyslogOutputStream;

@Service
public class WorkHistoryService {
	
	@Autowired
	private WorkHistoryMapper workHistoryMapper;

	public List<Map<String, Object>> getWorkHistoryList(int offset, int size) {
		return workHistoryMapper.selectWorkHistoryList(offset, size);
	}
	
}
