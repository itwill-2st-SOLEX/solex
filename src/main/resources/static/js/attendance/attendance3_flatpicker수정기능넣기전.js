//전역 변수 설정
let currentPage = 0;
const pageSize = 20;
const gridHeight = 700;
let editorInstance = null;
let editorLoaded = false;
let searchKeyword = '';
let empId = null;

const currentMonthYearSpan = document.getElementById('currentMonthYear');
const prevMonthBtn = document.getElementById('prevMonthBtn');
const nextMonthBtn = document.getElementById('nextMonthBtn');
let requestType = '';

// 페이지 로드 시 초기 표시
updateMonthYearDisplay(); 

// ToastUI Grid 생성
const grid = new tui.Grid({
    el: document.getElementById('grid'),
    bodyHeight: gridHeight,
    scrollY: true,
    scrollX: false,
    data: [],
    columns: [
		{ header: '사원 ID', name: 'emp_num', width: 100, sortable: true },
        { header: '사원 직위', name: 'dep_position', sortable: true },
        { 
			header: '출근 시간',
			name: 'att_in_time',
			width: 200, align: 'center',
			sortable: true ,
			editor: class {
				constructor(props) {
					const el = document.createElement('input');
					el.type = 'text';
					el.value = props.value || '';
					el.style.width = '100%'
					
					this.el = el;
					this.flatpickrInstance = flatpickr(el, {
						enableTime : true,
						dateFormat : "Y-m-d H:i"
					});
				}
				
				getElement() {
					return this.el;
				}
				
				getValue() {
					return this.el.value;
				}
				
				mounted() {
					this.el.focus();
				}
				
				destroy() {
					this.flatpickrInstance.destroy();
				}
			}
		},
        { header: '퇴근 시간', name: 'att_out_time', width: 200, align: 'center',  sortable: true },
        { header: '상태', name: 'det_nm', align: 'center',  sortable: true, editor: 'text' },
        { header: '날짜', name: 'att_day', width: 200, align: 'center',  sortable: true }
    ]
});
// JavaScript에서 초기화
const myDatePicker = flatpickr("#my-datepicker", {
    // 옵션 객체
    enableTime: true,        // 시간 선택 활성화
    dateFormat: "Y-m-d H:i", // 날짜 및 시간 포맷 (예: 2025-06-12 12:34)
    time_24hr: true,         // 24시간 형식 사용
    locale: "ko"             // 한국어 로케일 적용 (위에서 ko.js 로드 필요)
});
// 페이지가 완전히 로딩 된 후에 자동으로 목록 보여짐
window.addEventListener('DOMContentLoaded', () => {
	searchKeyword = document.getElementById('searchInput').value.trim();
	document.getElementById('searchBtn').addEventListener('click', searchAttendance);
});


//무한 스크롤 이벤트
function bindScrollEvent() {
	// 검색으로 화면 목록이 변경되었을 경우를 대비해서 스크롤 초기화
    grid.off('scrollEnd');
	
	//무한스크롤시 검색어 유지를 위해 재전달
    grid.on('scrollEnd', () => {
        const keyword = document.getElementById('searchInput').value.trim();
    });
}


//페이지 로딩시 무한스크롤 기능이 동작하도록 이벤트 등록
bindScrollEvent();


// updateMonthYearDisplay 함수가 호출될 때 currentDate를 기준으로 화면을 업데이트하고 서버로 데이터 전송
function updateMonthYearDisplay() {
    const displayYear = currentDate.getFullYear();
    const displayMonth = currentDate.getMonth() + 1;
    currentMonthYearSpan.textContent = `${displayYear}년 ${displayMonth}월`; 
	
    // requestType을 결정하여 sendMonthYearToServer로 전달
//    let requestType = '';
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

    // updateMonthYearDisplay 내부의 최신 year, month를 전달
    attendanceLists(displayYear, displayMonth, requestType, '', currentPage); 
}


