// attendance.js

// 이 변수는 attendance.html에서 th:inline="javascript"를 통해 이미 초기화됩니다.
// let currentDate = new Date(); // 이 부분은 이제 제거하거나, 위에 선언된 currentDate를 사용하도록 합니다.

// HTML에서 넘겨준 initialYear, initialMonth를 사용하여 currentDate를 설정
// (attendance.html의 <script th:inline="javascript"> 블록에서 이미 수행됨)
// 예를 들어, attendance.js 파일 맨 위에 이 변수를 선언만 하고,
// HTML에서 초기값을 할당하면 됩니다.
// let currentDate; // 이렇게 선언만 하고, HTML에서 초기값을 할당하도록 합니다.
// (만약 attendance.js가 이전에 이미 currentDate를 var로 선언했다면 충돌 주의)

// ... (나머지 코드 동일)
//// HTML 요소 참조
const currentMonthYearSpan = document.getElementById('currentMonthYear');
const prevMonthBtn = document.getElementById('prevMonthBtn');
const nextMonthBtn = document.getElementById('nextMonthBtn');

//// 페이지 로드 시 초기 표시
updateMonthYearDisplay();


// updateMonthYearDisplay 함수가 호출될 때 currentDate를 기준으로 화면을 업데이트하고 서버로 데이터를 보냅니다.
function updateMonthYearDisplay() {

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth() + 1;
    currentMonthYearSpan.textContent = `${year}년 ${month}월`;

	
    // **여기서 바뀐 연도와 월을 서버로 보냅니다!**
    // empId는 로그인 정보를 통해 가져와야 하지만, 현재는 하드코딩
//    sendMonthYearToServer(year, month, 'EMP001');
    sendMonthYearToServer(year, month, 'EMP001');
}

// sendMonthYearToServer 함수에 empId 파라미터 추가
function sendMonthYearToServer(year, month) {
    const url = `/SOLEX/attendance/data?year=${year}&month=${month}`; // empId 추가
	console.log("생성된 URL:", url); // ★★★ 여기가 가장 중요합니다. URL이 올바른지 확인. ★★★

	
    fetch(url)
        .then(response => {
			
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
			console.log('data 들어옴?????????????');
            return response.json();
        })
        .then(data => {
            console.log('서버로부터 받은 데이터:', data);
            updateAttendanceTable(data);
        })
        .catch(error => {
            console.error('데이터 전송 또는 수신 중 오류 발생:', error);
            console.error('데이터 로드 중 오류가 발생했습니다.');
			console.log('서버로부터 받은 데이터:', data);
        });
}

//// 이전 달로 이동하는 함수
function goToPreviousMonth() {
    currentDate.setMonth(currentDate.getMonth() - 1); // 현재 월에서 1을 뺌
    updateMonthYearDisplay(); // 표시 업데이트
    // TODO: 여기에 실제 DB에서 해당 월의 데이터를 가져와서 테이블을 업데이트하는 로직 추가
    // 예: fetch(`/attendance/my_attend?year=${currentDate.getFullYear()}&month=${currentDate.getMonth() + 1}`)
    //     .then(response => response.json())
    //     .then(data => updateTable(data));
}

