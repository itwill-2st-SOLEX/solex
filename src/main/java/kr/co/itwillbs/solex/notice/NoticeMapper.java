package kr.co.itwillbs.solex.notice;

import java.util.List;
import java.util.Map;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface NoticeMapper {
	//noticeList();
	List<Map<String, Object>> getNoticeList(@Param("offset") int offset, @Param("size") int size);


}
