package kr.co.itwillbs.solex.attendance;

import java.time.LocalDateTime;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/attendance/api")
public class AttendanceRestController {
	
	@Autowired
	private AttendanceService attendanceService;
	
	long loginEmpId = 6L; // 임시 ID

	
	// 근태현황조회
	@GetMapping("/data")
	public Map<String, Object> getAttendanceDataByMonth( // 반환 타입을 DTO로 변경
	        @RequestParam("year") int year,
	        @RequestParam("month") int month,
	        @RequestParam(value = "resultType", required = false) String resultType,
			@RequestParam(name="keyword", required = false) String keyword,
			@RequestParam(name = "page", required = false) Integer page,
			@RequestParam(name = "size", required = false) Integer size
			) {

		
		// 로그인한 사용자의 직급등 사원정보 가져오기
		Map<String,Object> info = attendanceService.getEmployeeInfo(loginEmpId);
		
	    Map<String, Object> params = new HashMap<>();
	    params.put("offset", page * size);// 페이징 계산
	    params.put("year", year);
	    params.put("month", month);
	    params.put("keyword", keyword);
	    params.put("page", page);
	    params.put("size", size);
	    params.put("empId", loginEmpId);
	    
	    // 로그인한 사용자 정보 기반 필터 조건 추가
	    params.put("empCatCd", info.get("EMP_CAT_CD"));
	    params.put("empDepCd", info.get("EMP_DEP_CD"));
	    params.put("empTeamCd", info.get("EMP_TEAM_CD"));
	    params.put("empPosCd", info.get("EMP_POS_CD"));
	    
//	    System.out.println(params);
	    
	    Map<String, Object> combinedMap = new HashMap<>();
	    
	    if (resultType.equals("my")) { // 1. 내 근태 데이터 조회
	    	List<Map<String, Object>> myAttendance = attendanceService.getMyAttendanceByMonth(params); // 서비스 메서드 분리 또는 호출
	    	combinedMap.put("myAttendance", myAttendance);
		} else if (resultType.equals("team")) { // 2. 다른 사람/팀 근태 데이터 조회
			List<Map<String, Object>> teamAttendance = attendanceService.getAttendanceByMonth(params); // 다른 서비스 메서드 호출
			combinedMap.put("teamAttendance", teamAttendance);
		}	
        
        return combinedMap;
	}
	
	
	// 오늘 출퇴근 현황 조회 API
    @GetMapping("/today")
    public ResponseEntity<Map<String, Object>> getTodayAttendanceStatus() {
    	System.out.println("/api/today - get");

    	
        Optional<Map<String, Object>> attendanceRecord = attendanceService.getTodayAttendanceStatus(loginEmpId);
        System.out.println("today attendanceRecord : " + attendanceRecord);
        Map<String, Object> response = new HashMap<>();

        if (attendanceRecord.isPresent()) { // 조회 결과가 존재한다면 (Optional 안에 Map이 있다면)
            Map<String, Object> record = attendanceRecord.get(); 
            // null 체크
            response.put("att_in_time", record.get("ATT_IN_TIME") != null ? record.get("ATT_IN_TIME") : null);
            response.put("att_out_time", record.get("ATT_OUT_TIME") != null ? record.get("ATT_OUT_TIME") : null);
            response.put("att_sts", record.get("ATT_STS") != null ? record.get("ATT_STS") : null);
            response.put("det_nm", record.get("DET_NM") != null ? record.get("DET_NM") : null);
            
            System.out.println("today response : " + response);
        } else { // 조회 결과가 없다면 (Optional이 비어있다면)
            // 출근/퇴근 기록이 없음을 나타내기 위해 모든 값을 null로 설정
            response.put("att_in_time", null);
            response.put("att_out_time", null);
            response.put("att_sts", null); // 기록이 없으므로 상태도 없음
        }

        // HTTP 200 OK 상태 코드와 함께 Map 형태의 응답 데이터를 클라이언트에 전송
        return ResponseEntity.ok(response);
    }
	
	// 기록 초기화 API (선택 사항)
    @DeleteMapping("/today") // HTTP DELETE 요청이 /attendance/api/today 경로로 오면 이 메서드 실행
    public ResponseEntity<Map<String, Object>> resetTodayAttendance() {
    	System.out.println("/api/today - delete");
        // 1. 현재 로그인한 사용자 정보 가져오기
        // 2. DB에서 오늘 출퇴근 기록 삭제 (예: service.deleteTodayAttendance(userId))
        // 3. 성공 응답 반환
        Map<String, Object> response = new HashMap<>();
        response.put("status", "success");
        return ResponseEntity.ok(response);
    }
	
    // 출근 등록 API
    @PostMapping("/punch-in")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> punchIn() {

        try {
            Map<String, Object> result = attendanceService.recordPunchIn(loginEmpId);
            result.put("status", "success");
            return ResponseEntity.ok(result);
        } catch (IllegalStateException | IllegalArgumentException e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("status", "fail");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse); // 400 Bad Request
        }
    }
    
    // 퇴근 등록 API
    @PostMapping("/punch-out")
    public ResponseEntity<Map<String, Object>> punchOut() {

        try {
            Map<String, Object> result = attendanceService.recordPunchOut(loginEmpId);
            result.put("status", "success");
            return ResponseEntity.ok(result);
        } catch (IllegalStateException | IllegalArgumentException e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("status", "fail");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse); // 400 Bad Request
        }
    }
    
    
}