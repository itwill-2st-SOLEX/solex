
//전역 변수 설정
let currentPage = 0;
const pageSize = 20;
const gridHeight = 400;
let empId = null;

// ToastUI Grid 생성
const grid = new tui.Grid({
    el: document.getElementById('grid'),
    bodyHeight: gridHeight,
    scrollY: true,
    scrollX: false,
    data: [],
    columns: [
		{ header: '번호', name: 'rowNum', width: 100, align: 'center', sortable: true },
        { header: '연차유형', name: 'leaType', align: 'center', sortable: true },
        { header: '휴가시작일', name: 'leaStartDate', align: 'center',  sortable: true },
        { header: '휴가종료일', name: 'leaEndDate', align: 'center',  sortable: true },
        { header: '사용일수', name: 'leaUsedDay', align: 'center',  sortable: true },
        { header: '사유', name: 'leaCon', width: 500,  sortable: true }
    ],

});

// 페이지가 완전히 로딩 된 후에 자동으로 목록 보여짐
window.addEventListener('DOMContentLoaded', () => {
	vacationSummary();

});

//무한 스크롤 이벤트
function bindScrollEvent() {
	// 검색으로 화면 목록이 변경되었을 경우를 대비해서 스크롤 초기화
    grid.off('scrollEnd');
	
	//무한스크롤시 검색어 유지를 위해 재전달
    grid.on('scrollEnd', () => {
        //const keyword = document.getElementById('searchInput').value.trim();
        vacationDetail(currentPage);
    });
}

//페이지 로딩시 무한스크롤 기능이 동작하도록 이벤트 등록
bindScrollEvent();

//날짜 형식 함수
//날짜만 넣으면 년-월-일 형식, (날짜, true)하면 년-월-일 오전?오후 시:분 형식으로 출력
function dateFormatter(date, includeTime = false) {
	const d = new Date(date);
	
	//Intl.DateTimeFormat(...).formatToParts() : 날짜를 구성 요소별로 나눠서 배열 형태로 반환
	//DateTimeFormat이 날짜를 무조건 .으로 구분해서 저장하므로 배열에 '.'리터럴도 한칸씩 저장됨
	const parts = new Intl.DateTimeFormat('ko-KR', {
		year: 'numeric',
		month: '2-digit',
		day: '2-digit',
		hour: includeTime ? '2-digit' : undefined,
		minute: includeTime ? '2-digit' : undefined,
		hour12: true // 오전/오후 포함
	}).formatToParts(d);
	
	//저장된 parts 배열을 반복하면서 원하는 값만 가져올 수 있도록 함수를 정의함
	const get = type => parts.find(p => p.type === type)?.value;
	
	//get함수를 이용하여 각 년, 월, 일의 값만 배열에서 찾아와서 저장
	const year = get('year');
	const month = get('month');
	const day = get('day');
	
	let result = `${year}-${month}-${day}`;
	
	if (includeTime) {
		const dayPeriod = get('dayPeriod'); // '오전' or '오후'
		const hour = get('hour');
		const minute = get('minute');
		result += ` ${dayPeriod} ${hour}:${minute}`;
	}

	return result;
}


//휴가 요약 정보
async function vacationSummary() {
	try {
			let url = `/SOLEX/vacation/api/summary`;
			
	        const res = await fetch(url);  // 1. 서버에 요청 → 응답 도착까지 기다림
	        const data = await res.json();  // 2. 응답을 JSON으로 파싱 → 객체로 바꿈
			
			const start = data.PERIOD_START
			              ? dateFormatter(new Date(data.PERIOD_START))
			              : '-';
			const end   = data.PERIOD_END
			              ? dateFormatter(new Date(data.PERIOD_END))
			              : '-';
						  
			console.log(data)
			
			empId = data.EMP_ID;
			
			document.getElementById('empNm').textContent = data.EMP_NM || '-';
			document.getElementById('empHire').textContent = dateFormatter(new Date(data.EMP_HIRE))  || '-';
			document.getElementById('periodDay').textContent =`${start} ~ ${end}`;
			document.getElementById('daysLeft').textContent = data.DAYS_LEFT != null ? `(D-${data.DAYS_LEFT})` : '';
			document.getElementById('vacTotal').textContent = data.VAC_TOTAL || 0;
			document.getElementById('vacUsed').textContent = data.VAC_USED || 0;
			document.getElementById('vacRemain').textContent = data.VAC_REMAIN || 0;
			
			vacationDetail(currentPage);

	    } catch (e) {
	        console.error('fetch 에러 : ', e);
	    }
}

// 게시글 목록 불러오기
async function vacationDetail(page) {
    try {
		
		
		// 무한스크롤 페이지, 검색어 url로 전달
		let url = `/SOLEX/vacation/api/detail?page=${page}&size=${pageSize}`;
		
        const res = await fetch(url);  // 1. 서버에 요청 → 응답 도착까지 기다림
        const data = await res.json();  // 2. 응답을 JSON으로 파싱 → 객체로 바꿈

		const list = data.list;
		const vacationCount = data.vacationCount;
		
        const gridData = list.map((n, idx) => ({
			rowNum: vacationCount - (page * pageSize + idx), // 역순 번호 계산
			leaType: n.LEA_TYPE,
			vacTotal: n.VAC_TOTAL,
			vacUsed: n.VAC_USED,
			vacRemain: n.VAC_REMAIN,
            leaStartDate: dateFormatter(new Date(n.LEA_START_DATE))  || '-',
            leaEndDate: dateFormatter(new Date(n.LEA_END_DATE))  || '-',
            leaUsedDay: n.LEA_USED_DAY,
            leaCon: n.LEA_CON
        }));
		
		//첫 페이지면 초기화 후 새로 보여줌
		//내용이 있으면 아래에 행추가
        if (page === 0) grid.resetData(gridData);
        else grid.appendRows(gridData);
        
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
