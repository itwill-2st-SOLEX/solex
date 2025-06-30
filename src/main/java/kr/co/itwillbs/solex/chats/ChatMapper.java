package kr.co.itwillbs.solex.chats;

import java.util.List;
import java.util.Map;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface ChatMapper {
	// 사원 목록 조회
	public List<Map<String, Object>> getEmpList(String empNum);
	// 대화 목록 조회
	public List<Map<String, Object>> getChatList(String empNum);
	// 채팅방 메세지 불러오기
	public List<Map<String, Object>> getChatHistory(@Param("empNum") String empNum, @Param("partnerId") String partnerId);
	// 메세지 디비에 저장
	public void saveMessage(Map<String, Object> message);
	// 채팅방 읽음 표시
	public void chatRead(Map<String, Object> readInfo);
	// 채팅방 나가기
	// 1. 현재 상테 초회
	public int getChatRoomStatus(@Param("room_id1") String room_id1, @Param("room_id2") String room_id2);
	// 2.채팅방 상태 업데이트
	public void updateChatRoomStatus(@Param("status") int status, @Param("empId") String empId,  @Param("partnerId") String partnerId);
	// 3. 채팅방 삭제
	public void deleteChatRoom(@Param("room_id1") String room_id1, @Param("room_id2") String room_id2);
	// 안읽은 메세지 갯수
	public int getUnreadMessageCnt(String empId);
	public List<String> getMyChatRooms(String empNum);
}
