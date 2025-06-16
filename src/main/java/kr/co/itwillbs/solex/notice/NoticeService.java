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

	//글 목록
	public List<Map<String, Object>> getNoticeList(Map<String, Object> params) {
		return noticeMapper.getNoticeList(params);
	}

	//글 상세 조회
	public Map<String, Object> getNoticeDetail(Long notId) {
		return noticeMapper.getNoticeDetail(notId);
	}

	public int getNoticeCount(Map<String, Object> params) {
		return noticeMapper.getNoticeCount(params);
	}

	//글 등록
	public int insertNotice(Map<String, Object> param) {

        return noticeMapper.insertNotice(param);
    }

	//글 변경
	public int updateNotice(Map<String, Object> param) {
		return noticeMapper.updateNotice(param);
	}

	//글 삭제
	public int deleteNotice(int notId) {
		return noticeMapper.deleteNotice(notId);
	}
	
	public Map<String, Object> getEmployeeInfo(Long empId) {
		return noticeMapper.getEmployeeInfo(empId);
	}
}
