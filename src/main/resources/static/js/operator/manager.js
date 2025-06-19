
//전역 변수 설정
let currentPage = 0;
const pageSize = 20;
const gridHeight = 390;
let empId = null;

// ToastUI Grid 생성
const grid = new tui.Grid({
    el: document.getElementById('grid'),
    bodyHeight: gridHeight,
	rowHeaders: ['rowNum'],
    scrollY: true,
    scrollX: false,
    data: [],
	header: {
	        height: 80,
	        complexColumns: [
				{
	                header: '옵션',
	                name: 'optionGroup',
	                childNames: ['prdColor', 'prdSize', 'prdHeight']
	            }
	        ]
	      },
    columns: [
		{ header: '작업지시번호', name: 'wrkId', align: 'center' },
		{ header: '제품코드', name: 'prdCd', align: 'center', filter: 'select' },
		{ header: '제품명', name: 'prdNm', align: 'center', filter: 'select', width: 170},
		
		{ header: '컬러', name: 'prdColor', align: 'center', filter: 'select' , width: 70},
		{ header: '사이즈', name: 'prdSize', align: 'center', filter: 'select' , width: 70},
		{ header: '굽높이', name: 'prdHeight', align: 'center', filter: 'select' , width: 70},
		
		{ header: '작업지시수량', name: 'wpoOcount', align: 'center', filter: 'select', width: 110 },
		{ header: '작업완료수량', name: 'wpoJcount', align: 'center', filter: 'select', width: 110},
		{ header: '불량수량', name: 'wpoBcount', align: 'center', filter: 'select' },
		{ header: '작업진행률', name: 'oddPer', align: 'center', filter: 'select' },
		{ header: '납품예정일', name: 'ordEndDate', align: 'center', sortable: 'true' },
		{ header: '진행상태', name: 'wpoStatus', align: 'center', filter: 'select' },
/*		{
		  header: '작업지시',
		  name: 'wpoBtn',
		  align: 'center',
		  renderer: {
		    type: 'html', // HTML 렌더링 타입 지정
		    options: {
		      escapeHtml: false // HTML escape 하지 않도록 설정
		    }
		  }
		}*/
		{ header: '작업지시', name: 'wpoBtn', align: 'center', sortable: 'true'},
		/*{
		      header: '작업지시',
		      name: 'wrkAction',
		      align: 'center',
		      formatter: (cellValue, rowData) => {
				console.log(rowData)
		        const status = rowData.oddStatus;  // 작업상태 컬럼명에 맞게 수정하세요

		        if (status === '공정대기') {
		          return `<button class="start-btn" data-id="${rowData.wrkId}">작업시작</button>`;

		        } else if (status === '공정진행중') {
		          return '';  // 버튼 없음
		        } else if (status === '공정완료') {
		          return `<button class="quality-btn" data-id="${rowData.wrkId}">공정검사</button>`;
		        } else if (status === '공정검사중') {
		          return `<button class="transfer-btn" data-id="${rowData.wrkId}">공정검사완료</button>`;
		        } else if (status === '공정검사완료') {
  		          return `<button class="transfer-btn" data-id="${rowData.wrkId}">공정이관</button>`;
  		        }

		        return '';
		      }
		    }*/
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

//각 행마다 버튼 추가 함수
function makeButton(status, wrkId) {
	
  if (status === '공정대기') {
    return `<button class="start-btn" data-id="${wrkId}">작업시작</button>`;
  } else if (status === '공정완료') {
    return `<button class="quality-btn" data-id="${wrkId}">공정검사</button>`;
  } else if (status === '공정검사중') {
    return `<button class="transfer-btn" data-id="${wrkId}">공정검사완료</button>`;
  } else if (status === '공정검사완료') {
    return `<button class="transfer-btn" data-id="${wrkId}">공정이관</button>`;
  }
  return '';
}


// 버튼 클릭 이벤트 위임
document.getElementById('grid').addEventListener('click', async (e) => {
  const target = e.target;
  
  if (target.tagName === 'BUTTON') {
    const wrkId = target.getAttribute('data-id');
    if (!wrkId) return;

    // 버튼 종류 구분 (클래스명 또는 버튼 텍스트 등)
    if (target.classList.contains('start-btn')) {
      await updateStatus(wrkId, '공정진행중'); // 작업 시작 → 공정진행중
    } else if (target.classList.contains('quality-btn')) {
      await updateStatus(wrkId, '공정검사중'); // 공정완료 → 공정검사중
    } else if (target.classList.contains('transfer-btn')) {
      // 공정검사중 → 공정검사완료 → 공정이관
      const currentStatus = getCurrentStatus(wrkId);
      if (currentStatus === '공정검사중') {
        await updateStatus(wrkId, '공정검사완료');
      } else if (currentStatus === '공정검사완료') {
        await updateStatus(wrkId, '공정이관');
      }
    }
  }
});

// 현재 상태 가져오기 - 그리드 데이터에서 wrkId 행 찾기
function getCurrentStatus(wrkId) {
  const allData = grid.getData();
  const row = allData.find(r => r.wrkId === wrkId);
  return row ? row.oddStatus : null;
}


//공정 요약 정보
async function managerSummary() {
	try {
			let url = `/SOLEX/operator/api/managerSummary`;
			
	        const res = await fetch(url);  // 1. 서버에 요청 → 응답 도착까지 기다림
	        const data = await res.json();  // 2. 응답을 JSON으로 파싱 → 객체로 바꿈
			
			console.log(data)
			
			empId = data.EMP_ID;
			
			document.getElementById('prcCode').textContent = data.PRC_CODE || '-';
			document.getElementById('prcName').textContent = data.PRC_NM  || '-';
			document.getElementById('empName').textContent = data.DEP_NM || '-';
			document.getElementById('prcTest').textContent = data.QUA_NM || '-';
		
			managerList(currentPage);
			
			console.log(empId);
			console.log(data.PRC_ID);
			console.log(data.PRC_NM);
			console.log(data.DEP_NM);
			console.log(data.QUA_NM);

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
		
		console.log(data)
		
        const gridData = list.map((n, idx) => ({
/*			rowNum: wpCount - (page * pageSize + idx), // 역순 번호 계산
*/			wrkId: n.WRK_ID,
			prdCd: n.PRD_CODE,
			prdNm: n.PRD_NM,
			prdColor: n.PRD_COLOR,
            prdSize: n.PRD_SIZE,
            prdHeight: n.PRD_HEIGHT,
            wpoOcount: n.WPO_OCOUNT,
            wpoJcount: n.WPO_JCOUNT,
			wpoBcount: n.WPO_BCOUNT,
			oddPer: n.ODD_PER,
			wpoStatus: n.WPO_STATUS,
			ordEndDate: dateFormatter(new Date(n.ORD_END_DATE))  || '-',
			wpoBtn: n.WPO_STATUS === '공정대기'
							? `<button class="btn btn-sm btn btn-warning assign-btn" data-ord-id="${n.WRK_ID}"> 창고배정</button>`
							: ''
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












// 상태 업데이트 함수 (서버 호출, 그리드 갱신 포함)
async function updateStatus(wrkId, newStatus) {
  try {
    // 1. 서버에 상태 변경 요청
    const res = await fetch(`/SOLEX/operator/api/updateStatus`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({wrkId, status: newStatus})
    });

    if (!res.ok) throw new Error('상태 업데이트 실패');

    // 2. 성공 시 그리드 데이터 갱신 (로컬)
    const allData = grid.getData();
    const rowIndex = allData.findIndex(r => r.wrkId === wrkId);
    if (rowIndex !== -1) {
      allData[rowIndex].oddStatus = newStatus;

      // 예: 상태 변경에 따라 작업진행률이나 기타 필드도 변경 필요시 같이 처리 가능
      // allData[rowIndex].oddPer = ...;

      grid.setValue(rowIndex, 'oddStatus', newStatus);
      // 강제로 버튼 칼럼 재렌더링
      grid.setValue(rowIndex, 'wrkAction', null);
      grid.setValue(rowIndex, 'wrkAction', '');  // 값 바꿔서 formatter 재호출 유도
    }
  } catch (e) {
    alert('상태 업데이트 중 오류가 발생했습니다.');
    console.error(e);
  }
}
