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

	public Map<String, Object> getVacationSummary(Long empId) {
		return vacationMapper.getVacationSummary(empId);
	}
	
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
		return vacationMapper.getVacationList(params);
	}
	
	//관리자 페이지에서 전체 개수
	public int getVacationAllCount(Map params) {
		return vacationMapper.getVacationAllCount(params);
	}
	
	public Map<String, Object> getEmployeeInfo(Long empId) {
		return vacationMapper.getEmployeeInfo(empId);
	}
}
