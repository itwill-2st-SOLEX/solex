document.addEventListener('DOMContentLoaded', () => {
    const punchInButton = document.querySelector('.punch-in');
    const punchOutButton = document.querySelector('.punch-out');
    const punchInTimeSpan = document.getElementById('punch-in-time');
    const punchOutTimeSpan = document.getElementById('punch-out-time');
    const totalWorkTimeSpan = document.getElementById('total-work-time');

    let punchInTimestamp = null;
    let punchOutTimestamp = null;
	
	// 서버 API 엔드포인트 정의
    const API_BASE_URL = '/attendanceapi/api/'; // 예시. 실제 API 경로에 따라 변경
    const PUNCH_IN_URL = `${API_BASE_URL}/punch-in`;
    const PUNCH_OUT_URL = `${API_BASE_URL}/punch-out`;
    const TODAY_STATUS_URL = `${API_BASE_URL}/today`;

    // 초기 로드 시 localStorage에서 데이터 불러오기
    if (localStorage.getItem('punchIn')) {
        punchInTimestamp = parseInt(localStorage.getItem('punchIn'));
        punchInTimeSpan.textContent = new Date(punchInTimestamp).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
        punchInButton.disabled = true; // 출근 버튼 비활성화
        punchInButton.style.opacity = '0.6';
        punchOutButton.disabled = false; // 퇴근 버튼 활성화
        punchOutButton.style.opacity = '1';
    } else {
        punchInButton.disabled = false;
        punchInButton.style.opacity = '1';
        punchOutButton.disabled = true; // 퇴근 버튼 비활성화
        punchOutButton.style.opacity = '0.6';
    }

    if (localStorage.getItem('punchOut')) {
        punchOutTimestamp = parseInt(localStorage.getItem('punchOut'));
        punchOutTimeSpan.textContent = new Date(punchOutTimestamp).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
        punchOutButton.disabled = true; // 퇴근 버튼 비활성화
        punchOutButton.style.opacity = '0.6';
        punchInButton.disabled = true; // 출근 버튼도 비활성화 (이미 퇴근했으므로)
        punchInButton.style.opacity = '0.6';
        calculateTotalWorkTime();
    }

    punchInButton.addEventListener('click', () => {
        punchInTimestamp = Date.now();
        localStorage.setItem('punchIn', punchInTimestamp);
        punchInTimeSpan.textContent = new Date(punchInTimestamp).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
        
        punchInButton.disabled = true;
        punchInButton.style.opacity = '0.6';
        punchOutButton.disabled = false;
        punchOutButton.style.opacity = '1';

        alert('출근 등록이 완료되었습니다!');
        // 새로고침 없이 퇴근 시간 초기화 및 총 근무 시간 리셋
        punchOutTimeSpan.textContent = '--:--';
        totalWorkTimeSpan.textContent = '--시간 --분';
        localStorage.removeItem('punchOut');
    });

    punchOutButton.addEventListener('click', () => {
        if (!punchInTimestamp) {
            alert('출근 기록이 없습니다. 먼저 출근 등록을 해주세요.');
            return;
        }

        punchOutTimestamp = Date.now();
        localStorage.setItem('punchOut', punchOutTimestamp);
        punchOutTimeSpan.textContent = new Date(punchOutTimestamp).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });

        punchOutButton.disabled = true;
        punchOutButton.style.opacity = '0.6';
        punchInButton.disabled = true; // 퇴근 후에는 다시 출근할 수 없도록 비활성화
        punchInButton.style.opacity = '0.6';

        calculateTotalWorkTime();
        alert('퇴근 등록이 완료되었습니다!');
    });

    function calculateTotalWorkTime() {
        if (punchInTimestamp && punchOutTimestamp) {
            const diffMs = punchOutTimestamp - punchInTimestamp;
            const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
            const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
            totalWorkTimeSpan.textContent = `${diffHours}시간 ${diffMinutes}분`;
        }
    }

    // 매일 자정 localStorage 초기화 (새로운 날 시작 시)
    const now = new Date();
    const midnight = new Date(now.getFullYear(), now.getMonth(), now.setDate(now.getDate() + 1), 0, 0, 0); // 다음날 자정
    const timeUntilMidnight = midnight.getTime() - now.getTime();

//    setTimeout(() => {
//        localStorage.removeItem('punchIn');
//        localStorage.removeItem('punchOut');
//        // 페이지 새로고침 또는 UI 업데이트 로직 추가
//        location.reload(); // 간단하게 페이지 새로고침
//    }, timeUntilMidnight);
});