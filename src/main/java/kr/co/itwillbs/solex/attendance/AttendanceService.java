package kr.co.itwillbs.solex.attendance;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.annotation.PostConstruct;

@Service
public class AttendanceService {

	@Autowired
	private AttendanceMapper attendanceMapper;
	
	// 상태 코드를 캐싱할 Map (key: det_id, value: det_nm)
    private Map<String, String> attendanceStatusNames;


	// 통상 근무 시간 설정 (예: 9시 ~ 18시)
	private static final int STANDARD_START_HOUR = 9;
	private static final int STANDARD_START_MINUTE = 0;
	private static final int STANDARD_END_HOUR = 18;
	private static final int STANDARD_END_MINUTE = 0;
	private static final int STANDARD_WORK_HOURS = 8; // 8시간 근무 (점심시간 제외)
	private static final int STANDARD_WORK_MINUTES = STANDARD_WORK_HOURS * 60; // 8시간 = 480분
	
	// 업데이트 가능한 컬럼 이름 화이트리스트 (보안을 위해 매우 중요!)
    private static final Set<String> ALLOWED_UPDATE_COLUMNS = 
        Arrays.asList("att_in_time", "att_out_time") // 모든 업데이트 가능한 컬럼 추가
              .stream()
              .map(String::toLowerCase) // 모두 소문자로 변환
              .collect(Collectors.toSet());

	public AttendanceService(AttendanceMapper attendanceMapper) {
		this.attendanceMapper = attendanceMapper;
	}

	// 자신의 근태현황 조회
	public List<Map<String, Object>> getMyAttendanceByMonth(Map<String, Object> params) {
		return attendanceMapper.selectMyAttendenceByMonthList(params);
	}

	// 부하직원의 근태현황 조회
	public List<Map<String, Object>> getAttendanceByMonth(Map<String, Object> params) {
		return attendanceMapper.selectAttendenceByMonthList(params);
	}

