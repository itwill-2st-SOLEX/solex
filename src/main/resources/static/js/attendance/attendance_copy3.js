const currentDate = new Date(); // 이 변수가 코드 어딘가에 정의되어 있어야 합니다.
                               // 이 코드를 처음 본 부분이라 추가합니다.

const year = currentDate.getFullYear();
const month = currentDate.getMonth() + 1;

const currentMonthYearSpan = document.getElementById('currentMonthYear');
const prevMonthBtn = document.getElementById('prevMonthBtn');
const nextMonthBtn = document.getElementById('nextMonthBtn');

// these variables are not used. remove them or initialize them correctly if they are needed later.
// const myAttendance = '';
// const teamAttendance = '';
// const whatAttendance = '';

// 페이지 로드 시 초기 표시
updateMonthYearDisplay(); // <-- 여기서 첫 데이터 요청이 시작됩니다.

// updateMonthYearDisplay 함수가 호출될 때 currentDate를 기준으로 화면을 업데이트하고 서버로 데이터 전송
function updateMonthYearDisplay() {
    currentMonthYearSpan.textContent = `${currentDate.getFullYear()}년 ${currentDate.getMonth() + 1}월`; // year, month 대신 currentDate 사용

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

    sendMonthYearToServer(currentDate.getFullYear(), currentDate.getMonth() + 1, requestType); // requestType 파라미터 추가
}

// sendMonthYearToServer 함수에 requestType 파라미터 추가
function sendMonthYearToServer(year, month, requestType) { // requestType 인자 받기
    const url = `/SOLEX/attendance/data?year=${year}&month=${month}&resultType=${requestType}`; // resultType 추가
    
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
            console.log("팀 근태 데이터:", data.teamAttendance); // 팀 근태도 확인용 로그 추가

            // ⭐⭐⭐ 여기에서 requestType에 따라 적절한 display 함수 호출 ⭐⭐⭐
            if (requestType === 'my' && data.myAttendance && Array.isArray(data.myAttendance)) {
                displayMyAttendance(data.myAttendance);
            } else if (requestType === 'team' && data.teamAttendance && Array.isArray(data.teamAttendance)) {
                displayTeamAttendance(data.teamAttendance);
            } else {
                // 기본값 또는 예측 불가능한 경우 처리 (예: 대시보드에서 둘 다 보여줄 경우)
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
            // fetch의 catch 블록에서는 'data' 변수에 접근할 수 없습니다.
            // console.log('서버로부터 받은 데이터:', data); // 이 줄은 에러 유발 가능. 제거하거나 주석 처리
        });
}


// 예시: 개인 근태 데이터를 표시하는 함수
function displayMyAttendance(data) {
	// debugger; // 디버깅용으로 남겨두셔도 좋습니다.
    console.log('displayMyAttendance 함수로 전달된 data:', data, Array.isArray(data)); 

	const tableBody = document.getElementById('myAttendanceTable'); // id가 myAttendanceTable인 요소 찾기
	
    // 테이블 tbody를 정확히 지정하려면 HTML에서 <table id="myAttendanceTable"><tbody></tbody></table> 형태로 만들고,
    // JS에서 document.querySelector('#myAttendanceTable tbody')로 접근하는 것이 좋습니다.
    // 현재 코드에서는 tableBody가 <table> 요소 자체가 될 것입니다. innerHTML로 tbody 내용을 직접 조작할 때 문제될 수 있습니다.
    // 만약 myAttendanceTable이 <table> 요소라면, tableBody.querySelector('tbody').innerHTML = ''; 로 수정해야 합니다.
    // 또는 HTML에서 <tbody id="myAttendanceTableBody"></tbody> 와 같이 tbody에 직접 id를 부여하고 JS에서 해당 id로 접근하는 것이 가장 안전합니다.

    // 일단은 현재 코드 그대로 진행한다고 가정하고, 테이블 구조 문제 발생 시 이 부분을 고려하세요.
	tableBody.innerHTML = ''; // 기존 테이블 내용 비우기
	
	if (!data || data.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="5" style="text-align: center;">해당 월의 데이터가 없습니다.</td>
            </tr>
        `;
        return;
    }
	
    data.forEach(item => { // 이 forEach는 이제 올바른 배열에 대해 실행될 것입니다.
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

// ... goToPreviousMonth, goToNextMonth, displayTeamAttendance 함수는 그대로 유지
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
    const tableBody = document.getElementById('teamAttendanceTable'); // 팀 근태 테이블 ID 확인
    tableBody.innerHTML = ''; // 기존 테이블 내용 비우기

    if (!data || data.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="3" style="text-align: center;">해당 월의 데이터가 없습니다.</td>
            </tr>
        `;
        return;
    }
    let html = ''; // 팀 근태 테이블 컬럼 수에 맞게 조정 필요
    data.forEach(item => {
        html += `<tr><td>${item.EMP_ID || ''}</td><td>${item.ATT_IN_TIME || ''}</td><td>${item.ATT_OUT_TIME || ''}</td></tr>`;
    });
    tableBody.innerHTML = html; // appendChild 대신 innerHTML 사용
}