// JSON 데이터를 받아 HTML 테이블을 업데이트하는 함수
        function updateAttendanceTable(attendanceData) {
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

        // 페이지 로드 시 초기 데이터 불러오기 (선택 사항)
        document.addEventListener('DOMContentLoaded', () => {
            // 초기값을 설정한 input 필드에서 년/월을 가져와서 로드
            loadDataFromInputs();
        });

// 페이지 로드 시 초기 표시 (초기 데이터 로딩 포함)
// 이 함수는 HTML의 th:inline="javascript" 블록에서 currentDate가 초기화된 후에 호출되어야 합니다.
// document.addEventListener('DOMContentLoaded', updateMonthYearDisplay);
// 또는 attendance.html의 inline script 블록 마지막에서 호출.
// (예: `updateMonthYearDisplay();` 라고 inline script 블록 내에서 호출)

// 이벤트 리스너 연결
prevMonthBtn.addEventListener('click', goToPreviousMonth);
nextMonthBtn.addEventListener('click', goToNextMonth);






















/**
 * 
 */
// 현재 날짜를 관리할 Date 객체 생성 (페이지 로드 시점의 월/연도로 초기화)
//let currentDate = new Date(); // 현재 날짜 (예: 2025년 6월 1일)

//// HTML 요소 참조
//const currentMonthYearSpan = document.getElementById('currentMonthYear');
//const prevMonthBtn = document.getElementById('prevMonthBtn');
//const nextMonthBtn = document.getElementById('nextMonthBtn');
//
//// 현재 월/연도를 업데이트하여 표시하는 함수
//function updateMonthYearDisplay() {
//    const year = currentDate.getFullYear();
//    const month = currentDate.getMonth() + 1; // getMonth()는 0부터 시작하므로 +1
//    currentMonthYearSpan.textContent = `${year}년 ${month}월`;
//	// **여기서 바뀐 연도와 월을 서버로 보냅니다!**
//	sendMonthYearToServer(year, month); 
//}
//
//// 이전 달로 이동하는 함수
//function goToPreviousMonth() {
//    currentDate.setMonth(currentDate.getMonth() - 1); // 현재 월에서 1을 뺌
//    updateMonthYearDisplay(); // 표시 업데이트
//    // TODO: 여기에 실제 DB에서 해당 월의 데이터를 가져와서 테이블을 업데이트하는 로직 추가
//    // 예: fetch(`/attendance/my_attend?year=${currentDate.getFullYear()}&month=${currentDate.getMonth() + 1}`)
//    //     .then(response => response.json())
//    //     .then(data => updateTable(data));
//}
//










//// 다음 달로 이동하는 함수
function goToNextMonth() {
    currentDate.setMonth(currentDate.getMonth() + 1); // 현재 월에 1을 더함
    updateMonthYearDisplay(); // 표시 업데이트
    // TODO: 여기에 실제 DB에서 해당 월의 데이터를 가져와서 테이블을 업데이트하는 로직 추가
}
//
//// ** 서버로 연도와 월 데이터를 전송**
//function sendMonthYearToServer(year, month) {
//    // GET 요청 예시: URL 파라미터로 데이터 전송
////    const url = `/attendance/data?year=${year}&month=${month}`;
//    const url = `/attendance/my_attendance_list?year=${year}&month=${month}&empId='EMP001'`;
//
//    fetch(url)
//        .then(response => {
//            if (!response.ok) { // HTTP 상태 코드가 200번대가 아니면 에러 처리
//                throw new Error(`HTTP error! status: ${response.status}`);
//            }
//            return response.json(); // 서버에서 JSON 응답을 기대
//        })
//        .then(data => {
//            console.log('서버로부터 받은 데이터:', data);
//            // TODO: 서버에서 받은 데이터(예: 해당 월의 근태 기록)로 HTML 테이블을 업데이트하는 로직 추가
//            updateAttendanceTable(data); // 테이블 업데이트 함수 (새로 구현 필요)
//        })
//        .catch(error => {
//            console.error('데이터 전송 또는 수신 중 오류 발생:', error);
//            alert('데이터 로드 중 오류가 발생했습니다.');
//        });
//
//    // POST 요청 예시: JSON 데이터를 body에 담아 전송
//    /*
//    fetch('/attendance/updateMonth', {
//        method: 'POST',
//        headers: {
//            'Content-Type': 'application/json'
//        },
//        body: JSON.stringify({
//            year: year,
//            month: month
//        })
//    })
//    .then(response => response.json())
//    .then(data => {
//        console.log('서버 응답:', data);
//        updateAttendanceTable(data);
//    })
//    .catch(error => {
//        console.error('오류:', error);
//    });
//    */
//}
//// TODO: 서버에서 받은 데이터로 근태 테이블을 업데이트하는 함수
//function updateAttendanceTable(attendanceData) {
//    const tbody = document.querySelector('.table-bordered tbody');
//    if (!tbody) {
//        console.error("테이블 바디를 찾을 수 없습니다.");
//        return;
//    }
//    tbody.innerHTML = ''; // 기존 내용 지우기
//
//    if (attendanceData && attendanceData.length > 0) {
//        attendanceData.forEach(item => {
//            const row = document.createElement('tr');
//            row.innerHTML = `
//                <td>${item.EMP_ID}</td>
//                <td>${item.ATT_IN_TIME || ''}</td> <td>${item.ATT_OUT_TIME || ''}</td>
//                <td>${item.ATT_STS || ''}</td>
//                <td>${item.ATT_DAY || ''}</td>
//            `;
//            tbody.appendChild(row);
//        });
//    } else {
//        const row = document.createElement('tr');
//        row.innerHTML = `<td colspan="5" style="text-align: center;">해당 월의 데이터가 없습니다.</td>`;
//        tbody.appendChild(row);
//    }
//}
//
//// 이벤트 리스너 연결
//prevMonthBtn.addEventListener('click', goToPreviousMonth);
//nextMonthBtn.addEventListener('click', goToNextMonth);
//
//// 페이지 로드 시 초기 표시
//updateMonthYearDisplay();
//
//// 초기 날짜를 2025년 5월로 설정하려면, updateMonthYearDisplay() 호출 전에 이 코드를 추가하세요.
//// currentDate.setFullYear(2025);
//// currentDate.setMonth(4); // 5월은 인덱스 4입니다.
//// updateMonthYearDisplay(); // 설정된 날짜로 초기 표시
//
//document.addEventListener('DOMContentLoaded', function() {
//    // 현재 날짜로 currentMonthYearSpan을 업데이트
//    updateMonthYearDisplay(); // 이 안에서 sendMonthYearToServer 호출
//    // 또는:
//    // const year = currentDate.getFullYear();
//    // const month = currentDate.getMonth() + 1;
//    // sendMonthYearToServer(year, month);
//});