// 부하직원 현황 불러오기
async function attendanceLists(year, month, requestType, keyword = '', page) {
	try {
		let url = `/SOLEX/attendance/api/data?year=${year}&month=${month}&resultType=${requestType}&page=${page}&size=${pageSize}`;

	    if (keyword) {
	        url += `&keyword=${encodeURIComponent(keyword)}`;
	    }
	    const res = await fetch(url);  // 1. 서버에 요청 → 응답 도착까지 기다림
	    const data = await res.json();  // 2. 응답을 JSON으로 파싱 → 객체로 바꿈
	
		const attendanceArray = Array.isArray(data.teamAttendance) ? data.teamAttendance : [];
		const totalCount = data.totalCount;
		
		if (requestType === 'my' && data.myAttendance && Array.isArray(data.myAttendance)) {
			console.log('my');
			displayMyAttendance(data.myAttendance);
		} else if (requestType === 'team' && data.teamAttendance && Array.isArray(data.teamAttendance)) {
			console.log('team');
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
		
	    currentPage++;
		
		// 무한스크롤 종료
	    if (data.length < pageSize) {
	        grid.off('scrollEnd');
	    } else {
			bindScrollEvent();
		}
	
	} catch (e) {
	    console.error('fetch 에러 : ', e);
	}
}


function displayMyAttendance(data) {
	if (!data || !Array.isArray(data) || data.length === 0) {
        console.warn("표시할 내 출퇴근 데이터가 없습니다.");
        grid.setRows([]); // 빈 배열을 설정하여 기존 데이터를 모두 지우고 emptyMessage를 표시
        return; 
    }
	console.log('내 출퇴근근황의 data' + JSON.stringify(data));
	
	gridData = data.map((at, idx) => ({
		emp_num: at.EMP_NUM,
	    dep_position: at.DEP_POSITION,
	    att_in_time: at.ATT_IN_TIME,
	    att_out_time: at.ATT_OUT_TIME,
	    det_nm: at.DET_NM,
	    att_day: at.ATT_DAY
	}));
	console.log('내 출퇴근근황의 gridData' + JSON.stringify(gridData));
	
	grid.appendRows(gridData);
}


function displayTeamAttendance(data) {
	if (!data || !Array.isArray(data) || data.length === 0) {
        console.warn("표시할 팀 출퇴근 데이터가 없습니다.");
        grid.setRows([]); // 빈 배열을 설정하여 기존 데이터를 모두 지우고 emptyMessage를 표시
        return; 
    }
	
	gridData = data.map((at, idx) => ({
		emp_num: at.EMP_NUM,
	    dep_position: at.DEP_POSITION,
	    att_in_time: at.ATT_IN_TIME,
	    att_out_time: at.ATT_OUT_TIME,
	    att_sts: at.ATT_STS,
	    att_day: at.ATT_DAY
	}));
	
	grid.appendRows(gridData);
}

// 이전 달로 이동하는 함수
function goToPreviousMonth() {
	
    currentDate.setMonth(currentDate.getMonth() - 1); 

	// 기존 데이터 초기화 
	grid.resetData([]); 
    
	// 년/월 업데이트
	updateMonthYearDisplay(); 
}

// 다음 달로 이동하는 함수
function goToNextMonth() {
    currentDate.setMonth(currentDate.getMonth() + 1);
	
	// 기존 데이터 초기화 
	grid.resetData([]); 
	   
	// 년/월 업데이트
	updateMonthYearDisplay(); 
}

// 이벤트 리스너 연결 (이 부분은 올바릅니다.)
prevMonthBtn.addEventListener('click', goToPreviousMonth);
nextMonthBtn.addEventListener('click', goToNextMonth);


// 검색기능
function searchAttendance() {
	grid.resetData([]); 
	const keyword = document.getElementById('searchInput').value.trim();
	currentPage = 0;
		
	bindScrollEvent();		//무한스크롤 초기화 후 실행
	attendanceLists(currentDate.getFullYear(), currentDate.getMonth() + 1, requestType, keyword);
//	noticeList(currentPage, keyword);
}