document.addEventListener('DOMContentLoaded', () => {
    // DOM 요소들을 변수에 할당
    const punchInButton = document.querySelector('.punch-in');
    const punchOutButton = document.querySelector('.punch-out');
    const punchInTimeSpan = document.getElementById('punch-in-time');
    const punchOutTimeSpan = document.getElementById('punch-out-time');
    const totalWorkTimeSpan = document.getElementById('total-work-time');
    const punchStatusSpan = document.getElementById('punch-sts'); // 오타 수정: pubchStatusSpan -> punchStatusSpan
    const resetButton = document.getElementById('reset-attendance-button');
    const currentAttIdInput = document.getElementById('current-att-id'); // 숨겨진 필드

    // 서버 API 엔드포인트 정의
    const API_BASE_URL = '/SOLEX/attendance/api';
    const PUNCH_IN_URL = `${API_BASE_URL}/punch-in`;
    const PUNCH_OUT_URL = `${API_BASE_URL}/punch-out`;
    const TODAY_STATUS_URL = `${API_BASE_URL}/today`;

	
	/**
     * 출퇴근 시간을 기반으로 총 근무 시간을 계산하여 포맷된 문자열로 반환합니다.
     * 이 함수는 다른 JS 파일에서도 재사용될 수 있도록 전역으로 노출됩니다.
     * @param {string} attInTimeStr - 출근 시간 (ISO 8601 문자열).
     * @param {string} attOutTimeStr - 퇴근 시간 (ISO 8601 문자열).
     * @returns {string} - "X시간 Y분" 형식의 근무 시간 문자열 또는 "--시간 --분".
     */
    function calculateFormattedWorkTime(attInTimeStr, attOutTimeStr) {
        if (attInTimeStr && attOutTimeStr) {
            const punchInDate = new Date(attInTimeStr);
            const punchOutDate = new Date(attOutTimeStr);

            if (isNaN(punchInDate.getTime()) || isNaN(punchOutDate.getTime())) {
                console.error("calculateFormattedWorkTime: 유효하지 않은 날짜/시간 형식이 입력되었습니다.");
                return '--시간 --분';
            } else {
                const totalMilliseconds = punchOutDate.getTime() - punchInDate.getTime();
                const totalWorkMinutes = Math.floor(totalMilliseconds / (1000 * 60));

                const hours = Math.floor(totalWorkMinutes / 60);
                const minutes = totalWorkMinutes % 60;

                return `${hours}시간 ${minutes}분`;
            }
        } else {
            return '--시간 --분';
        }
    }
	
	// 전역 스코프에 함수 노출 (다른 파일에서 접근 가능하도록)
    window.calculateFormattedWorkTime = calculateFormattedWorkTime;

	
    /**
     * 서버에서 받은 출퇴근 데이터를 기반으로 UI를 업데이트하는 함수.
     * @param {object} attendanceData - 출퇴근 상세 정보가 담긴 객체.
     * @param {string} attendanceData.att_in_time - DB에서 온 출근 시간 (ISO 8601 문자열).
     * @param {string} attendanceData.att_out_time - DB에서 온 퇴근 시간 (ISO 8601 문자열, null일 수 있음).
     * @param {string} attendanceData.det_nm - 출퇴근 상태 표시 이름.
     * @param {number} attendanceData.att_id - 출퇴근 ID.
     */
    function updateAttendanceUI(attendanceData) {
        const { att_in_time, att_out_time, det_nm, att_id } = attendanceData;


        // 숨겨진 att_id 필드 설정
        if (att_id) {
            currentAttIdInput.value = att_id;
            console.log('숨겨진 필드 ATT_ID 설정됨:', currentAttIdInput.value);
        } else {
            currentAttIdInput.value = '';
            console.log('ATT_ID가 없어 숨겨진 필드가 비어있음.');
        }

        // 출근 시간 표시 및 버튼 상태 업데이트
        if (att_in_time) {
            const date = new Date(att_in_time);
            punchInTimeSpan.textContent = date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
            punchInButton.disabled = true;
            punchInButton.style.opacity = '0.6';

            if (!att_out_time) { // 출근은 했지만 아직 퇴근을 안 했을 경우
                punchOutButton.disabled = false;
                punchOutButton.style.opacity = '1';
            } else { // 출근과 퇴근 모두 완료했을 경우
                punchOutButton.disabled = true;
                punchOutButton.style.opacity = '0.6';
            }
        } else { // 출근 기록이 없는 경우
            punchInTimeSpan.textContent = '--:--';
            punchInButton.disabled = false;
            punchInButton.style.opacity = '1';
            punchOutButton.disabled = true;
            punchOutButton.style.opacity = '0.6';
        }

        // 퇴근 시간 표시 업데이트
        if (att_out_time) {
            const date = new Date(att_out_time);
            punchOutTimeSpan.textContent = date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
        } else {
            punchOutTimeSpan.textContent = '--:--';
        }

        // 출퇴근 상태 표시 업데이트
        if (det_nm) {
            punchStatusSpan.textContent = det_nm;
        } else {
            punchStatusSpan.textContent = '--';
        }

      	// 총 근무 시간 계산 및 업데이트: 분리된 함수 사용
      	totalWorkTimeSpan.textContent = calculateFormattedWorkTime(att_in_time, att_out_time);

    }

    // --- 1. 페이지 로드 시 오늘 현황을 DB에서 가져와 표시 ---
    function loadTodayAttendanceStatus() {
        $.ajax({
            url: TODAY_STATUS_URL,
            method: 'GET',
            dataType: 'json',
            success: function(response) {
                console.log('오늘 출퇴근 현황 응답:', JSON.stringify(response));
                // 받아온 데이터를 UI 업데이트 함수에 전달
                updateAttendanceUI(response);
            },
            error: function(xhr, status, error) {
                console.error("오늘 출퇴근 현황 불러오기 실패:", error);
                // 에러 발생 시 UI를 기본값으로 재설정
                punchInTimeSpan.textContent = '--:--';
                punchOutTimeSpan.textContent = '--:--';
                totalWorkTimeSpan.textContent = '--시간 --분';
                punchStatusSpan.textContent = '--';
                punchInButton.disabled = false;
                punchInButton.style.opacity = '1';
                punchOutButton.disabled = true;
                punchOutButton.style.opacity = '0.6';
                alert('출퇴근 현황을 불러오는 데 실패했습니다. 다시 시도해주세요.');
            }
        });
    }

    // 페이지 로드 시 바로 현황을 불러옴
    loadTodayAttendanceStatus();

    // --- 2. 출근 버튼 클릭 시 DB에 기록 ---
    punchInButton.addEventListener('click', () => {
        $.ajax({
            url: PUNCH_IN_URL,
            method: 'POST',
            dataType: 'json',
            success: function(response) {
                alert('출근 등록이 완료되었습니다!');
                // 서버 응답으로 UI 업데이트
                updateAttendanceUI(response);
                // 새로운 출근이므로 퇴근 시간 및 총 근무 시간 초기화 (updateAttendanceUI에서 이미 처리됨)
            },
            error: function(xhr, status, error) {
                console.error("출근 등록 실패:", xhr.responseText);
                alert('출근 등록에 실패했습니다. 다시 시도해주세요. (오류: ' + xhr.responseText + ')');
            }
        });
    });

    // --- 3. 퇴근 버튼 클릭 시 DB에 기록 ---
    punchOutButton.addEventListener('click', () => {
        // 출근 기록이 없으면 퇴근 불가 (서버에서도 검증 필요)
        if (punchInTimeSpan.textContent === '--:--') {
            alert('출근 기록이 없습니다. 먼저 출근 등록을 해주세요.');
            return;
        }

        const currentAttId = currentAttIdInput.value; // 숨겨진 필드에서 att_id 가져오기
        console.log('전송하려는 ATT_ID:', currentAttId);

        $.ajax({
            url: PUNCH_OUT_URL,
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
                att_id: currentAttId
            }),
            success: function(response) {
                alert('퇴근 등록이 완료되었습니다!');
                // 서버 응답으로 UI 업데이트
                updateAttendanceUI(response);
            },
            error: function(xhr, status, error) {
                console.error("HTTP 상태:", status);
                console.error("오류 객체:", error);
                console.error("퇴근 등록 실패:", xhr.responseText);
                alert('퇴근 등록에 실패했습니다. 다시 시도해주세요.');
            }
        });
    });
});