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
	
	// 대화 목록 조회
	public List<Map<String, Object>> getChatList(String empNum) {
		return mapper.getChatList(empNum);
	}
	
	// 채팅방 메세지 불러오기
	public List<Map<String, Object>> getChatHistory(String empNum, String partnerId) {
		return mapper.getChatHistory(empNum, partnerId);
	}
	
	// ChatWebSocketController 디비에 메세지 저장
	public void saveMessage(Map<String, Object> message) {
		mapper.saveMessage(message);
	}
}
