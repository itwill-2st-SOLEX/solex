
//전역 변수 설정
let currentPage = 0;
const pageSize = 20;
const gridHeight = 600;
let editorInstance = null;
let editorLoaded = false;
let searchKeyword = '';
let empId = null;


// ToastUI Grid 생성
const grid = new tui.Grid({
    el: document.getElementById('grid'),
    bodyHeight: gridHeight,
    scrollY: true,
    scrollX: false,
    data: [],
    columns: [
		{ header: '부서', name: 'empDepNm', align: 'center', filter: 'select',  sortable: true },
		{ header: '팀', name: 'empTeamNm', align: 'center', filter: 'select',  sortable: true },
        { header: '사번', name: 'empNum', align: 'center',sortable: true },
        { header: '이름', name: 'empNm', align: 'center', sortable: true },
		{ header: '직급', name: 'empPosNm', align: 'center',  sortable: true },
		{ header: '입사일', name: 'empHire', align: 'center',  sortable: true },
		{ header: '총 휴가일수', name: 'vacTotal', align: 'center',  sortable: true },
		{ header: '사용 휴가일수', name: 'vacUsed', align: 'center',  sortable: true },
		{ header: '잔여 휴가일수', name: 'vacRemain', align: 'center',  sortable: true },
		{ header: '휴가소멸일', name: 'periodEnd', align: 'center',  sortable: true },

    ],

});

// 페이지가 완전히 로딩 된 후에 자동으로 목록 보여짐
window.addEventListener('DOMContentLoaded', () => {
	
	searchKeyword = document.getElementById('searchInput').value.trim();
	vacationList(currentPage);
	document.getElementById('searchBtn').addEventListener('click', searchVacation);
	
});

//무한 스크롤 이벤트
function bindScrollEvent() {
	// 검색으로 화면 목록이 변경되었을 경우를 대비해서 스크롤 초기화
    grid.off('scrollEnd');
	
	//무한스크롤시 검색어 유지를 위해 재전달
    grid.on('scrollEnd', () => {
        const keyword = document.getElementById('searchInput').value.trim();
        vacationList(currentPage, keyword);
    });
}

//페이지 로딩시 무한스크롤 기능이 동작하도록 이벤트 등록
bindScrollEvent();

//날짜 형식 함수
const formatter = new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
});

// 게시글 목록 불러오기
async function vacationList(page, keyword = '') {
    try {
		
		// 무한스크롤 페이지, 검색어 url로 전달
		let url = `/SOLEX/vacation/api/list?page=${page}&size=${pageSize}`;
		
        if (keyword) {
            url += `&keyword=${encodeURIComponent(keyword)}`;
        }
		
        const res = await fetch(url);  // 1. 서버에 요청 → 응답 도착까지 기다림
        const data = await res.json();  // 2. 응답을 JSON으로 파싱 → 객체로 바꿈
		
		const list = data.list;
		const totalCount = data.totalCount;
		
		console.log(data)
		
        const gridData = list.map((n) => ({
			empId: n.EMP_ID,
			empNum: n.EMP_NUM,
			empNm: n.EMP_NM,
			empHire: formatter.format(new Date(n.EMP_HIRE))  || '-',
			vacTotal: n.VAC_TOTAL,
            vacUsed: n.VAC_USED,
            vacRemain: n.VAC_REMAIN,
			empCatNm: n.EMP_CAT_NM,
			empDepNm: n.EMP_DEP_NM,
			empTeamNm: n.EMP_TEAM_NM,
			empPosNm: n.EMP_POS_NM,
			//periodEnd: formatPeriodEnd(n.PERIOD_END, n.DAYS_LEFT),  // 디데이 함께 표시
			periodEnd: formatter.format(new Date(n.PERIOD_END)),
			//DaysLeft: formatter.format(new Date(n.DAYS_LEFT))
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

// 검색기능
function searchVacation() {
	const keyword = document.getElementById('searchInput').value.trim();
	    currentPage = 0;
		
		bindScrollEvent();		//무한스크롤 초기화 후 실행
	    vacationList(currentPage, keyword);
}

function formatPeriodEnd(dateString, daysLeft) {
    if (!dateString) return '-';

    const formattedDate = formatter.format(new Date(dateString));
    
    if (daysLeft != null) {
        return `${formattedDate} (D-${daysLeft})`;
    } else {
        return formattedDate;
    }
}
