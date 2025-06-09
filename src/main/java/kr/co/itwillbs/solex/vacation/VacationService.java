package kr.co.itwillbs.solex.vacation;

import java.time.LocalDate;
import java.time.ZoneId;
import java.time.temporal.ChronoUnit;
import java.util.Date;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class VacationService {
	
	@Autowired
	public VacationMapper vacationMapper;
	
	//개인별 휴가 개수 확인
	public Map<String, Object> getVacationSummary(int empId) {
		
		//sql 조회
		Map<String, Object> summary = vacationMapper.getVacationSummary(empId);
		
        if (summary == null) return null;

        // 1. 입사일(LocalDate)로 변환
        // 오라클 DATE는 시간까지 저장하므로, JDBC는 기본적으로 Timestamp로 내려줌
        // 휴가 소멸일 계산을 위해 날짜를 변환 후 계산함
        Object hireDateObj = summary.get("EMP_HIRE");
        if (hireDateObj == null) return summary;

        LocalDate hireDate = ((java.sql.Timestamp) summary.get("EMP_HIRE"))
				                .toLocalDateTime()
				                .toLocalDate();

        LocalDate today = LocalDate.now();

        // 2. 가장 최근의 연차 시작일 계산
        long years = ChronoUnit.YEARS.between(hireDate, today);
        LocalDate periodStart = hireDate.plusYears(years);
        if (periodStart.isAfter(today)) {
            periodStart = periodStart.minusYears(1);
        }
        LocalDate periodEnd = periodStart.plusYears(1).minusDays(1);

        // 3. 소멸까지 남은 일수
        long daysLeft = ChronoUnit.DAYS.between(today, periodEnd);

        // 4. 추가 계산 정보 결과에 넣기
        summary.put("periodStart", periodStart);
        summary.put("periodEnd", periodEnd);
        summary.put("daysLeft", daysLeft);

        return summary;
	}

}
