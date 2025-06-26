package kr.co.itwillbs.solex.chats;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ChatService {
	@Autowired
	ChatMapper mapper;

	// 사원 목록 조회
	public List<Map<String, Object>> getEmpList(String empNum) {
		return mapper.getEmpList(empNum);
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

	// 채팅방 읽음 
	public void chatRead(Map<String, Object> readInfo) {
		mapper.chatRead(readInfo);
	}
	// 채팅방 나가기
	@Transactional
	public void leaveChatRoom(String roomId, Map<String, Object> chatInfo) {
		String empId = (String)chatInfo.get("empId");
		String partnerId = (String)chatInfo.get("partnerId");
		System.out.println("QWEQWEWQ" + roomId);
		String room_id1 = "room_" +  roomId;
		String room_id2 = "room_" +  empId;
		System.out.println("!@!WEQWEWQ" + room_id1);
		System.out.println("QWE!@#@!#QWEWQ" + room_id2);
		
		// 현재 상태 조회
		int currentStatus = mapper.getChatRoomStatus(room_id1, room_id2);
		System.out.println("currentStatus" + currentStatus);
		if (currentStatus == 0) {
			// 1명 현재 유저 나감 처리
			mapper.updateChatRoomStatus(1, empId, partnerId);
		} else if (currentStatus == 1) {
			mapper.updateChatRoomStatus(2, empId, partnerId);
			
	        mapper.deleteChatRoom(room_id1, room_id2);
		} 
	}
	
}
