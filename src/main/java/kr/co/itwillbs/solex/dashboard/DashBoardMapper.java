package kr.co.itwillbs.solex.dashboard;

import java.util.List;
import java.util.Map;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface DashBoardMapper {
	// 전일 생산량
	Integer getYesterdayCnt();
	// 전일 생산율
	Integer getYesterdayRate();
	// 당월 누적 생산
	Integer getMonthCnt();
	// 당월 누적 생산율
	Integer getMonthRate();
	// 당월 불량율
	Integer getDefectCnt();
	// 생산량 추이 - 월간
	List<Map<String, Object>> selectMonthlyTrend(@Param("prdCode") String prdCode);
	// 생산량 추이 - 주간
	List<Map<String, Object>> selectWeeklyTrend(@Param("prdCode") String prdCode);
	// 주문 요청현황
	List<Map<String, Object>> getOrderStatus();
	// 최근 생산 완료된 제품들
	List<Map<String, Object>> getPrdCompleted();
	// 인기 품목 도넛 차트
	List<Map<String, Object>> getPopluarPrds(@Param("startDate") String startDate, @Param("endDate") String endDate);
	
	

}
