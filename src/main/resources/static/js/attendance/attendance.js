//전역 변수 설정
let currentPage = 0;
const pageSize = 20;
const gridHeight = 600;
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


// 페이지 로드가 완료된 후에 flatpickr를 초기화하도록 변경
document.addEventListener('DOMContentLoaded', function() {
    const myDatePickerElement = document.getElementById('my-datepicker');
    if (myDatePickerElement) { // my-datepicker 요소가 존재할 때만 flatpickr 초기화
        const myDatePicker = flatpickr(myDatePickerElement, {
            enableTime: true,        // 시간 선택 활성화
            dateFormat: "Y-m-d H:i:S", // 날짜 및 시간 포맷 (예: 2025-06-12 12:34)
            time_24hr: true,         // 24시간 형식 사용
            locale: "ko"             // 한국어 로케일 적용
        });
    } else {
        console.warn("Element with ID 'my-datepicker' not found. Flatpickr will not be initialized for it.");
    }
});
// FlatpickrDateEditor.js (혹은 <script> 태그 안에 정의)
class FlatpickrDateEditor {
    constructor(props) {
        const el = document.createElement('input');
        el.type = 'text';
        el.value = props.value || '';
        el.style.width = '100%';

        this.el = el;
        this.flatpickrInstance = flatpickr(el, {
            enableTime: true,
            dateFormat: "Y-m-d H:i:S",
        });
    }
    getElement() {return this.el;}
    getValue() {return this.el.value;}
    mounted() {this.el.focus();}
    destroy() {
        if (this.flatpickrInstance) {
            this.flatpickrInstance.destroy();
        }
    }
}

// 총 근무시간
function calculateFormattedWorkTime(attInTimeStr, attOutTimeStr) {
    function parseKoreanDateTime(dateTimeStr) {
        if (!dateTimeStr) {
            return null;
        }

        const match = dateTimeStr.match(/(\d{4}-\d{2}-\d{2})\s+(\d{1,2}):(\d{2})\s+(오전|오후)/);

        if (!match) {
            console.warn(`parseKoreanDateTime: 유효하지 않은 날짜/시간 형식: ${dateTimeStr}`);
            return null;
        }

        const datePart = match[1]; 
        let hour = parseInt(match[2], 10); 
        const minute = parseInt(match[3], 10);
        const ampm = match[4]; 

        // "오전/오후"를 24시간 형식으로 변환
        if (ampm === "오후" && hour !== 12) {
            hour += 12;
        } else if (ampm === "오전" && hour === 12) {
            hour = 0; 
        }

        // Date 객체가 파싱할 수 있는 ISO 8601 또는 유사한 형식으로 변환
        // "YYYY-MM-DDTHH:MM:00"
        const formattedDateTime = `${datePart}T${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:00`;
        const date = new Date(formattedDateTime);

        // Date 객체가 유효한지 확인
        if (isNaN(date.getTime())) {
            console.error(`parseKoreanDateTime: Date 객체 생성 실패 - ${formattedDateTime}`);
            return null;
        }
        return date;
    }

    const inTime = parseKoreanDateTime(attInTimeStr);
    const outTime = parseKoreanDateTime(attOutTimeStr);

    if (!inTime) {
        // 출근 시간이 없으면 '정보 없음' 또는 다른 처리
        return "출근 시간 정보 없음";
    }

    if (!outTime) {
        // 퇴근 시간이 없으면 '근무 중' 또는 출근 시간만 표시
        return `출근: ${attInTimeStr} (퇴근 미입력)`;
    }

    // 두 시간 모두 유효한 경우에만 시간 계산
    if (inTime && outTime) {
        const diffMs = outTime.getTime() - inTime.getTime(); // 밀리초 단위 차이

        if (diffMs < 0) {
            // 퇴근 시간이 출근 시간보다 빠른 경우 (오류 또는 자정을 넘긴 경우)
            console.warn(`calculateFormattedWorkTime: 퇴근 시간이 출근 시간보다 빠릅니다. 출근: ${attInTimeStr}, 퇴근: ${attOutTimeStr}`);
            // 특정 규칙에 따라 처리 (예: 다음 날로 간주하거나 오류로 처리)
            // 여기서는 간단히 "시간 오류"로 반환
            return "시간 계산 오류 (퇴근 < 출근)";
        }

        const diffMinutes = Math.floor(diffMs / (1000 * 60));
        const hours = Math.floor(diffMinutes / 60);
        const minutes = diffMinutes % 60;

        return `${hours}시간 ${minutes}분`;
    } else {
        // 둘 중 하나라도 유효하지 않은 경우
        console.error("calculateFormattedWorkTime: 유효하지 않은 날짜/시간 형식이 입력되었습니다.", { attInTimeStr, attOutTimeStr });
        return "시간 정보 부족 또는 형식 오류";
    }
}



