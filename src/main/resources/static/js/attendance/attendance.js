/**
 * 
 */
// 현재 날짜를 관리할 Date 객체 생성 (페이지 로드 시점의 월/연도로 초기화)
let currentDate = new Date(); // 현재 날짜 (예: 2025년 6월 1일)

// HTML 요소 참조
const currentMonthYearSpan = document.getElementById('currentMonthYear');
const prevMonthBtn = document.getElementById('prevMonthBtn');
const nextMonthBtn = document.getElementById('nextMonthBtn');

// 현재 월/연도를 업데이트하여 표시하는 함수
function updateMonthYearDisplay() {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth() + 1; // getMonth()는 0부터 시작하므로 +1
    currentMonthYearSpan.textContent = `${year}년 ${month}월`;
}

// 이전 달로 이동하는 함수
function goToPreviousMonth() {
    currentDate.setMonth(currentDate.getMonth() - 1); // 현재 월에서 1을 뺌
    updateMonthYearDisplay(); // 표시 업데이트
    // TODO: 여기에 실제 DB에서 해당 월의 데이터를 가져와서 테이블을 업데이트하는 로직 추가
    // 예: fetch(`/attendance/my_attend?year=${currentDate.getFullYear()}&month=${currentDate.getMonth() + 1}`)
    //     .then(response => response.json())
    //     .then(data => updateTable(data));
}

// 다음 달로 이동하는 함수
function goToNextMonth() {
    currentDate.setMonth(currentDate.getMonth() + 1); // 현재 월에 1을 더함
    updateMonthYearDisplay(); // 표시 업데이트
    // TODO: 여기에 실제 DB에서 해당 월의 데이터를 가져와서 테이블을 업데이트하는 로직 추가
}

// 이벤트 리스너 연결
prevMonthBtn.addEventListener('click', goToPreviousMonth);
nextMonthBtn.addEventListener('click', goToNextMonth);

// 페이지 로드 시 초기 표시
updateMonthYearDisplay();

// 초기 날짜를 2025년 5월로 설정하려면, updateMonthYearDisplay() 호출 전에 이 코드를 추가하세요.
// currentDate.setFullYear(2025);
// currentDate.setMonth(4); // 5월은 인덱스 4입니다.
// updateMonthYearDisplay(); // 설정된 날짜로 초기 표시