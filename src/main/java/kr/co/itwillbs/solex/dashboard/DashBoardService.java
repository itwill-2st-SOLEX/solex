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
	public Double getDefectCnt() {
		return mapper.getDefectCnt();
	}
	// 생산량 추이
	public List<Map<String, Object>> getProductionTrend(String type, String prdCode) {
		switch (type) {
			case "monthly":
				return mapper.selectMonthlyTrend(prdCode);
			case "weekly":
				return mapper.selectWeeklyTrend(prdCode);
			default:
				throw new IllegalArgumentException("지원하지 않는 type: " + type);
		}
	}
	// 주문 요청현황
	public List<Map<String, Object>> getOrderStatus() {
		return mapper.getOrderStatus();
	}
	
	// 최근 생산 완료된 제품들
	public List<Map<String, Object>> getPrdCompleted() {
		return mapper.getPrdCompleted();
	}
	// 인기 품목 도넛차트
	public List<Map<String, Object>> getPopluarPrds(String startDate, String endDate) {
		return mapper.getPopluarPrds(startDate, endDate);
	}
}
