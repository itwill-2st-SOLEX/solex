document.addEventListener('DOMContentLoaded', () => {
    const punchInButton = document.querySelector('.punch-in');
    const punchOutButton = document.querySelector('.punch-out');
    const punchInTimeSpan = document.getElementById('punch-in-time');
    const punchOutTimeSpan = document.getElementById('punch-out-time');
    const totalWorkTimeSpan = document.getElementById('total-work-time');
    const pubchStatusSpan = document.getElementById('punch-sts');
    const resetButton = document.getElementById('reset-attendance-button'); // 초기화 버튼 (이전 단계에서 추가했다면)

    // 서버 API 엔드포인트 정의 
    const API_BASE_URL = '/SOLEX/attendance/api'; // 예시. 실제 API 경로에 따라 변경
    const PUNCH_IN_URL = `${API_BASE_URL}/punch-in`;
    const PUNCH_OUT_URL = `${API_BASE_URL}/punch-out`;
    const TODAY_STATUS_URL = `${API_BASE_URL}/today`;

    // --- 1. 페이지 로드 시 오늘 현황을 DB에서 가져와 표시 ---
    function loadTodayAttendanceStatus() {
//		debugger;
        $.ajax({
            url: TODAY_STATUS_URL,
            method: 'GET',
            dataType: 'json', // 서버가 JSON 형식으로 응답할 것으로 기대
            success: function(response) {
                // 서버 응답 예시: { "punchInTime": "2025-06-09T09:00:00", "punchOutTime": null, "totalWorkMinutes": 0 }
                // 또는 { "punchInTime": "2025-06-09T09:00:00", "punchOutTime": "2025-06-09T18:00:00", "totalWorkMinutes": 540 }

				console.log('today response??????????   '  + JSON.stringify(response));
                const punchInDbTime = response.att_in_time;
                const punchOutDbTime = response.att_out_time;
				const punchStatus = response.det_nm;
                
                // 출근 시간 표시 및 버튼 상태
                if (punchInDbTime) {
                    const date = new Date(punchInDbTime); // 서버에서 받은 시간 (ISO 8601 문자열)을 Date 객체로 변환
                    punchInTimeSpan.textContent = date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
                    punchInButton.disabled = true;
                    punchInButton.style.opacity = '0.6';
					punchStatus.textContent = punchStatus;
                    // 출근은 했는데 아직 퇴근을 안 했을 경우
                    if (!punchOutDbTime) { 
                        punchOutButton.disabled = false;
                        punchOutButton.style.opacity = '1';
                    } else { // 퇴근까지 완료했을 경우
                        punchOutButton.disabled = true;
                        punchOutButton.style.opacity = '0.6';
                    }
                } else {
                    // 출근 기록이 없는 경우
                    punchInTimeSpan.textContent = '--:--';
                    punchInButton.disabled = false;
                    punchInButton.style.opacity = '1';
                    punchOutButton.disabled = true;
                    punchOutButton.style.opacity = '0.6';
                }

                // 퇴근 시간 표시
                if (punchOutDbTime) {
                    const date = new Date(punchOutDbTime);
                    punchOutTimeSpan.textContent = date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
                } else {
                    punchOutTimeSpan.textContent = '--:--';
                }
				
				// 출퇴근 상태 표시
				if(punchStatus) {
					pubchStatusSpan.textContent = punchStatus;
				} else {
					pubchStatusSpan.textContent = '--';
				}
				
				// 근무시간 표시
				if (punchInDbTime && punchOutDbTime) { // 두 값이 모두 존재할 때만 계산
				    const punchInDate = new Date(punchInDbTime);
				    const punchOutDate = new Date(punchOutDbTime);

				    if (isNaN(punchInDate.getTime()) || isNaN(punchOutDate.getTime())) {
				        console.error("유효하지 않은 날짜/시간 형식이 DB에서 넘어왔습니다.");
				        totalWorkTimeSpan.textContent = '--시간 --분';
				    } else {
				        const totalMilliseconds = punchOutDate.getTime() - punchInDate.getTime();
				        const totalWorkMinutes = Math.floor(totalMilliseconds / (1000 * 60));

				        const hours = Math.floor(totalWorkMinutes / 60);
				        const minutes = totalWorkMinutes % 60;

				        totalWorkTimeSpan.textContent = `${hours}시간 ${minutes}분`;
				    }
				} else {
				    // 퇴근 시간이 아직 없거나 출근 시간 정보가 없을 경우
				    totalWorkTimeSpan.textContent = '--시간 --분';
				}
				
            },
            error: function(xhr, status, error) {
                console.error("오늘 출퇴근 현황 불러오기 실패:", error);
                // 에러 처리: 사용자에게 메시지를 보여주거나 기본 값으로 설정
                punchInTimeSpan.textContent = '--:--';
                punchOutTimeSpan.textContent = '--:--';
                totalWorkTimeSpan.textContent = '--시간 --분';
				attStsSpan.textContent='-';
                alert('출퇴근 현황을 불러오는 데 실패했습니다. 다시 시도해주세요.');
            }
        });
    }

    // 페이지 로드 시 바로 현황을 불러옴
    loadTodayAttendanceStatus();


    // --- 2. 출근 버튼 클릭 시 DB에 기록 ---
    punchInButton.addEventListener('click', () => {
        // 현재 시간은 서버에 저장할 때 서버에서 생성하는 것이 더 정확합니다.
        // 클라이언트에서는 그냥 요청만 보내면 됩니다.
        
        $.ajax({
            url: PUNCH_IN_URL,
            method: 'POST', // POST 요청
            dataType: 'json',
            // data: JSON.stringify({ userId: 'currentUserId' }), // 필요한 경우 사용자 ID 등 전송
            // contentType: 'application/json', // JSON 데이터를 보낼 경우
            success: function(response) {
                // 서버 응답 예시: { "status": "success", "punchInTime": "2025-06-09T09:05:30" }
                alert('출근 등록이 완료되었습니다!');
            
				// DB에 저장된 실제 출근 시간과 상태를 받아와 UI 업데이트
                const punchInDbTime = response.att_in_time;
				const punchStatus = response.det_nm;

				
                if (punchInDbTime) {
                    const date = new Date(punchInDbTime);
                    punchInTimeSpan.textContent = date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
                }

                // 버튼 상태 변경
                punchInButton.disabled = true;
                punchInButton.style.opacity = '0.6';
                punchOutButton.disabled = false;
                punchOutButton.style.opacity = '1';

				// 출퇴근 상태 표시
				if(punchStatus) {
					pubchStatusSpan.textContent = punchStatus;
				} else {
					pubchStatusSpan.textContent = '--';
				}

				
                // 퇴근 시간 및 총 근무 시간 초기화 (새로운 출근이므로)
                punchOutTimeSpan.textContent = '--:--';
                totalWorkTimeSpan.textContent = '--시간 --분';
            },
            error: function(xhr, status, error) {
                console.error("출근 등록 실패:", xhr.responseText);
                alert('출근 등록에 실패했습니다. 다시 시도해주세요. (오류: ' + xhr.responseText + ')');
            }
        });
    });


    // --- 3. 퇴근 버튼 클릭 시 DB에 기록 ---
    punchOutButton.addEventListener('click', () => {
        // 출근 기록이 없으면 퇴근 불가 (이는 서버에서도 한 번 더 검증해야 합니다)
        if (punchInTimeSpan.textContent === '--:--') {
            alert('출근 기록이 없습니다. 먼저 출근 등록을 해주세요.');
            return;
        }
		console.log('AJAX 요청 시작 직전! punchInTimeSpan.textContent:', punchInTimeSpan.textContent); // 추가

        $.ajax({
            url: PUNCH_OUT_URL,
            method: 'POST', // POST 요청
            dataType: 'json',
			   
            success: function(response) {
                // 서버 응답 예시: { "status": "success", "punchOutTime": "2025-06-09T18:00:00", "totalWorkMinutes": 535 }
                alert('퇴근 등록이 완료되었습니다!');
                
                // DB에 저장된 실제 퇴근 시간 및 총 근무 시간을 받아와 UI 업데이트
                const punchOutDbTime = response.att_out_time;
                const totalWorkMinutes = response.totalWorkMinutes;
				const punchStatus = response.det_nm;

				
				console.log('punchOutDbTime ?? ' + JSON.stringify(response));
				
                if (punchOutDbTime) {
                    const date = new Date(punchOutDbTime);
                    punchOutTimeSpan.textContent = date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
                }
				// 출퇴근 상태 표시
				if(punchStatus) {
					pubchStatusSpan.textContent = punchStatus;
				} else {
					pubchStatusSpan.textContent = '--';
				}

                if (totalWorkMinutes !== undefined && totalWorkMinutes !== null) {
                    const hours = Math.floor(totalWorkMinutes / 60);
                    const minutes = totalWorkMinutes % 60;
                    totalWorkTimeSpan.textContent = `${hours}시간 ${minutes}분`;
                }

                // 버튼 상태 변경
                punchOutButton.disabled = true;
                punchOutButton.style.opacity = '0.6';
                punchInButton.disabled = true; // 퇴근 후에는 다시 출근할 수 없도록 비활성화
                punchInButton.style.opacity = '0.6';

            },
            error: function(xhr, status, error) {
	            console.error("HTTP 상태:", status);
	            console.error("오류 객체:", error);
                console.error("퇴근 등록 실패:", xhr.responseText);
                alert('퇴근 등록에 실패했습니다. 다시 시도해주세요. (오류: ' + xhr.responseText + ')');
				       
            }
        });
    });

    // --- 4. 기록 초기화 버튼 (선택 사항) ---
    // DB에서 기록을 삭제하는 API가 필요합니다.
    // 이 기능은 보통 관리자 권한으로만 허용하거나, 특정 조건(예: 오늘 기록만 삭제)에서만 허용합니다.
    if (resetButton) { // 버튼이 존재할 경우에만 이벤트 리스너 추가
        resetButton.addEventListener('click', () => {
            const confirmReset = confirm('정말로 오늘 출퇴근 기록을 초기화하시겠습니까? 이 작업은 되돌릴 수 없습니다.');
            if (confirmReset) {
                // 서버에 삭제 요청 보내기 (예: DELETE /api/attendance/today)
                $.ajax({
                    url: `${API_BASE_URL}/today`, // 오늘 기록 삭제 API
                    method: 'DELETE', // DELETE 요청
                    success: function(response) {
                        alert('오늘 출퇴근 기록이 초기화되었습니다.');
                        // UI 초기화 및 버튼 상태 재설정
                        punchInTimeSpan.textContent = '--:--';
                        punchOutTimeSpan.textContent = '--:--';
                        totalWorkTimeSpan.textContent = '--시간 --분';
						attStsSpan.textContent = '-';

                        punchInButton.disabled = false;
                        punchInButton.style.opacity = '1';
                        punchOutButton.disabled = true;
                        punchOutButton.style.opacity = '0.6';
                    },
                    error: function(xhr, status, error) {
                        console.error("기록 초기화 실패:", xhr.responseText);
                        alert('기록 초기화에 실패했습니다. (오류: ' + xhr.responseText + ')');
                    }
                });
            }
        });
    }

    // --- 5. 매일 자정 localStorage 초기화 로직은 이제 필요 없음 (서버에서 관리하므로) ---
    // 단, 서버가 매일 자정에 데이터를 초기화하거나 새로운 날짜로 전환하는 로직을 가지고 있어야 합니다.
    // 클라이언트의 localStorage.removeItem('punchIn'); 및 location.reload(); 부분은 삭제합니다.
    // 만약 로컬에서만 테스트하고 싶다면 잠시 유지해도 되지만, DB 연동 시에는 서버가 기준이 됩니다.
});