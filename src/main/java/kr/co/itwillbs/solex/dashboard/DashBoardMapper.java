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
	Double getYesterdayRate();
	// 당월 누적 생산
	Integer getMonthCnt();
	// 당월 누적 생산율
	Double getMonthRate();
	// 당월 불량율
	Double getDefectCnt();
	// 상품별 전일 생산량
	Integer getUpdateYesterdayCnt(String prdCode);
	// 상품별 전일 생산율
	Double getUpdateYesterdayRate(String prdCode);
	// 상품 당월 누적 생산
	Integer getUpdateMonthCnt(String prdCode);
	// 상품 당월 누적 생산율
	Double getUpdateMonthRate(String prdCode);
	// 상품 불량율
	Double getUpdateDefectCnt(String prdCode);
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
