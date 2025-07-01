//전역 변수 설정
let currentPage = 0;
const pageSize = 20;
const gridHeight = 250;
let empId = null;
let wpoId = null;
let currentWpoId = null;
let beforeMemo = ''; 

let completeQtyInput = document.getElementById('completeQty');
let wreMemoInput = document.getElementById('wreMemo');
let saveBtn = document.getElementById('saveBtn')

// ToastUI Grid 생성
const grid = new tui.Grid({
    el: document.getElementById('grid'),
    bodyHeight: gridHeight,
	rowHeaders: ['rowNum'],
    scrollY: true,
    scrollX: false,
    data: [],
    columns: [
		{ header: '실적등록ID', name: 'wreId', align: 'center' },
		{ header: '작업수량', name: 'wreJcount', align: 'center', filter: 'select' },
		{ header: '작업일', name: 'wreDate', align: 'center', filter: 'select' },
		{ header: '비고', name: 'wreMemo', align: 'center', filter: 'select', editor: 'text', width: 400}
    ],
	

});

// 페이지가 완전히 로딩 된 후에 자동으로 목록 보여짐
window.addEventListener('DOMContentLoaded', async () => {
	await workerSummary(); // 초기 작업 완료까지 기다림
	workerReport();       // 저장 버튼 이벤트는 이 후에 연결

});


//작업수량 선택시 기존 입력된 값 자동 선택하기
document.getElementById('completeQty').addEventListener('focus', function() {
  this.select();
});