	@Transactional
	public Map<String, Object> recordPunchIn(Long empId) {
		LocalDateTime today = LocalDateTime.now();
		LocalDateTime punchInTime = LocalDateTime.now();

		// 조회용 변수
		LocalDate todayDate = LocalDate.now();
		Optional<Map<String, Object>> existingRecord = attendanceMapper.findByEmpIdAndAttendanceDate(empId, todayDate);

		if (existingRecord.isPresent()) {
			throw new IllegalStateException("이미 출근 기록이 존재합니다.");
		}

		Map<String, Object> attendanceData = new HashMap<>();
		attendanceData.put("emp_id", empId);
		attendanceData.put("att_day", today);
		attendanceData.put("att_in_time", punchInTime);

		// 출근 상태 판단 로직
		int punchInHour = punchInTime.getHour();
		int punchInMinute = punchInTime.getMinute();
		String attSts;

		if (punchInHour < STANDARD_START_HOUR
				|| (punchInHour == STANDARD_START_HOUR && punchInMinute <= STANDARD_START_MINUTE)) {
			attSts = "att_sts_01"; // 출근 (9시 00분까지)
		} else if (punchInHour < 16) { // 오후 4시 이전까지는 지각으로 처리
			attSts = "att_sts_02"; // 지각 (9시 01분 ~ 오후 4시 00분까지)
		} else {
			// 오후 4시 이후 출근은 정책에 따라 '지각'으로 기록 후 별도 처리하거나 막을 수 있음
			attSts = "att_sts_02"; // 너무 늦은 지각
		}
		attendanceData.put("att_sts", attSts);

		attendanceMapper.insertPunchIn(attendanceData); // DB에 삽입
		
		// 출근기록 조회
		Map<String, Object> selectAttendanceData = attendanceMapper.findByEmpIdAndAttendanceDate(empId, todayDate)
				.orElseThrow(() -> new IllegalArgumentException("오늘 출근 기록이 없습니다."));
		
		String det_nm = (String) selectAttendanceData.get("DET_NM");
		
		Map<String, Object> result = new HashMap<>();

		// 클라이언트에 반환할 데이터는 필요에 따라 가공
		result.put("att_in_time", punchInTime.format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));
		result.put("att_sts", attSts);
		result.put("det_nm", det_nm);
		return result;
	}

	
	// 퇴근기록
	@Transactional
	public Map<String, Object> recordPunchOut(Long empId, Long attId) {
		LocalDateTime today = LocalDateTime.now();
		LocalDateTime punchOutTime = LocalDateTime.now();

		// 조회용 변수
		LocalDate todayDate = LocalDate.now();
		// 오늘 출근 기록 조회 (Map으로 반환됨)
		Map<String, Object> attendanceData = attendanceMapper.findByEmpIdAndAttendanceDate(empId, todayDate)
				.orElseThrow(() -> new IllegalArgumentException("오늘 출근 기록이 없습니다."));
		
		// Map에서 기존 출근 시간 가져오기
		LocalDateTime punchInTime = LocalDateTime.parse((String) attendanceData.get("ATT_IN_TIME"),
				DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));

		if (punchInTime == null) {
			throw new IllegalStateException("출근 기록이 유효하지 않습니다."); // 또는 오류 처리
		}
		if (attendanceData.get("ATT_OUT_TIME") != null) {
			throw new IllegalStateException("이미 퇴근 기록이 존재합니다.");
		}

		// Map에 퇴근 시간 및 근무 시간 업데이트
		attendanceData.put("punchOutTime", punchOutTime);

		// 총 근무 시간 계산
		Duration duration = Duration.between(punchInTime, punchOutTime);
		long totalMinutes = duration.toMinutes();
		

		// 점심 시간 등 비근무 시간 제외 로직 (예: 1시간 = 60분 제외)
		int breakTimeMinutes = 60;
		if (totalMinutes > (4 * 60)) { // 4시간 이상 근무 시
			totalMinutes -= breakTimeMinutes;
		}
		attendanceData.put("totalWorkMinutes", (int) totalMinutes);

		// 퇴근 상태 판단 로직
		String attSts;
		if (totalMinutes >= STANDARD_WORK_MINUTES) {
			attSts = "att_sts_03"; // 퇴근 (정상 근무 시간 충족)
		} else if (totalMinutes >= 4 * 60) { // 4시간 이상 근무 후 퇴근
			attSts = "att_sts_05"; // 조퇴
		} else if (totalMinutes < 2 * 60) { // 2시간 미만 근무
			attSts = "att_sts_06"; // 결근 (정시 출근했더라도 2시간 미만 근무는 결근으로 처리)
		} else {
			attSts = "att_sts_05"; // 2시간 이상 4시간 미만은 일단 조퇴로 분류
		}
		attendanceData.put("att_sts", attSts); // 최종 상태 업데이트

		// DB 업데이트를 위해 ID도 Map에 넣어줘야 함
		attendanceData.put("id", (Long) attendanceData.get("id"));
		attendanceData.put("att_id", attId);

		
		attendanceMapper.updatePunchOut(attendanceData); // DB 업데이트
		
		
		
		System.out.println("attendanceData???????? " + attendanceData);
		// 업데이트 후 상태를 바로 보여주기 위해서 가지고오는 데이터 
//		String det_nm = (String) attendanceData.get("DET_NM");
		String det_nm = attendanceMapper.selectDetNm(attSts); // att_sts를 넣어야 결과를 가지고 오도록 
