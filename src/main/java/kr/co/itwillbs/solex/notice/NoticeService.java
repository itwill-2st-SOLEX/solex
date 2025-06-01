package kr.co.itwillbs.solex.notice;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class NoticeService {
	
	@Autowired
	private NoticeMapper noticeMapper;
	
	public NoticeService(NoticeMapper noticeMapper) {
        this.noticeMapper = noticeMapper;
    }
	

	public List<Map<String, Object>> getNoticeList(int offset, int size) {
		return noticeMapper.getNoticeList(offset, size);
	}
	
}