let currentPath = window.location.pathname; 
if (currentPath.includes('/my_attendance_list')) {
    mode = 'my';
} else if (currentPath.includes('/attendance_list')) {
    mode = 'team';
}
	
// mode에 따라 각 다른 정보 출력
let columnsConfig = [
    {
        header: '출근 시간',
        name: 'att_in_time',
        align: 'center',
        sortable: true
    },
    {
        header: '퇴근 시간',
        name: 'att_out_time',
        align: 'center',
        sortable: true
    },
	{
        header: '상태',
        name: 'det_nm',
        align: 'center',
        sortable: true,
        // '상태' 컬럼에 필터 추가
        filter: {
            type: 'text', // 텍스트 필터를 사용합니다.
            showApplyBtn: true, // 필터 적용 버튼을 보여줍니다.
            showClearBtn: true // 필터 초기화 버튼을 보여줍니다.
        }
    },
    { header: '총 근무시간', name: 'total',  align: 'center', sortable: true },
    { header: '날짜', name: 'att_day',  align: 'center', sortable: true},
    { name: 'att_id', hidden: true }
];

// 'mode' 파라미터가 'team'인 경우 특정 컬럼을 맨 앞에 추가
if (mode === 'team') {
    const teamSpecificColumns = [
		{
	        header: '사원 이름',
	        name: 'emp_nm',
	        align: 'center',
			width: 100,
	        sortable: true,
			align: 'center',
	        // '상태' 컬럼에 필터 추가
	        filter: {
	            type: 'text', // 텍스트 필터를 사용합니다.
	            showApplyBtn: true, // 필터 적용 버튼을 보여줍니다.
	            showClearBtn: true // 필터 초기화 버튼을 보여줍니다.
	        }
	    },
		{
	        header: '사원 부서',
	        name: 'emp_dep_nm',
	        align: 'center',
			width: 100,
	        sortable: true,
			align: 'center',
	        // '상태' 컬럼에 필터 추가
	        filter: {
	            type: 'text', // 텍스트 필터를 사용합니다.
	            showApplyBtn: true, // 필터 적용 버튼을 보여줍니다.
	            showClearBtn: true // 필터 초기화 버튼을 보여줍니다.
	        }
	    },
		{
	        header: '사원 직위',
	        name: 'emp_pos_nm',
	        align: 'center',
			width: 100,
	        sortable: true,
			align: 'center',
	        // '상태' 컬럼에 필터 추가
	        filter: {
	            type: 'text', // 텍스트 필터를 사용합니다.
	            showApplyBtn: true, // 필터 적용 버튼을 보여줍니다.
	            showClearBtn: true // 필터 초기화 버튼을 보여줍니다.
	        }
	    }
    ];
    // teamSpecificColumns를 기존 columnsConfig의 맨 앞에 추가
    columnsConfig = [...teamSpecificColumns, ...columnsConfig];

    // 출퇴근 시간의 편집 가능 여부 변경 
    const inTimeColumn = columnsConfig.find(col => col.name === 'att_in_time');
    if (inTimeColumn) {
        inTimeColumn.editor = FlatpickrDateEditor; // 또는 다른 적절한 에디터
    }
    const outTimeColumn = columnsConfig.find(col => col.name === 'att_out_time');
    if (outTimeColumn) {
        outTimeColumn.editor = FlatpickrDateEditor; // 또는 다른 적절한 에디터
    }
	
}

const grid = new tui.Grid({
    el: document.getElementById('grid'),
    bodyHeight: gridHeight,
    scrollY: true,
    scrollX: false,
    data: [],
    columns: columnsConfig, // 동적으로 생성된 컬럼 설정 사용
	columnOptions: {
        resizable: true, // 모든 컬럼의 너비를 드래그로 조절 가능하게 설정
        minWidth: 50 // (선택 사항) 최소 너비 설정
    }
});

