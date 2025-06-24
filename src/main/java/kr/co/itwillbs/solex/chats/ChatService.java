package kr.co.itwillbs.solex.chats;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class ChatService {
	@Autowired
	ChatMapper mapper;
	
	// 사원 목록 조회
	public List<Map<String, Object>> getEmpList() {
		return mapper.getEmpList();
	}
}
