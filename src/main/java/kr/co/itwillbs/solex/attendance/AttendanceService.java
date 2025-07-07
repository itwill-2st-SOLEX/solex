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
	public Map<String, Object> recordPunchIn(String loginEmpId) {
		LocalDateTime today = LocalDateTime.now();
		LocalDateTime punchInTime = LocalDateTime.now();

		// 조회용 변수
		LocalDate todayDate = LocalDate.now();
		Optional<Map<String, Object>> existingRecord = attendanceMapper.findByEmpIdAndAttendanceDate(loginEmpId, todayDate);

		if (existingRecord.isPresent()) {
			throw new IllegalStateException("이미 출근 기록이 존재합니다.");
		}

		Map<String, Object> attendanceData = new HashMap<>();
		attendanceData.put("emp_id", loginEmpId);
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
		Map<String, Object> selectAttendanceData = attendanceMapper.findByEmpIdAndAttendanceDate(loginEmpId, todayDate)
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
	public Map<String, Object> recordPunchOut(String loginEmpId, Long attId) {
		LocalDateTime today = LocalDateTime.now();
		LocalDateTime punchOutTime = LocalDateTime.now();

		// 조회용 변수
		LocalDate todayDate = LocalDate.now();
		// 오늘 출근 기록 조회 (Map으로 반환됨)
		Map<String, Object> attendanceData = attendanceMapper.findByEmpIdAndAttendanceDate(loginEmpId, todayDate)
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
	
	public Optional<Map<String, Object>> getTodayAttendanceStatus(String loginEmpId) {
		LocalDateTime today = LocalDateTime.now(); // 오늘 날짜를 가져옵니다.

		// 조회용 변수
		LocalDate todayDate = LocalDate.now();
		return attendanceMapper.findByEmpIdAndAttendanceDate(loginEmpId, todayDate);
	}

	public Map<String, Object> getEmployeeInfo(String loginEmpId) {
		return attendanceMapper.selectEmployeeInfo(loginEmpId);
	}
	
    @Transactional // 데이터 변경 작업은 트랜잭션으로 묶는 것이 일반적
    public void updateAttendanceCell(Map<String, Object> updateData) {
        // 1. ATT_ID 파싱 및 유효성 검증
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
    	System.out.println("서비스 updateData (초기): " + updateData);

        String columnName = null;
        Object newValue = null;
        
        // 2. 변경된 컬럼 이름과 새 값 추출
        // ATT_ID를 제외한 첫 번째 변경된 컬럼을 찾음 (TUI Grid의 한 셀 업데이트 시 보통 하나의 컬럼만 있음)
        for (Map.Entry<String, Object> entry : updateData.entrySet()) {
            if (!"ATT_ID".equalsIgnoreCase(entry.getKey())) { // 대소문자 무시하고 ATT_ID 비교
                columnName = entry.getKey();
                newValue = entry.getValue();
                break;
            }
        }

        if (columnName == null || newValue == null) {
            throw new IllegalArgumentException("업데이트할 컬럼 또는 새로운 값이 없습니다.");
        }

        // 3. 컬럼 이름 유효성 검증
        String normalizedColumnName = columnName.toLowerCase(); // 소문자로 통일하여 비교
        if (!ALLOWED_UPDATE_COLUMNS.contains(normalizedColumnName)) {
            throw new IllegalArgumentException("허용되지 않는 컬럼 '" + columnName + "'에 대한 업데이트 요청입니다.");
        }

        // 4. DB에서 해당 ATT_ID의 최신 출결 정보 조회
        // 이 맵에는 DB의 ATT_IN_TIME, ATT_OUT_TIME 등이 포함됩니다.
        Map<String, Object> existingAttendanceData = attendanceMapper.getAttendanceById(attId);
        if (existingAttendanceData == null) {
            throw new IllegalArgumentException("해당 ATT_ID (" + attId + ")의 출결 정보를 찾을 수 없습니다.");
        }
        
        // 기존 출근 시간 (DB에서 조회된 값)
        // DB에서 LocalDateTime 타입으로 조회될 수도 있고, String으로 조회될 수도 있으므로 유연하게 처리
        LocalDateTime currentAttInTime = parseDbTime(existingAttendanceData.get("ATT_IN_TIME"));
        // 기존 퇴근 시간 (DB에서 조회된 값)
        LocalDateTime currentAttOutTime = parseDbTime(existingAttendanceData.get("ATT_OUT_TIME"));

        // 날짜/시간 파싱을 위한 공통 포맷터
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

        LocalDateTime parsedNewValue = null; // 새로 파싱된 값 (LocalDateTime 타입)
        String attSts = "att_sts_01"; // 기본 상태값 (예: '미정', '정상' 등 비워두면 안 됨)

        // 5. 컬럼별 업데이트 로직 처리
        if ("att_out_time".equals(normalizedColumnName) && newValue instanceof String) {
            String newAttOutTimeString = (String) newValue;
            System.out.println("Service: 받은 새로운 att_out_time 문자열 = " + newAttOutTimeString);
            
            try {
                parsedNewValue = LocalDateTime.parse(newAttOutTimeString, formatter);
                System.out.println("Service: 파싱된 새로운 att_out_time LocalDateTime = " + parsedNewValue);
            } catch (DateTimeParseException e) {
                System.err.println("Service: 새 퇴근 시간 LocalDateTime 파싱 실패: " + e.getMessage());
                throw new IllegalArgumentException("새 퇴근 시간 형식 오류입니다: " + newAttOutTimeString, e);
            }

            // 근무 시간 계산 및 상태 업데이트 로직 (출근 시간이 있어야 계산 가능)
            if (currentAttInTime != null) {
                Duration duration = Duration.between(currentAttInTime, parsedNewValue);
                long totalMinutes = duration.toMinutes();
                System.out.println("Service: 총 근무 시간 (Duration) = " + duration);
                
                int breakTimeMinutes = 60; // 1시간 휴게
                if (totalMinutes > (4 * 60)) { // 4시간 이상 근무 시 휴게 시간 적용
                    totalMinutes -= breakTimeMinutes;
                }
                updateData.put("totalWorkMinutes", (int) totalMinutes); // 맵에 총 근무시간 추가

                // 퇴근 상태 판단
                if (totalMinutes >= STANDARD_WORK_MINUTES) {
                    attSts = "att_sts_03"; // 퇴근 (정상 근무 시간 충족)
                } else if (totalMinutes >= 4 * 60) {
                    attSts = "att_sts_05"; // 조퇴 (4시간 이상 근무 후 퇴근)
                } else if (totalMinutes < 2 * 60) {
                    attSts = "att_sts_06"; // 결근 (정시 출근했더라도 2시간 미만 근무는 결근으로 처리)
                } else {
                    attSts = "att_sts_05"; // 조퇴 (2시간 이상 4시간 미만)
                }
            } else {
                attSts = "att_sts_01"; // 출근 시간 정보가 없어 계산 불가
                System.err.println("Service: 기존 출근 시간이 없어 att_out_time 수정 시 att_sts 계산 불가.");
            }

        } else if ("att_in_time".equals(normalizedColumnName) && newValue instanceof String) {
            String newAttInTimeString = (String) newValue;
            System.out.println("Service: 받은 새로운 att_in_time 문자열 = " + newAttInTimeString);

            try {
                parsedNewValue = LocalDateTime.parse(newAttInTimeString, formatter);
                System.out.println("Service: 파싱된 새로운 att_in_time LocalDateTime = " + parsedNewValue);
            } catch (DateTimeParseException e) {
                System.err.println("Service: 새 출근 시간 LocalDateTime 파싱 실패: " + e.getMessage());
                throw new IllegalArgumentException("새 출근 시간 형식 오류입니다: " + newAttInTimeString, e);
            }

            // 출근 시간만 수정된 경우의 att_sts 및 근무 시간 재계산
            if (currentAttOutTime != null) { // 퇴근 시간이 이미 있는 경우에만 재계산
                Duration duration = Duration.between(parsedNewValue, currentAttOutTime); // 새 출근 시간과 기존 퇴근 시간
                long totalMinutes = duration.toMinutes();
                
                int breakTimeMinutes = 60;
                if (totalMinutes > (4 * 60)) {
                    totalMinutes -= breakTimeMinutes;
                }
                updateData.put("totalWorkMinutes", (int) totalMinutes);

                // 재계산된 근무 시간에 따른 상태 업데이트
                if (totalMinutes >= STANDARD_WORK_MINUTES) {
                    attSts = "att_sts_03"; // 퇴근 (정상)
                } else if (totalMinutes >= 4 * 60) {
                    attSts = "att_sts_05"; // 조퇴
                } else if (totalMinutes < 2 * 60) {
                    attSts = "att_sts_06"; // 결근
                } else {
                    attSts = "att_sts_05"; // 조퇴
                }
            } else {
                // 퇴근 시간이 아직 없는 경우 (출근만 찍은 상태)
                attSts = "att_sts_02"; // 출근 (기본 상태)
                // TODO: 지각 여부 판단 로직 추가 가능
            }
        } else if ("det_nm".equals(normalizedColumnName)) {
            // det_nm 컬럼이 수정된 경우 (상태값 자체를 변경하는 경우)
            // newValue는 이미 String일 것이므로 그대로 사용
            attSts = (String) newValue; // 직접 attSts에 할당 (det_nm이 att_sts 값을 나타낸다고 가정)
            parsedNewValue = null; // 날짜/시간 컬럼이 아니므로 parsedNewValue는 null로 유지하거나 처리하지 않음
        }
        // 다른 컬럼이 있다면 여기에 else if로 추가 로직 구현

        System.out.println("Service: 최종 바뀐 상태값 (attSts) = " + attSts);
        System.out.println("Service: 최종 파싱된 값 (parsedNewValue) = " + parsedNewValue);

        // 6. Mapper에 전달할 최종 Map 준비 및 호출
        Map<String, Object> params = new HashMap<>();
        params.put("att_id", attId); // 필수
        params.put("att_sts", attSts); // 필수 (계산되거나 초기화된 값)

        // 실제로 변경된 컬럼과 그 값을 Map에 추가 (이것이 Mapper에서 ${columnName}과 #{newValue}로 매핑될 것임)
        params.put("columnName", columnName); // ${columnName}으로 SQL에 컬럼 이름 동적 삽입
        
        // newValue는 String 또는 LocalDateTime 등이 될 수 있으므로, 
        // Mapper에서 해당 컬럼에 맞는 JDBC Type이 자동으로 매핑되도록 합니다.
        params.put("newValue", parsedNewValue != null ? parsedNewValue : newValue); 
        // 날짜/시간 컬럼이면 parsedNewValue (LocalDateTime) 사용, 아니면 원래 newValue 사용.
        // 예를 들어 det_nm은 String이므로 newValue를 사용.

        // TUI Grid의 updateData에서 바로 Map을 넘겨준 경우, 추가적인 put을 해줍니다.
        // 예를 들어 att_out_time을 변경했을 때, parsedNewValue는 LocalDateTime이 되고,
        // 이 값을 att_out_time 컬럼에 업데이트할 예정.
        // att_in_time이 변경되었을 때도 마찬가지.

        // Mapper는 보통 하나의 update 메서드를 통해 동적으로 컬럼을 업데이트합니다.
        // Mapper XML의 updateAttendanceColumn(params) 또는 updateAttendance(params) 메서드가
        // ${columnName}과 #{newValue}를 사용하여 업데이트 쿼리를 구성해야 합니다.
        // 예: UPDATE ATTENDANCE SET ${columnName} = #{newValue} WHERE ATT_ID = #{att_id}

        attendanceMapper.updateAttendanceColumn(params); // 예시 메서드명
    }   
    // DB에서 조회된 시간 값을 LocalDateTime으로 파싱
    private LocalDateTime parseDbTime(Object dbTimeObj) {
        if (dbTimeObj == null) {
            return null;
        }
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
        if (dbTimeObj instanceof LocalDateTime) {
            return (LocalDateTime) dbTimeObj;
        } else if (dbTimeObj instanceof java.sql.Timestamp) {
            return ((java.sql.Timestamp) dbTimeObj).toLocalDateTime();
        } else if (dbTimeObj instanceof String) {
            try {
                // DB에서 넘어오는 String 형식도 'YYYY-MM-DD HH:MI:SS' 또는 'YYYY-MM-DD HH24:MI:SS.S' 등 다양할 수 있음
                // 필요한 경우 더 유연한 포맷터를 사용하거나 여러 포맷을 시도할 수 있습니다.
                // Oracle DATE 컬럼은 초까지 저장하므로, 'YYYY-MM-DD HH:mm:ss' 포맷이 일반적입니다.
                // 만약 DB에서 초 단위가 잘려서 오거나 다른 형식이면 여기서 ParseException 발생 가능
                if (((String) dbTimeObj).contains(".")) { // 밀리초가 포함된 경우
                    return LocalDateTime.parse((String) dbTimeObj, DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss.S"));
                }
                return LocalDateTime.parse((String) dbTimeObj, formatter);
            } catch (DateTimeParseException e) {
                System.err.println("DB 조회 시간 문자열 파싱 오류: " + dbTimeObj + " - " + e.getMessage());
                return null;
            }
        }
        // 다른 날짜/시간 타입 (java.util.Date 등)이 있을 경우 추가 처리
        return null;
    }
	
}