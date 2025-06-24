package kr.co.itwillbs.solex.chats;

import java.util.List;
import java.util.Map;

import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface ChatMapper {
	// 사원 목록 조회
	public List<Map<String, Object>> getEmpList();
}
