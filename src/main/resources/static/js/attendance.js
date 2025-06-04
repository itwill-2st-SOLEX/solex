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
    sendMonthYearToServer(year, month);
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
			console.log("displayMyAttendance - data : " + data);
			console.log("내 근태 데이터:", data.myAttendance);
			console.log("팀 근태 데이터:", data.teamAttendance);
//			updateAttendanceTable(data);
			displayMyAttendance(data);
			 

        })
        .catch(error => {
            console.error('데이터 전송 또는 수신 중 오류 발생:', error);
            console.error('데이터 로드 중 오류가 발생했습니다.');
			console.log('서버로부터 받은 데이터:', data);
	});
}


$(document).ready(function() {
    let currentPath = window.location.pathname; // 현재 페이지의 URL 경로를 가져옴 (예: "/my-attendance")
    let requestType = '';
    
    if (currentPath.includes('/my_attendance_list')) { // 경로에 '/my-attendance'가 포함되어 있는지 확인
        requestType = 'my';
        console.log("현재 페이지는 '내 근태 현황' 페이지입니다.");
    } else if (currentPath.includes('/attendance_list')) { // 경로에 '/team-attendance'가 포함되어 있는지 확인
        requestType = 'team';
        console.log("현재 페이지는 '팀 근태 현황' 페이지입니다.");
    } else {
        requestType = 'default'; // 그 외의 경우 기본값 설정
        console.log("알 수 없는 근태 페이지입니다. 기본값을 사용합니다.");
    }

    $.ajax({
        url: '/SOLEX/attendance/data',
        type: 'GET',
        data: {
            year: year,
            month: month,
            resultType: requestType // 결정된 requestType을 서버로 전송
        },
        dataType: 'json',
        success: function(response) {
            console.log('서버 응답:', response);

            if (response.myAttendance && requestType === 'my') {
                // '내 근태 현황' 페이지일 때 개인 근태 데이터 처리
                displayMyAttendance(response.myAttendance);
            }

            if (response.teamAttendance && requestType === 'team') {
                // '팀 근태 현황' 페이지일 때 팀 근태 데이터 처리
                displayTeamAttendance(response.teamAttendance);
            }
            // 또는 하나의 페이지에서 모두 보여준다면:
            // if (response.myAttendance) { displayMyAttendance(response.myAttendance); }
            // if (response.teamAttendance) { displayTeamAttendance(response.teamAttendance); }
        },
        error: function(xhr, status, error) {
            console.error("AJAX 요청 실패:", status, error);
            console.log("응답 텍스트:", xhr.responseText);
        }
    });

    
});

// 예시: 개인 근태 데이터를 표시하는 함수
function displayMyAttendance(data) {
//	console.log('함수 진입 시 data:', data, Array.isArray(data)); // 여기서는 true가 찍힘
//	console.log('displayMyAttendance 함수로 전달된 data:', data); // 여기에 무엇이 찍히는지 확인
//    console.log('data는 배열인가요?', Array.isArray(data)); // true가 찍혀야 합니다.

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


// 예시: 팀 근태 데이터를 표시하는 함수
function displayTeamAttendance(data) {
    // 예: #teamAttendanceTable body에 데이터 삽입
    let html = '';
    data.forEach(item => {
        html += `<tr><td>${item.EMP_ID}</td><td>${item.ATT_IN_TIME}</td><td>${item.ATT_OUT_TIME}</td></tr>`;
    });
    $('#teamAttendanceTable tbody').html(html);
}
















