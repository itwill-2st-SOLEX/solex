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
	public List<Map<String, Object>> getEmpList(String empId) {
		return mapper.getEmpList(empId);
	}

	// 대화 목록 조회
	public List<Map<String, Object>> getChatList(String empId) {
		return mapper.getChatList(empId);
	}

	// 채팅방 메세지 불러오기
	public List<Map<String, Object>> getChatHistory(String empId, String partnerId) {
		return mapper.getChatHistory(empId, partnerId);
	}

	// ChatWebSocketController 디비에 메세지 저장
	public void saveMessage(Map<String, Object> message) {
		mapper.saveMessage(message);
	}

	// 채팅방 읽음
	public void chatRead(Map<String, Object> readInfo) {
		String roomId = (String) readInfo.get("roomId");

		String[] parts = roomId.split("_");
		String id1 = parts[1];
		String id2 = parts[2];
		String roomId1 = "room_" + id1 + "_" + id2;
		String roomId2 = "room_" + id2 + "_" + id1;

		readInfo.put("roomId1", roomId1);
		readInfo.put("roomId2", roomId2);

		mapper.chatRead(readInfo);
	}

	// 채팅방 나가기
	@Transactional
	public void leaveChatRoom(String roomId, Map<String, Object> chatInfo) {
		String empId = (String) chatInfo.get("empId");
		String partnerId = (String) chatInfo.get("partnerId");

		String room_id1 = "room_" + empId + "_" + partnerId;
		String room_id2 = "room_" + partnerId + "_" + empId;
		// 현재 상태 조회
		int currentStatus = mapper.getChatRoomStatus(room_id1, room_id2);

		if (currentStatus == 0) {
			// 한 명 나감 처리
			mapper.updateChatRoomStatus(1, empId, partnerId);
		} else if (currentStatus == 1) {
			// 두 명 모두 나간 경우 → 삭제
			mapper.updateChatRoomStatus(2, empId, partnerId);
			mapper.deleteChatRoom(room_id1, room_id2);
		}
	}
	
	// 안읽은 메세지 갯수
	public int getUnreadMessageCnt(String empId) {
		return mapper.getUnreadMessageCnt(empId);
	}

	public List<String> getMyChatRooms(String empNum) {
		return mapper.getMyChatRooms(empNum);
	}

}
