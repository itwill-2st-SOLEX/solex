package kr.co.itwillbs.solex.notice;

import java.util.List;
import java.util.Map;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface NoticeMapper {
	//목록 조회
	List<Map<String, Object>> getNoticeList(Map<String, Object> params);

	//상세내용 조회
	Map<String, Object> getNoticeDetail(@Param("notId") Long notId);
	
	int getNoticeCount(Map<String, Object> params);

	//글 등록
	int insertNotice(Map<String, Object> param);

	//글 변경
	int updateNotice(Map<String, Object> param);

	//글 삭제
	int deleteNotice(int notId);
	
	Map<String, Object> getEmployeeInfo(Long empId);
}
