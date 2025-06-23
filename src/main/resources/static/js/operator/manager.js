
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
		{ header: '불량수량', name: 'wpoBcount', align: 'center', filter: 'select',
			formatter: ({ value, row }) => {
			    if (row.wpoStatus !== 'wpo_sts_04') {
			      return value ?? '-'; // 기본값 또는 빈 문자열
			    }

			    return `
			      <div style="display: flex; align-items: center; justify-content: center; gap: 4px;">
			        <input type="text" value="${value ?? ''}" class="bcount-input" data-id="${row.wrkId}" style="width: 50px;" />
			        <button class="save-bcount-btn" data-id="${row.wrkId}" style="border: none; background: transparent; cursor: pointer;">
						<i class="menu-icon tf-icons bx bx-check"></i>
			        </button>
			      </div>
			    `;
			  }
		}, 
		{header: '진행률',
         name: 'wpoProRate',
         align: 'center',
		 // 작업률 표시
		 formatter: ({ value }) => {
		    const rate = parseFloat(value) || 0;

		    return `
		        <div class="progress" style="height: 20px; position: relative;">
		            <div class="progress-bar bg-success" 
		                 role="progressbar" 
		                 style="width: ${rate}%;" 
		                 aria-valuenow="${rate}" 
		                 aria-valuemin="0" 
		                 aria-valuemax="100">
		            </div>
		            <span class="progress-text">${rate}%</span>
		        </div>
		    `;
		 }
		},
		{ header: '납품예정일', name: 'ordEndDate', align: 'center', sortable: 'true' },
		{ header: '진행상태', name: 'wpoStatusName', align: 'center', filter: 'select', className: 'bold-text' },
		{ header: '작업지시', name: 'wpoBtn', align: 'center', sortable: 'true', editable: false, width: 120},
		
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

// 버튼 클릭 이벤트 위임
document.getElementById('grid').addEventListener('click', async (e) => {
  const target = e.target;
  
  // input 클릭 시 포커스 강제 부여
  if (target.classList.contains('bcount-input')) {
      e.stopPropagation();
      target.focus();
      return;
  }
  
  if (target.tagName === 'BUTTON') {
    const wrkId = target.getAttribute('data-id');
    if (!wrkId) return;

    // 버튼 종류 구분 (클래스명 또는 버튼 텍스트 등)
	// updateStatus(작업id, 변경될 상태값)
    if (target.classList.contains('start-btn')) { // 작업시작 버튼 클릭
      await updateStatus(wrkId, 'wpo_sts_02'); 		// 공정진행중
    } else if (target.classList.contains('quality-btn')) {	//품질검사 버튼 클릭
      await updateStatus(wrkId, 'wpo_sts_04'); // 품질검사 중
	//} else if (target.classList.contains('transfer-btn')) {	//검사 완료 버튼 클릭
    //  await updateStatus(wrkId, 'wpo_sts_04'); // 품질검사완료
/*    }else if (target.classList.contains('transfer-btn')) {	
	  
	  await updateStatus(wrkId, 'wpo_sts_05'); //다음 공정으로 이관
     */
    } else if (target.classList.contains('success-btn')) {
		// 공정 이관 처리
		//??????????????????????????????????????????????
  	}
  }
});

//품질검사 중일 때만 불량수량 입력할 수 있도록 설정
/*grid.on('editingStart', ev => {
  const row = grid.getRow(ev.rowKey);
  if (ev.columnName === 'wpoBcount' && row.wpoStatus !== 'wpo_sts_04') {
    ev.stop(); // 편집 막기
    alert('품질검사 후 등록해주세요');
  }
});*/

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

	    } catch (e) {
	        console.error('fetch 에러 : ', e);
	    }
}

// 게시글 목록 불러오기
async function managerList(page) {
    try {
		let wpoProRate = 0;
		
		// 무한스크롤 페이지, 검색어 url로 전달
		let url = `/SOLEX/operator/api/managerList?page=${page}&size=${pageSize}&empId=${empId}`;
		
        const res = await fetch(url);  // 1. 서버에 요청 → 응답 도착까지 기다림
        const data = await res.json();  // 2. 응답을 JSON으로 파싱 → 객체로 바꿈

		const list = data.list;
		const managerCount = data.managerCount;	//전체 개수(무한스크롤)
		const hasInProgress = list.some(n => n.WPO_STATUS === 'wpo_sts_02');
		
		
		console.log(data)
		
		const gridData = list.map((n, idx) => {
			let btn = '';
			
			// 진행률 계산
		    const wpoProRate = n.WPO_OCOUNT > 0
		        ? Math.round((n.WPO_JCOUNT / n.WPO_OCOUNT) * 1000) / 10  // 소수점 1자리
		        : 0;
			
		    const wpoStatus = n.WPO_STATUS;
			
		    if (!hasInProgress && wpoStatus === 'wpo_sts_01') {
		        btn = `<button class="btn start-btn btn-sm btn-primary " data-id="${n.WRK_ID}">작업시작</button>`;
		    } else if (wpoStatus === 'wpo_sts_02') {
		        btn = '';  // 버튼 없음
		    } else if (wpoStatus === 'wpo_sts_03') {
		        btn = `<button class="btn quality-btn btn-sm btn-info" data-id="${n.WRK_ID}">품질검사</button>`;
		    } else if (wpoStatus === 'wpo_sts_04') {
		        btn = `<button class="btn transfer-btn btn-sm btn-warning" data-id="${n.WRK_ID}">검사완료</button>`;
		    } else if (wpoStatus === 'wpo_sts_05') {
		        btn = `<button class="btn success-btn btn-sm btn-success" data-id="${n.WRK_ID}">공정이관</button>`;
		    }
			console.log(wpoProRate)
			
		    return {
		        wrkId: n.WRK_ID,
		        prdCd: n.PRD_CODE,
		        prdNm: n.PRD_NM,
		        prdColor: n.PRD_COLOR,
		        prdSize: n.PRD_SIZE,
		        prdHeight: n.PRD_HEIGHT,
		        wpoOcount: n.WPO_OCOUNT,
		        wpoJcount: n.WPO_JCOUNT,
		        wpoBcount: n.WPO_BCOUNT,
		        wpoProRate: wpoProRate,
		        wpoStatusName: n.WPO_STATUS_NAME,
				wpoStatus: n.WPO_STATUS,
		        ordEndDate: dateFormatter(new Date(n.ORD_END_DATE)) || '-',
		        wpoBtn: btn
		    };
		});
		
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
      method: 'PATCH',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({wrkId, wpoStatus: newStatus})
    });

    if (!res.ok) throw new Error('상태 업데이트 실패');

    //성공시 페이지 재호출	
	currentPage = 0;  // 페이지 초기화
	await managerList(currentPage);

  } catch (e) {
    alert('상태 업데이트 중 오류가 발생했습니다.');
    console.error(e);
  }
}
