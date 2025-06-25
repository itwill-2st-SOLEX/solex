package kr.co.itwillbs.solex.chats;

import java.util.List;
import java.util.Map;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface ChatMapper {
	// 사원 목록 조회
	public List<Map<String, Object>> getEmpList();
	// 대화 목록 조회
	public List<Map<String, Object>> getChatList(String empNum);
	// 채팅방 메세지 불러오기
	public List<Map<String, Object>> getChatHistory(@Param("empNum") String empNum, @Param("partnerId") String partnerId);
	// 메세지 디비에 저장
	public void saveMessage(Map<String, Object> message);
}
