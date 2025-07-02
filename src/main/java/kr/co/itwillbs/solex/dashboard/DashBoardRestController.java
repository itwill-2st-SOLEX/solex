package kr.co.itwillbs.solex.dashboard;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.servlet.http.HttpSession;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;

@RestController
@RequestMapping("/dashboard")
public class DashBoardRestController {
	@Autowired
	DashBoardService service;
	
	// 3개 요약카드
	@GetMapping("/summary")
	public Map<String, Object> getSummary() {
		Map<String, Object> summary = new HashMap<>();
		// 전일 생산량
		summary.put("yesterCnt", service.getYesterdayCnt());
		summary.put("yesterRate", service.getYesterdayRate());
		// 당월 누적 생산
		summary.put("monthCnt", service.getMonthCnt());
		summary.put("monthRate", service.getMonthRate());
		//당뤌 불량율
		summary.put("defectCnt", service.getDefectCnt());
		return summary; 
	}
	
	// 상품별 3개 요약 카드
	@GetMapping("/summary/{prdCode}")
	public Map<String, Object> getUpdateSummary(@PathVariable("prdCode") String prdCode) {
		System.out.println("prdCode: " + prdCode);
		Map<String, Object> updateSummary = new HashMap<>();
		// 상품 전일 생산량 
		updateSummary.put("yesterCnt", service.getUpdateYesterdayCnt(prdCode));
		updateSummary.put("yesterRate", service.getUpdateYesterdayRate(prdCode));
		// 당월 누적 생산
		updateSummary.put("monthCnt", service.getUpdateMonthCnt(prdCode));
		updateSummary.put("monthRate", service.getUpdateMonthRate(prdCode));
		// 상품별 불량율
		updateSummary.put("defectCnt", service.getUpdateDefectCnt(prdCode));
		
		System.out.println("updateSummary" + updateSummary);
		return updateSummary;
	}
	
	// 생산량 추이
	@GetMapping("/productions/trend")
	public List<Map<String, Object>> getProductionTrend(@RequestParam("type") String type,
														@RequestParam(value = "prdCode", required = false) String prdCode) {
		return service.getProductionTrend(type, prdCode);
	}
	
	// 주문 요청현황
	@GetMapping("/orders")
	public List<Map<String, Object>> getOrderStatus() {
		return service.getOrderStatus();
	}
	
	// 최근 생산 완료된 제품들
	@GetMapping("/completed")
	public List<Map<String, Object>> getPrdCompleted() {
		return service.getPrdCompleted();
	}
	
	// 인기 품목 도넛차트
	@GetMapping("/popular")
	public List<Map<String, Object>> getPopluarPrds(@RequestParam("startDate") String startDate,
													@RequestParam("endDate") String endDate) {
		return service.getPopluarPrds(startDate, endDate);
	}
}
