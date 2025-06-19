
//전역 변수 설정
let currentPage = 0;
const pageSize = 20;
const gridHeight = 250;
let empId = null;

// ToastUI Grid 생성
const grid = new tui.Grid({
    el: document.getElementById('grid'),
    bodyHeight: gridHeight,
	rowHeaders: ['rowNum'],
    scrollY: true,
    scrollX: false,
    data: [],

    columns: [
		{ header: '실적등록ID', name: 'wrkId', align: 'center' },
		{ header: '작업수량', name: 'prdCd', align: 'center', filter: 'select' },
		{ header: '불량수량', name: 'prdNm', align: 'center', filter: 'select'},
		{ header: '작업일', name: 'prdColor', align: 'center', filter: 'select' },
		{ header: '보고시간', name: 'prdSize', align: 'center', filter: 'select'}
    ],
	

});

// 페이지가 완전히 로딩 된 후에 자동으로 목록 보여짐
window.addEventListener('DOMContentLoaded', () => {
	managerSummary();

});

//무한 스크롤 이벤트
function bindScrollEvent() {
	// 검색으로 화면 목록이 변경되었을 경우를 대비해서 스크롤 초기화
    grid.off('scrollEnd');
	
	//무한스크롤시 검색어 유지를 위해 재전달
    grid.on('scrollEnd', () => {
        //const keyword = document.getElementById('searchInput').value.trim();
        managerDetail(currentPage);
    });
}

//페이지 로딩시 무한스크롤 기능이 동작하도록 이벤트 등록
bindScrollEvent();

//날짜 형식 함수
//날짜만 넣으면 년-월-일 형식, (날짜, true)하면 년-월-일 오전?오후 시:분 형식으로 출력
function formatter(date, includeTime = false) {
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


//공정 요약 정보
async function managerSummary() {
	try {
			let url = `/SOLEX/operator/api/managerSummary`;
			
	        const res = await fetch(url);  // 1. 서버에 요청 → 응답 도착까지 기다림
	        const data = await res.json();  // 2. 응답을 JSON으로 파싱 → 객체로 바꿈
			
			console.log(data)
			
			empId = data.EMP_ID;
			
			document.getElementById('prcCode').textContent = data.PRC_CD || '-';
			document.getElementById('prcName').textContent = data.PRC_NM  || '-';
			document.getElementById('empName').textContent = data.DEP_NM || '-';
			document.getElementById('prcTest').textContent = data.QUA_NM || '-';
		
			managerList(currentPage);

	    } catch (e) {
	        console.error('fetch 에러 : ', e);
	    }
}

// 게시글 목록 불러오기
async function managerList(page) {
    try {
		
		
		// 무한스크롤 페이지, 검색어 url로 전달
		let url = `/SOLEX/operator/api/managerList?page=${page}&size=${pageSize}&empId=${empId}`;
		
        const res = await fetch(url);  // 1. 서버에 요청 → 응답 도착까지 기다림
        const data = await res.json();  // 2. 응답을 JSON으로 파싱 → 객체로 바꿈

		const list = data.list;
		const managerCount = data.managerCount;
		
        const gridData = list.map((n, idx) => ({
/*			rowNum: wpCount - (page * pageSize + idx), // 역순 번호 계산
*/			wrkId: n.WRK_ID,
			prdCd: n.PRD_CD,
			prdNm: n.PRD_NM,
			prdColor: n.PRD_COLOR,
            prdSize: n.PRD_SIZE,
            prdHeight: n.PRD_HEIGHT,
            wpoOcount: n.WPO_OCOUNT,
            wpoJcount: n.WPO_JCOUNT,
			wpoBcount: n.WPO_BCOUNT,
			oddPer: n.ODD_PER,
			oddStatus: n.ODD_STATUS,
			ordEndDate: formatter(new Date(n.ORD_END_DATE))  || '-'
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
