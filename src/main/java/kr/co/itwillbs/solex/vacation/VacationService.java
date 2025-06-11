package kr.co.itwillbs.solex.vacation;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class VacationService {
	
	@Autowired
	public VacationMapper vacationMapper;
	
	// /////////////////////////////////////////////////////////////////
	//내 남은 휴가 개수 확인
//	public Map<String, Object> getVacationSummary(Long empId) {
//		
//		//sql 조회
//		Map<String, Object> summary = vacationMapper.getVacationSummary(empId);
//		
//        if (summary == null) return null;
//
//        // 1. 입사일(LocalDate)로 변환
//        // 오라클 DATE는 시간까지 저장하므로, JDBC는 기본적으로 Timestamp로 내려줌
//        // 휴가 소멸일 계산을 위해 날짜를 변환 후 계산함
//        Object hireDateObj = summary.get("EMP_HIRE");
//        if (hireDateObj == null) return summary;
//
//        LocalDate hireDate = ((java.sql.Timestamp) summary.get("EMP_HIRE"))
//				                .toLocalDateTime()
//				                .toLocalDate();
//
//        LocalDate today = LocalDate.now();
//
//        // 2. 가장 최근의 연차 시작일 계산
//        long years = ChronoUnit.YEARS.between(hireDate, today);
//        LocalDate periodStart = hireDate.plusYears(years);
//        if (periodStart.isAfter(today)) {
//            periodStart = periodStart.minusYears(1);
//        }
//        LocalDate periodEnd = periodStart.plusYears(1).minusDays(1);
//
//        // 3. 소멸까지 남은 일수
//        long daysLeft = ChronoUnit.DAYS.between(today, periodEnd);
//
//        // 4. 추가 계산 정보 결과에 넣기
//        summary.put("periodStart", periodStart);
//        summary.put("periodEnd", periodEnd);
//        summary.put("daysLeft", daysLeft);
//
//        return summary;
//	}
	public Map<String, Object> getVacationSummary(Long empId) {
		return vacationMapper.getVacationSummary(empId);
	}
	// ///////////////////////////////////////////////////////////////////////
	
	
	
	//총 휴가 사용 개수
	public int getVacationCount(Long empId) {
		return vacationMapper.getVacationCount(empId);
	}

	
	
	//내가 사용한 휴가 내역 확인
	public List<Map<String, Object>> getVacationDetail(Map params) {
		
		return vacationMapper.getVacationDetail(params);
	}

	//관리자-휴가 내역 조회
	public List<Map<String, Object>> getVacationList(Map params) {
		List<Map<String, Object>> list =  vacationMapper.getVacationList(params);
// ///////////////////////////////////////////////////////////////////////
	
//		for (Map<String, Object> day : list ) {
//			Long empId = null;
//	        Object empIdObj = day.get("EMP_ID"); // DB 컬럼명에 맞춰서
//	        
//	        if (empIdObj instanceof Number) {
//	            empId = ((Number) empIdObj).longValue();
//	        } else if (empIdObj instanceof String) {
//	            empId = Long.parseLong((String) empIdObj);
//	        }
//			 Map<String, Object> summary = getVacationSummary(empId);
//			 day.put("periodEnd", summary.get("periodEnd"));
//		}
// ///////////////////////////////////////////////////////////////////////
	
		 return list;
	}
	
	//관리자 페이지에서 전체 개수
	public int getVacationAllCount(Map params) {
		return vacationMapper.getVacationAllCount(params);
	}
	
	public Map<String, Object> getEmployeeInfo(Long empId) {
		return vacationMapper.getEmployeeInfo(empId);
	}
}
