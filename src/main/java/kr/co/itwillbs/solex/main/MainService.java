package kr.co.itwillbs.solex.main;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class MainService {

	@Autowired
	private MainMapper mainMapper;
	
	public List<Map<String, Object>> mainNoticeList() {
		return mainMapper.mainNoticeList();
	}
	
	public List<Map<String, Object>> mainDocumentList(Long empId) {
		return mainMapper.mainDocumentList(empId);
	}

}
