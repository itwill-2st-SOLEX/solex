package kr.co.itwillbs.solex.operator;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class WorkerService {
	
	@Autowired
	WorkerMapper workerMapper;
	
	public Map<String, Object> getWorkerSummary(Long empId) {
		return workerMapper.getWorkerSummary(empId);
	}
	
}