//		selectAllCodeDetails
		System.out.println("퇵근 det_nm ??? " + det_nm);

		// 조회후 바로 화면단에 보여주기 위하
		Map<String, Object> result = new HashMap<>();
		result.put("att_out_time", punchOutTime.format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));
		result.put("totalWorkMinutes", (int) totalMinutes);
		result.put("att_sts", attSts);
		result.put("det_nm", det_nm);
		result.put("att_in_time", attendanceData.get("ATT_IN_TIME"));

		return result;
	}
	
	public Optional<Map<String, Object>> getTodayAttendanceStatus(long loginEmpId) {
		LocalDateTime today = LocalDateTime.now(); // 오늘 날짜를 가져옵니다.

		// 조회용 변수
		LocalDate todayDate = LocalDate.now();
		return attendanceMapper.findByEmpIdAndAttendanceDate(loginEmpId, todayDate);
	}

	public Map<String, Object> getEmployeeInfo(long loginEmpId) {
		return attendanceMapper.selectEmployeeInfo(loginEmpId);
	}
	
	
	
	
	
	// 부하직원의 출퇴근 현황 update
    @Transactional // 데이터 변경 작업은 트랜잭션으로 묶는 것이 일반적
    public void updateAttendanceCell(Map<String, Object> updateData) {
        Long attId;
        Object attIdObj = updateData.get("ATT_ID");
        if (attIdObj instanceof String) {
            attId = Long.parseLong((String) attIdObj);
        } else if (attIdObj instanceof Integer) {
            attId = ((Integer) attIdObj).longValue();
        } else if (attIdObj instanceof Long) {
            attId = (Long) attIdObj;
        } else {
            throw new IllegalArgumentException("ATT_ID 형식이 올바르지 않습니다.");
        }
    	System.out.println("서비스 updateData : " + updateData);
        String columnName = null;
        Object newValue = null;
        
        // ATT_ID를 제외한 첫 번째 변경된 컬럼을 찾음
        for (Map.Entry<String, Object> entry : updateData.entrySet()) {
            if (!"ATT_ID".equals(entry.getKey())) {
                columnName = entry.getKey();
                newValue = entry.getValue();
                break;
            }
        }

        if (columnName == null || newValue == null) {
            throw new IllegalArgumentException("업데이트할 컬럼 또는 새로운 값이 없습니다.");
        }

        // ====== 중요: 컬럼 이름 유효성 검증 ======
        String normalizedColumnName = columnName.toLowerCase(); // 소문자로 통일하여 비교
        if (!ALLOWED_UPDATE_COLUMNS.contains(normalizedColumnName)) {
            throw new IllegalArgumentException("허용되지 않는 컬럼 '" + columnName + "'에 대한 업데이트 요청입니다.");
        }

        Object valueToUpdate = newValue;

        // 데이터 타입 변환 (필요시)
        // 예: att_in_time은 String으로 넘어오지만, DB에 따라 LocalDateTime으로 변환 필요
        if ("att_out_time".equals(normalizedColumnName) && newValue instanceof String) {
             // Mybatis로 String을 직접 넘기는 경우, Mapper에서 DB 타입으로 변환하거나
             // 여기서 LocalDateTime.parse((String) newValue) 등으로 변환하여 넘길 수 있습니다.
             // 지금은 String 그대로 넘긴다고 가정 (Mybatis가 적절히 처리)
        	try {
                // String을 LocalDateTime으로 파싱
        		// 프론트엔드에서 넘어오는 날짜/시간 포맷에 따라 DateTimeFormatter를 정확히 지정해야 합니다.
//                valueToUpdate = LocalDateTime.parse((String) newValue, DateTimeFormatter.ofPattern("YYYY-MM-DD HH24:MI:SS"));
        		valueToUpdate = LocalDateTime.parse((String) newValue, DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm"));

            } catch (DateTimeParseException e) {
                throw new IllegalArgumentException("유효하지 않은 날짜/시간 형식입니다: " + newValue, e);
            }
        }
     // 다른 날짜/시간 컬럼이 있다면 여기에 추가 if-else if 블록으로 처리 가능

        // Mapper에 전달할 Map 생성 (Mapper는 파라미터를 하나만 받을 수 있으므로 Map 사용)
        Map<String, Object> params = new HashMap<>();
        params.put("att_id", attId); // Mapper XML의 #{attId}와 매핑
        params.put("columnName", columnName); // Mapper XML의 ${columnName}과 매핑 (안전하게!)
        params.put("newValue", valueToUpdate);     // Mapper XML의 #{newValue}와 매핑
        
//        System.out.println("service params : "  + params); // {newValue=asdfasdf, att_id=132, columnName=det_nm}

        attendanceMapper.updateAttendanceColumn(params); // 예시 메서드명
        // 또는 더 안전하게, 각 컬럼별 Mapper 메서드를 호출
        /*
        if ("det_nm".equals(normalizedColumnName)) {
            attendanceMapper.updateDetNm(attId, (String) newValue);
        } else if ("att_in_time".equals(normalizedColumnName)) {
            attendanceMapper.updateAttInTime(attId, (String) newValue);
        } else {
            // (이론적으로 여기까지 오면 안 되지만 방어적 코드)
            throw new IllegalStateException("알 수 없는 컬럼 이름입니다: " + columnName);
        }
        */
    }
	
}