package kr.co.itwillbs.solex.dashboard;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class DashBoardService {
	@Autowired
	DashBoardMapper mapper;
	
	// 전일 생산량
	public Integer getYesterdayCnt() {
		return mapper.getYesterdayCnt();
	}
	// 전일 생산율
	public Integer getYesterdayRate() {
		return mapper.getYesterdayRate();
	}
	// 당월 누적 생산
	public Integer getMonthCnt() {
		return mapper.getMonthCnt();
	}
	// 당월 누적 생산율
	public Integer getMonthRate() {
		return mapper.getMonthRate();
	}
	// 당월 불량율
	public Integer getDefectCnt() {
		return mapper.getDefectCnt();
	}
	// 주문 요청현황
	public List<Map<String, Object>> getOrderStatus() {
		return mapper.getOrderStatus();
	}
	
	// 최근 생산 완료된 제품들
	public List<Map<String, Object>> getPrdCompleted() {
		return mapper.getPrdCompleted();
	}
	
	
	

}