//무한 스크롤 이벤트
function bindScrollEvent() {
	// 검색으로 화면 목록이 변경되었을 경우를 대비해서 스크롤 초기화
    grid.off('scrollEnd');
/*	
	//무한스크롤시 검색어 유지를 위해 재전달
    grid.on('scrollEnd', () => {
        //const keyword = document.getElementById('searchInput').value.trim();
        workerDetail(currentPage);
    });*/
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

function workerReport() {
    saveBtn.addEventListener('click', async () => {
		
		let completeQty = parseInt(completeQtyInput.value);
		let wreMemo = wreMemoInput.value;
		
        if (isNaN(completeQty) || completeQty <= 0) {
            alert('작업 수량을 정확히 입력해주세요.');
            return;
        }

        if (!empId || !currentWpoId) {
            alert('작업 정보가 없습니다.');
            return;
        }

        const payload = {
            wpoId: currentWpoId,
            empId: empId,
            wreJcount: completeQty,
			wreMemo: wreMemo
        };
		
		console.log(payload)
        try {
            const res = await fetch('/SOLEX/operator/api/insertCount', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                alert('작업 수량이 저장되었습니다.');
                document.getElementById('completeQty').value = 0;
				document.getElementById('wreMemo').value = "";
				
				await workerSummary();

                currentPage = 0;
                await workerList(currentPage);
            } else {
                alert('저장 실패: ' + res.statusText);
            }
        } catch (e) {
            console.error('저장 요청 중 오류 발생:', e);
        }
    });
}

//공정 요약 정보
async function workerSummary() {
	try {
			let url = `/SOLEX/operator/api/workerSummary`;
			
	        const res = await fetch(url);  // 1. 서버에 요청 → 응답 도착까지 기다림
	        const data = await res.json();  // 2. 응답을 JSON으로 파싱 → 객체로 바꿈
			console.log(data)
			
			// 프로그레스바 너비 및 텍스트 업데이트
		    const progressBar = document.getElementById('progressBar');
		    const progressText = document.getElementById('progressText');
						
			// 진행률이 100프로면 더이상 입력되지 않도록 설정
			let ocount = Number(data.WPO_OCOUNT);
			let jcount = Number(data.WPO_JCOUNT);
			let wpoProRate = data.WPO_OCOUNT > 0 ? Math.round((data.WPO_JCOUNT / data.WPO_OCOUNT) * 1000) / 10 : 0;
			let isCompleted = jcount >= ocount;
			
			console.log(ocount)
			// 100% 이상일 경우 입력 막기
			if (isCompleted) {
				// alert 반복 방지: 완료 상태가 처음 감지될 때만 알림 표시
	            if (!workerSummary.completedAlertShown) {
	                alert('작업이 완료되었습니다.');
	                workerSummary.completedAlertShown = true;
	            }
				
			  completeQtyInput.disabled = true;
			  wreMemoInput.disabled = true;
			  saveBtn.disabled = true;
			} else {
			  completeQtyInput.disabled = false;
			  wreMemoInput.disabled = false;
			  saveBtn.disabled = false;
			  workerSummary.completedAlertShown = false;
			}
			
			// 메모 편집
			grid.on('editingStart', ev => {
			    if (ev.columnName === 'wreMemo' && isCompleted) {
			        ev.stop();
			        alert('작업이 완료된 후에는 메모를 수정할 수 없습니다.');
			    }
			});
			
			
			grid.on('editingFinish', async ev => {
			    if (ev.columnName !== 'wreMemo') return;

			    const row     = grid.getRow(ev.rowKey);
			    const newMemo = String(ev.value ?? '').trim();

			    // 변동이 없으면 종료
			    if (newMemo === beforeMemo) return;

			    // 사용자 확인
			    if (!window.confirm('메모를 저장하시겠습니까?')) {
			        // 취소 → 원래 값 복원
			        grid.setValue(ev.rowKey, 'wreMemo', beforeMemo);
			        return;
			    }

			    // PATCH 요청 전송
			    const payload = {
			        wreId   : row.wreId,   // 실적 PK
			        newMemo : newMemo
			    };

			    try {
			        const res = await fetch('/SOLEX/operator/api/updateMemo', {
			            method : 'PATCH',
			            headers: { 'Content-Type': 'application/json' },
			            body   : JSON.stringify(payload)
			        });

			        if (!res.ok) {
			            const msg = await res.text();
			            throw new Error(msg || res.status);
			        }

			        // 성공 – 그리드 데이터 확정
			        row.wreMemo = newMemo;
			        await workerList(0);   // 레이아웃‑리렌더링

			    } catch (err) {
			        alert('메모 저장에 실패했습니다.');
			        console.error(err);
			        // 실패 – 롤백
			        grid.setValue(ev.rowKey, 'wreMemo', beforeMemo);
			    }
			});
			
			empId = data.EMP_ID;
			currentWpoId = data.WPO_ID; // ← 작업 ID
			
			document.getElementById('depNm').textContent = data.DEP_NM || '-';
			document.getElementById('empNum').textContent = data.EMP_NUM || '-';
			document.getElementById('empNm').textContent = data.EMP_NM || '-';
			
			document.getElementById('wpoId').textContent = data.WPO_ID || '-';
			document.getElementById('prdCode').textContent = data.PRD_CODE || '-';
			document.getElementById('prdName').textContent = data.PRD_NM  || '-';
			document.getElementById('prdOption').textContent =  data.PRD_OPTION|| '-';
			
			document.getElementById('wpoOcount').textContent = data.WPO_OCOUNT || '-';
			document.getElementById('wpoJcount').textContent = data.WPO_JCOUNT || '-';
			document.getElementById('progressText').textContent = `${wpoProRate}%`;
		
			if (progressBar && progressText) {
			     progressBar.style.width = `${wpoProRate}%`;
			     progressBar.setAttribute('aria-valuenow', wpoProRate);
			     progressText.textContent = `${wpoProRate}%`;

			}
			await workerList(currentPage);

	    } catch (e) {
	        console.error('fetch 에러 : ', e);
	    }
}

// 작업 내역 목록 불러오기
async function workerList(page) {
    try {
		
		
		// 무한스크롤 페이지, 검색어 url로 전달
		//let url = `/SOLEX/operator/api/workerList?page=${page}&size=${pageSize}&empId=${empId}&wpoId=${currentWpoId}`;
		let url = `/SOLEX/operator/api/workerList?empId=${empId}&wpoId=${currentWpoId}`;
		
        const res = await fetch(url);  // 1. 서버에 요청 → 응답 도착까지 기다림
        const data = await res.json();  // 2. 응답을 JSON으로 파싱 → 객체로 바꿈

		console.log(data)
		const list = data.list || [];
		
        const gridData = list.map((n) => ({
			
			wreId: n.WRE_ID,
            wreJcount: n.WRE_JCOUNT,
            wreDate: dateFormatter(n.WRE_DATE, true),
            wreMemo: n.WRE_MEMO || ''
        }));

		//그리드에 내용이 있을때만 호출
		if (page === 0 && gridData.length === 0)  {
		    grid.resetData([]);
		    return;
		}
		
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
