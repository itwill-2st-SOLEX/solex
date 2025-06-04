const year = currentDate.getFullYear();
const month = currentDate.getMonth() + 1;

const currentMonthYearSpan = document.getElementById('currentMonthYear');
const prevMonthBtn = document.getElementById('prevMonthBtn');
const nextMonthBtn = document.getElementById('nextMonthBtn');

const myAttendance = '';
const teamAttendance = '';
const whatAttendance = '';

// 페이지 로드 시 초기 표시
updateMonthYearDisplay();

// updateMonthYearDisplay 함수가 호출될 때 currentDate를 기준으로 화면을 업데이트하고 서버로 데이터 전송
function updateMonthYearDisplay() {
    
    currentMonthYearSpan.textContent = `${year}년 ${month}월`;
	
    // 바뀐 연도와 월을 서버 전송
    // empId는 로그인 정보를 통해 가져와야 하지만, 현재는 하드코딩
    sendMonthYearToServer(year, month, '11');
}

// sendMonthYearToServer 함수에 empId 파라미터 추가
function sendMonthYearToServer(year, month) {
    const url = `/SOLEX/attendance/data?year=${year}&month=${month}`; // empId 추가
	
    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            updateAttendanceTable(data);
        })
        .catch(error => {
            console.error('데이터 전송 또는 수신 중 오류 발생:', error);
            console.error('데이터 로드 중 오류가 발생했습니다.');
			console.log('서버로부터 받은 데이터:', data);
	});
}

// JSON 데이터를 받아 HTML 테이블을 업데이트하는 함수
//function updateAttendanceTable(attendanceData) {
function updateAttendanceTable(combinedMap) {
    const tableBody = document.getElementById('attendanceTableBody');
    tableBody.innerHTML = ''; // 기존 테이블 내용 비우기

    if (!attendanceData || attendanceData.length === 0) {
        // 데이터가 없거나 비어있는 경우
        tableBody.innerHTML = `
            <tr>
                <td colspan="5" style="text-align: center;">해당 월의 데이터가 없습니다.</td>
            </tr>
        `;
        return;
    }
    // 데이터를 순회하며 각 항목에 대해 테이블 행 생성
    attendanceData.forEach(item => {
        const row = document.createElement('tr'); // 새로운 행 (<tr>) 생성

        // 각 컬럼에 대한 데이터 셀 (<td>) 생성
        // 서버에서 보낸 JSON의 키 이름과 일치시켜야 합니다.
        // 예: EMP_ID, ATT_IN_TIME, ATT_OUT_TIME, ATT_STS, ATT_DAY
        row.innerHTML = `
            <td>${item.EMP_NUM || ''}</td>
            <td>${item.ATT_IN_TIME || ''}</td>
            <td>${item.ATT_OUT_TIME || ''}</td>
            <td>${item.ATT_STS || ''}</td>
            <td>${item.ATT_DAY || ''}</td>
        `;
        // ${item.KEY_NAME || ''} : 데이터가 없는 경우를 대비해 빈 문자열로 표시 (오류 방지)

        tableBody.appendChild(row); // 생성된 행을 테이블 본문에 추가
    });
}

// 이전 달로 이동하는 함수
function goToPreviousMonth() {
    currentDate.setMonth(currentDate.getMonth() - 1); // 현재 월에서 1을 뺌
    updateMonthYearDisplay(); // 표시 업데이트
}

//// 다음 달로 이동하는 함수
function goToNextMonth() {
    currentDate.setMonth(currentDate.getMonth() + 1); // 현재 월에 1을 더함
    updateMonthYearDisplay(); // 표시 업데이트
    // TODO: 여기에 실제 DB에서 해당 월의 데이터를 가져와서 테이블을 업데이트하는 로직 추가
}


// 이벤트 리스너 연결
prevMonthBtn.addEventListener('click', goToPreviousMonth);
nextMonthBtn.addEventListener('click', goToNextMonth);


let requestResultType = 'my'; 

$.ajax({
    url: '/SOLEX/attendance/data', // 컨트롤러 URL 확인
    type: 'GET',
    data: { year: `${year}`,
			month: `${month}`,
			resultType: requestResultType
		  },
    dataType: 'json',
    success: function(response) {
        console.log('서버 응답:', response);

        // 'myAttendance' 데이터 확인 및 처리
        // response.myAttendance가 null이 아니거나 undefined가 아니고, 배열이면 (선택적으로 길이를 확인)
        if (response.myAttendance) { // response.myAttendance가 존재하는지 확인
            console.log('개인 근태 데이터 처리 시작:', response.myAttendance);
            // 여기에 개인 근태 데이터를 처리하는 로직 (예: 특정 테이블에 데이터 채우기)
            displayMyAttendance(response.myAttendance);
        }

        // 'teamAttendance' 데이터 확인 및 처리
        if (response.teamAttendance) { // response.teamAttendance가 존재하는지 확인
            console.log('팀 근태 데이터 처리 시작:', response.teamAttendance);
            // 여기에 팀 근태 데이터를 처리하는 로직 (예: 다른 테이블에 데이터 채우기, 관리자 대시보드 업데이트)
            displayTeamAttendance(response.teamAttendance);
        }
    },
    error: function(xhr, status, error) {
        console.error("AJAX 요청 실패:", status, error);
    }
});


// 예시: 개인 근태 데이터를 표시하는 함수
function displayMyAttendance(data) {
	const tableBody = document.getElementById('myAttendanceTable');
	tableBody.innerHTML = ''; // 기존 테이블 내용 비우기
	
	if (!data || data.length === 0) {
        // 데이터가 없거나 비어있는 경우
        tableBody.innerHTML = `
            <tr>
                <td colspan="5" style="text-align: center;">해당 월의 데이터가 없습니다.</td>
            </tr>
        `;
        return;
    }
	// 데이터를 순회하며 각 항목에 대해 테이블 행 생성
    data.forEach(item => {
        const row = document.createElement('tr'); // 새로운 행 (<tr>) 생성

        // 각 컬럼에 대한 데이터 셀 (<td>) 생성
        row.innerHTML = `
            <td>${item.EMP_ID || ''}</td>
            <td>${item.ATT_IN_TIME || ''}</td>
            <td>${item.ATT_OUT_TIME || ''}</td>
            <td>${item.ATT_STS || ''}</td>
            <td>${item.ATT_DAY || ''}</td>
        `;
        // ${item.KEY_NAME || ''} : 데이터가 없는 경우를 대비해 빈 문자열로 표시 (오류 방지)

        tableBody.appendChild(row); // 생성된 행을 테이블 본문에 추가
    });
}

// 예시: 팀 근태 데이터를 표시하는 함수
function displayTeamAttendance(data) {
    // 예: #teamAttendanceTable body에 데이터 삽입
    let html = '';
    data.forEach(item => {
        html += `<tr><td>${item.EMP_ID}</td><td>${item.ATT_IN_TIME}</td><td>${item.ATT_OUT_TIME}</td></tr>`;
    });
    $('#teamAttendanceTable tbody').html(html);
}
















