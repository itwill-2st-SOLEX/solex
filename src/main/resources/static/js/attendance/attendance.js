const currentMonthYearSpan = document.getElementById('currentMonthYear');
const prevMonthBtn = document.getElementById('prevMonthBtn');
const nextMonthBtn = document.getElementById('nextMonthBtn');

// these variables are not used. remove them or initialize them correctly if they are needed later.
// const myAttendance = '';
// const teamAttendance = '';
// const whatAttendance = '';

// 페이지 로드 시 초기 표시
updateMonthYearDisplay(); 

// updateMonthYearDisplay 함수가 호출될 때 currentDate를 기준으로 화면을 업데이트하고 서버로 데이터 전송
function updateMonthYearDisplay() {
	debugger;
    // ⭐⭐⭐ currentDate에서 직접 연도와 월을 가져와 사용합니다. ⭐⭐⭐
    const displayYear = currentDate.getFullYear();
    const displayMonth = currentDate.getMonth() + 1;
    currentMonthYearSpan.textContent = `${displayYear}년 ${displayMonth}월`; 
	
    // ⭐⭐⭐ 여기에서 requestType을 결정하여 sendMonthYearToServer로 전달합니다. ⭐⭐⭐
    let requestType = '';
    let currentPath = window.location.pathname; 
    
    if (currentPath.includes('/my_attendance_list')) {
        requestType = 'my';
        console.log("현재 페이지는 '내 근태 현황' 페이지입니다.");
    } else if (currentPath.includes('/attendance_list')) {
        requestType = 'team';
        console.log("현재 페이지는 '팀 근태 현황' 페이지입니다.");
    } else {
        requestType = 'default';
        console.log("알 수 없는 근태 페이지입니다. 기본값을 사용합니다.");
    }

    // ⭐⭐⭐ sendMonthYearToServer에도 updateMonthYearDisplay 내부의 최신 year, month를 전달합니다. ⭐⭐⭐
    sendMonthYearToServer(displayYear, displayMonth, requestType); 
}

// sendMonthYearToServer 함수는 현재 그대로 두셔도 됩니다.
function sendMonthYearToServer(year, month, requestType) { 
    const url = `/SOLEX/attendance/data?year=${year}&month=${month}&resultType=${requestType}`; 
    
    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log("서버로부터 받은 전체 데이터 (객체 형태):", data); 
            console.log("내 근태 데이터:", data.myAttendance);
            console.log("팀 근태 데이터:", data.teamAttendance); 

            if (requestType === 'my' && data.myAttendance && Array.isArray(data.myAttendance)) {
                displayMyAttendance(data.myAttendance);
            } else if (requestType === 'team' && data.teamAttendance && Array.isArray(data.teamAttendance)) {
                displayTeamAttendance(data.teamAttendance);
            } else {
                console.warn("요청 타입에 맞는 데이터가 없거나, 정의되지 않은 요청 타입입니다.");
                if (data.myAttendance && Array.isArray(data.myAttendance)) {
                    displayMyAttendance(data.myAttendance);
                }
                if (data.teamAttendance && Array.isArray(data.teamAttendance)) {
                    displayTeamAttendance(data.teamAttendance);
                }
            }
        })
        .catch(error => {
            console.error('데이터 전송 또는 수신 중 오류 발생:', error);
            console.error('데이터 로드 중 오류가 발생했습니다.');
        });
}

// displayMyAttendance 함수도 현재 그대로 두시면 됩니다. forEach 오류는 이전에 해결됐어야 합니다.
function displayMyAttendance(data) {
    let tableBody = document.getElementById('myAttendanceTable2'); // #myAttendanceTable2 tbody를 직접 선택하는 것이 안전
	tableBody.innerHTML = ''; 
	
	if (!data || data.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="5" style="text-align: center;">해당 월의 데이터가 없습니다.</td>
            </tr>
        `;
        return;
    }
	
    data.forEach(item => {
        const row = document.createElement('tr'); 

        row.innerHTML = `
            <td>${item.EMP_ID || ''}</td>
            <td>${item.ATT_IN_TIME || ''}</td>
            <td>${item.ATT_OUT_TIME || ''}</td>
            <td>${item.ATT_STS || ''}</td>
            <td>${item.ATT_DAY || ''}</td>
        `;

        tableBody.appendChild(row); 
    });
}


// displayTeamAttendance 함수도 현재 그대로 두시면 됩니다.
function displayTeamAttendance(data) {
	let tableBody = document.getElementById('myAttendanceTable2'); // #myAttendanceTable2 tbody를 직접 선택하는 것이 안전
	tableBody.innerHTML = ''; 
	
	if (!data || data.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="5" style="text-align: center;">해당 월의 데이터가 없습니다.</td>
            </tr>
        `;
        return;
    }
	
    data.forEach(item => {
        const row = document.createElement('tr'); 

        row.innerHTML = `
            <td>${item.EMP_ID || ''}</td>
            <td>${item.ATT_IN_TIME || ''}</td>
            <td>${item.ATT_OUT_TIME || ''}</td>
            <td>${item.ATT_STS || ''}</td>
            <td>${item.ATT_DAY || ''}</td>
        `;

        tableBody.appendChild(row); 
    });
//    const tableBody = document.getElementById('myAttendanceTable2'); // 팀 근태 테이블 ID 확인
//    tableBody.innerHTML = ''; 
//
//    if (!data || data.length === 0) {
//        tableBody.innerHTML = `
//            <tr>
//                <td colspan="3" style="text-align: center;">해당 월의 데이터가 없습니다.</td>
//            </tr>
//        `;
//        return;
//    }
//    let html = '';
//    data.forEach(item => {
//        html += `<tr><td>${item.EMP_ID || ''}</td><td>${item.ATT_IN_TIME || ''}</td><td>${item.ATT_OUT_TIME || ''}</td></tr>`;
//    });
//    tableBody.innerHTML = html; 
}

// 이전 달로 이동하는 함수
function goToPreviousMonth() {
    currentDate.setMonth(currentDate.getMonth() - 1); 
    // console.log('전월 ' + currentDate.setMonth(currentDate.getMonth() - 1)); // 이 console.log는 setMonth의 반환값을 사용하므로 혼동될 수 있습니다.
                                                                           // currentDate는 이미 변경되었으니 그냥 currentDate를 출력하는 것이 좋습니다.
    console.log('전월로 이동:', currentDate);
    updateMonthYearDisplay(); 
}

// 다음 달로 이동하는 함수
function goToNextMonth() {
    currentDate.setMonth(currentDate.getMonth() + 1); 
    console.log('다음 달로 이동:', currentDate); // 로그 추가
    updateMonthYearDisplay(); 
}

// 이벤트 리스너 연결 (이 부분은 올바릅니다.)
prevMonthBtn.addEventListener('click', goToPreviousMonth);
nextMonthBtn.addEventListener('click', goToNextMonth);