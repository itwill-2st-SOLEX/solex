package kr.co.itwillbs.solex.dashboard;

import java.util.List;
import java.util.Map;

import org.apache.ibatis.annotations.Mapper;

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
	// 주문 요청현황
	List<Map<String, Object>> getOrderStatus();
	// 최근 생산 완료된 제품들
	List<Map<String, Object>> getPrdCompleted();
	
	

}