// JavaScript에서 초기화
//const myDatePicker = flatpickr("#my-datepicker", {
//    // 옵션 객체
//    enableTime: true,        // 시간 선택 활성화
//    dateFormat: "Y-m-d H:i:S", // 날짜 및 시간 포맷 (예: 2025-06-12 12:34)
//    time_24hr: true,         // 24시간 형식 사용
//    locale: "ko"             // 한국어 로케일 적용 (위에서 ko.js 로드 필요)
//});


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
	
    let currentPath = window.location.pathname; 
    
    if (currentPath.includes('/my_attendance_list')) {
        requestType = 'my';
    } else if (currentPath.includes('/attendance_list')) {
        requestType = 'team';
    } else {
        requestType = 'default';
    }

    attendanceLists(displayYear, displayMonth, requestType, '', currentPage); 
}


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
	
	gridData = data.map((at, idx) => ({
		emp_nm: at.EMP_NM,
	    emp_dep_nm: at.EMP_DEP_NM,
	    emp_pos_nm: at.EMP_POS_NM,
	    att_in_time: at.ATT_IN_TIME,
	    att_out_time: at.ATT_OUT_TIME,
	    det_nm: at.DET_NM,
		total: calculateFormattedWorkTime(at.ATT_IN_TIME, at.ATT_OUT_TIME),
	    att_day: at.ATT_DAY,
		att_id: at.ATT_ID
		
	}));
	
	grid.appendRows(gridData);
}


function displayTeamAttendance(data) {
	if (!data || !Array.isArray(data) || data.length === 0) {
        console.warn("표시할 팀 출퇴근 데이터가 없습니다.");
        grid.setRows([]); // 빈 배열을 설정하여 기존 데이터를 모두 지우고 emptyMessage를 표시
        return; 
    }
	
	gridData = data.map((at, idx) => ({
		emp_nm: at.EMP_NM,
	    emp_dep_nm: at.EMP_DEP_NM,
	    emp_pos_nm: at.EMP_POS_NM,
	    att_in_time: at.ATT_IN_TIME,
	    att_out_time: at.ATT_OUT_TIME,
	    det_nm: at.DET_NM,
		total: calculateFormattedWorkTime(at.ATT_IN_TIME, at.ATT_OUT_TIME),
	    att_day: at.ATT_DAY,
		att_id: at.ATT_ID
		
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





// toastUI의 afterChange 이벤트 리스너 (셀 편집 후 자동 저장 로직)
grid.on('afterChange', ev => {
    const changedRows = ev.changes;

    if (changedRows.length > 0) {
        // 모든 변경된 셀을 순회하며 처리
    	changedRows.forEach(change => {
            const rowKey = change.rowKey;
            const columnName = change.columnName;
            const newValue = change.value;
            const prevValue = change.prevValue; // 이전 값 (필요시 사용)

            // 변경이 실제로 발생했는지 확인 (값은 같지만 타입이 다를 수 있으므로)
            if (newValue === prevValue) {
                return; // 변경된 값이 이전 값과 동일하면 아무것도 하지 않음
            }

            // 해당 rowKey의 전체 데이터 조회
            const rowData = grid.getRow(rowKey);
			
            if (!rowData || !rowData.att_id) {
                console.error(`행 데이터 또는 att_id를 찾을 수 없습니다. RowKey: ${rowKey}`);
                return;
            }

            // TODO: 여기서 AJAX 요청을 통해 백엔드로 데이터를 업데이트
            // 백엔드로 보낼 데이터 구성: att_id와 변경된 컬럼 값만 전송함.
            const updateData = {
                ATT_ID: rowData.att_id, // 고유 식별자
                [columnName]: newValue   // 변경된 컬럼의 이름과 새로운 값
            };
            // 만약 'det_nm' 컬럼이 특정 ID로 매핑되어야 한다면 추가 로직 필요
            // 예: if (columnName === 'det_nm') { updateData.DET_ID = getDetIdByDetNm(newValue); }

            $.ajax({
                url: '/SOLEX/attendance/api/updateGridCell', // 적절한 백엔드 API 엔드포인트
                method: 'POST', // 또는 PUT (데이터 업데이트는 PUT이 RESTful 하지만 POST도 가능)
                contentType: 'application/json; charset=utf-8',
                data: JSON.stringify(updateData),
                success: function(response) {
//                    if (response.status === 'success') {
//                        console.log('서버 업데이트 성공:', response);
//                        // 사용자에게 성공 메시지 표시 (옵션)
//                        // Toast 또는 alert('업데이트 성공!');
//                    } else {
//                        console.error('서버 업데이트 실패 (응답 오류):', response.message);
//                        alert('데이터 업데이트에 실패했습니다: ' + response.message);
//                        // 실패 시 Grid의 셀 값을 이전 값으로 되돌리기
//                        grid.setValue(rowKey, columnName, prevValue, false);
//                    }
                },
                error: function(xhr, status, error) {
//                    console.error('서버 업데이트 실패 (AJAX 오류):', error, xhr.responseText);
////                    alert('데이터 업데이트 중 네트워크 오류가 발생했습니다.');
//                    // 실패 시 Grid의 셀 값을 이전 값으로 되돌리기
//                    grid.setValue(rowKey, columnName, prevValue, false);
                }
            });
        });
    }
});