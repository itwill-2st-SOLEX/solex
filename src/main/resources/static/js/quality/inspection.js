// 전역 변수 설정
let currentPage = 0;
const pageSize = 10;
const gridHeight = 390;
let empId = null;
let workerGrid;
let sumGrid;

let currentMonth  = dayjs();          // 오늘 기준
const monthLabel  = document.getElementById('monthLabel');
const prevMonthBtn= document.getElementById('prevMonthBtn');
const nextMonthBtn= document.getElementById('nextMonthBtn');

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
                name: 'optionGroup1',
                childNames: ['prdColor', 'prdSize', 'prdHeight']
            },
            {
                header: '작업수량',
                name: 'optionGroup2',
                childNames: ['oddCnt', 'wpoOcount', 'wpoJcount', 'qhiBcount']
            }
        ]
    },
    columns: [
        { header: '수주상세번호', name: 'oddId', align: 'center', width: 100 },
        { header: '제품코드', name: 'prdId', align: 'center', filter: 'select' },
        { header: '제품명', name: 'prdNm', align: 'center', filter: 'select', width: 180 },

        { header: '컬러', name: 'prdColor', align: 'center', filter: 'select', width: 80 },
        { header: '사이즈', name: 'prdSize', align: 'center', filter: 'select', width: 80 },
        { header: '굽높이', name: 'prdHeight', align: 'center', filter: 'select', width: 80 },

        { header: '수주', name: 'oddCnt', align: 'center', sortable: true, width: 80 },
        {
            header: '불량',
            name: 'qhiBcount',
            align: 'center',
            sortable: true,
            width: 80,
            defaultValue: 0
            
        },
        { header: '납품예정일', name: 'ordEndDate', align: 'center', sortable: true },
        { header: '진행상태', name: 'StatusName', align: 'center', filter: 'select', className: 'bold-text' },
        { header: '작업지시', name: 'Btn', align: 'center', editable: false, width: 100 },
    ],
});

// 페이지가 완전히 로딩 된 후 자동으로 목록 호출
window.addEventListener('DOMContentLoaded', () => {
    managerSummary();
	renderMonthLabel();
	bindScrollEvent();
});

//무한 스크롤 이벤트
function bindScrollEvent() {
	// 검색으로 화면 목록이 변경되었을 경우를 대비해서 스크롤 초기화
    grid.off('scrollEnd');
	
    grid.on('scrollEnd', () => {
        managerList(currentPage);
    });

}

// 품질검사 중일 때만 불량수량 입력 가능
grid.on('editingStart', ev => {
    const row = grid.getRow(ev.rowKey);
    if (ev.columnName === 'qhiBcount' && row?.Status !== 'odd_sts_07') {
        ev.stop();
        alert('품질검사 후 등록해주세asdasdasdasda요');
    }
});

// 불량수량 입력 후 화면에 남아있도록 처리
grid.on('editingFinish', ev => {
    const { rowKey, columnName, value } = ev;
	
	// 수정한 컬럼이 qhiBcount인 경우에만 데이터 갱신
    if (columnName === 'qhiBcount') {
        grid.setValue(rowKey, columnName, value);
        console.log(`불량수량 수정됨: 행키 ${rowKey}, 값 ${value}`);
    }
});

// 목록 클릭 시 작업 내역 모달 표시
grid.on('click', async ev => {
	
});

//화면에 년, 월 표시
function renderMonthLabel() {
    monthLabel.textContent =
        `${currentMonth.year()}년 ${currentMonth.month() + 1}월`;
}

//이전월, 다음월 선택버튼
prevMonthBtn.addEventListener('click', () => {
    currentMonth = currentMonth.subtract(1, 'month');
    renderMonthLabel();
    loadMonthlyData();          
});

nextMonthBtn.addEventListener('click', () => {
	const candidate = currentMonth.add(1, 'month');         // 이동하려는 달

    // 오늘보다 ‘앞’(after)인 달이면 리턴 → 클릭 무시
    if (candidate.isAfter(dayjs(), 'month')) return;

    currentMonth = candidate;
    renderMonthLabel();
    loadMonthlyData()
});

//월 데이터 초기 설정
async function loadMonthlyData() {
    currentPage = 0;                       // 페이지 리셋
    grid.resetData([]);                    // 화면 클리어
    await managerList(0);                  // 첫 페이지 로딩
}

// 버튼 클릭 이벤트 위임
document.getElementById('grid').addEventListener('click', async e => {
    const target = e.target;
	
	// input 클릭 시 포커스 강제 부여
    if (target.classList.contains('bcount-input')) {
        e.stopPropagation();
        target.focus();
        return;
    }

	// 버튼 종류 구분 (클래스명 또는 버튼 텍스트 등)
	// updateStatus(작업id, 변경될 상태값)
    if (target.tagName === 'BUTTON') {
        const oddId = target.getAttribute('data-id');
        if (!oddId) return;

        if (target.classList.contains('quality-btn')) {	//품질검사 버튼
            await updateStatus(oddId, 'odd_sts_07');			// 품질검사 중

        } else if (target.classList.contains('transfer-btn')) {	//검사 완료 버튼
			
			// 편집 중이면 편집 종료 → grid 데이터 반영 (원래 있는거) 
            await grid.finishEditing();

			// oddId에 해당하는 행 key 찾기
            const bcount = (() => {
                const data = grid.getData();
                const rowKey = data.findIndex(row => row.oddId == oddId);
                return grid.getValue(rowKey, 'qhiBcount');
            })();

            if (!bcount || Number(bcount) < 0) {
                alert('불량 수량을 입력해주세요.');
                return;
            }

            await updateStatus(oddId, 'odd_sts_08', Number(bcount));	// 품질검사완료

        } else if (target.classList.contains('success-btn')) {			//공정이관
            await updateStatus(oddId, 'odd_sts_09');					//공정이관완료
        }
    }
});

// 숫자만 입력 가능하도록 커스터마이징
function customTextEditor(props) {
    const el = document.createElement('input');		//요소 생성

    el.type = 'text';
    el.value = String(props.value ?? '');	//그리드 값을 문자열로 변경하여 저장(없으면 빈문자열)

	// 숫자만 입력 가능하도록 이벤트 추가
    el.addEventListener('beforeinput', e => {
        if (e.data && !/^[0-9]+$/.test(e.data)) {
            e.preventDefault();
        }
    });

    el.addEventListener('input', () => {
        el.value = el.value.replace(/[^0-9]/g, '');
    });

    return {
        getElement() {	//그리드에 요소 반환
            return el;
        },
        getValue() {	//사용자가 입력한 값 반환

            return el.value;
        },
        mounted() {		//입력창에 포커스, 기존 값 전체 선택 상태
            el.focus();
            el.select();
        }
    };
}

// 날짜 포맷터 (년-월-일, 옵션에 따라 시간 포함)
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
        hour12: true
    }).formatToParts(d);
	
	//저장된 parts 배열을 반복하면서 원하는 값만 가져올 수 있도록 함수를 정의함
    const get = type => parts.find(p => p.type === type)?.value;
	
	//get함수를 이용하여 각 년, 월, 일의 값만 배열에서 찾아와서 저장
    const year = get('year');
    const month = get('month');
    const day = get('day');

    let result = `${year}-${month}-${day}`;
    if (includeTime) {
        const dayPeriod = get('dayPeriod');		// '오전' or '오후'
        const hour = get('hour');
        const minute = get('minute');
        result += ` ${dayPeriod} ${hour}:${minute}`;
    }

    return result;
}


// 공정 요약 정보 불러오기
async function managerSummary() {
    try {
        const res = await fetch(`/SOLEX/quality/api/inspection/managerSummary`);
        const data = await res.json();
        console.log(data);

        empId = data.EMP_ID;

        document.getElementById('prcCode').textContent = data.PRC_CODE || '-';
        document.getElementById('prcName').textContent = data.PRC_NM || '-';
        document.getElementById('empName').textContent = data.DEP_NM || '-';
        document.getElementById('prcTest').textContent = data.QUA_NM || '-';

		currentPage = 0;

		await loadMonthlyData();               // 현재 월 0페이지 호출

    } catch (e) {
        console.error('fetch 에러 : ', e);
    }
}

// 작업 목록 불러오기
async function managerList(page) {
    try {
		const ym = currentMonth.format('YYYYMM');
        const url = `/SOLEX/quality/api/inspection/managerList?page=${page}&size=${pageSize}&empId=${empId}&yearMonth=${ym}`;
        const res = await fetch(url);
        const data = await res.json();
        console.log(data);

        const list = data.list;
        

        const gridData = list.map(n => {
            return {
                oddId: n.ODDID,
                prdId: n.PRDID,
                prdNm: n.PRDNM,
                prdColor: n.PRDCOLOR,
                prdSize: n.PRDSIZE,
                prdHeight: n.PRDHEIGHT,
                oddCnt: n.ODDCNT,
                qhiBcount: n.QHI_BCOUNT || 0,
                ordEndDate: dateFormatter(new Date(n.ORDENDDATE)) || '-',
                StatusName : n.ODDSTS === 'odd_sts_07' ? '품질검사대기' : n.ODDSTS,
                Btn : n.ODDSTS === `odd_sts_07` ? `<button class="btn quality-btn btn-sm btn-info" data-id="${n.ODDID}">품질검사</button>` : ''
            };
        });

        if (page === 0) grid.resetData(gridData);
        else grid.appendRows(gridData);

		currentPage++;
				
		// 무한스크롤 종료
		if (list.length < pageSize) {
    	    grid.off('scrollEnd');
        }

    } catch (e) {
        console.error('fetch 에러 : ', e);
    }
}

// 
async function updateStatus() {
    
}

// 작업 내역 모달 표시 함수
async function showWorkerDetailModal(wpoId, headerRow) {
    let needReload = false;		//값 변경시 재호출하기 위해 확인 변수
    let beforeEdit;

    try {
        const url = `/SOLEX/operator/api/workerReport/${wpoId}?page=0&size=${pageSize}`;
        const response = await fetch(url);
        const jsonData = await response.json();
        const list = Array.isArray(jsonData.list) ? jsonData.list : [];
        const totalQty = jsonData.wpoOcount ?? 0;
		
		// 사원별 합계 계산
        const sumMap = {};
        list.forEach(r => {
            if (!sumMap[r.EMP_ID]) {
                sumMap[r.EMP_ID] = { empNum: r.EMP_NUM, empNm: r.EMP_NM, qty: 0, qtyRate: 0 };
            }
            sumMap[r.EMP_ID].qty += r.WRE_JCOUNT;
        });

        Object.values(sumMap).forEach(o => {
            o.qtyRate = totalQty > 0 ? Math.round((o.qty / totalQty) * 1000) / 10 : 0;
        });
        const sumArr = Object.values(sumMap);
		
		//모달 본문 읽어오기
        const modalEl = document.getElementById('exampleModal');
        const bodyEl = document.getElementById('showModal');

        bodyEl.innerHTML = `
            <h5 class="mb-3">
                <span>작업지시번호&nbsp;:&nbsp;${headerRow.wrkId}</span>&nbsp;&nbsp;|&nbsp;&nbsp;
                <span>제품&nbsp;:&nbsp;${headerRow.prdNm}
                    ( ${headerRow.prdColor}&nbsp;/&nbsp;${headerRow.prdSize}&nbsp;/&nbsp;${headerRow.prdHeight} )
                </span>
            </h5>
            <ul class="nav nav-tabs mb-2" id="workerTab" role="tablist">
                <li class="nav-item" role="presentation">
                    <button class="nav-link active"
                        data-bs-toggle="tab"
                        data-bs-target="#tabDetail"
                        type="button"
                        role="tab">상세 목록</button>
                </li>
                <li class="nav-item" role="presentation">
                    <button class="nav-link"
                        data-bs-toggle="tab"
                        data-bs-target="#tabSum"
                        type="button"
                        role="tab">사원별 합계</button>
                </li>
            </ul>
            <div class="tab-content">
                <div class="tab-pane fade show active" id="tabDetail" role="tabpanel">
                    <div id="workerGrid"></div>
                </div>
                <div class="tab-pane fade" id="tabSum" role="tabpanel">
                    <div id="sumGrid"></div>
                </div>
            </div>
        `;
		//모달 열기
        const bsModal = bootstrap.Modal.getOrCreateInstance(modalEl);
        bsModal.show();

        modalEl.addEventListener('shown.bs.modal', () => {
            // 상세 목록 그리드 생성
            workerGrid = new tui.Grid({
                el: document.getElementById('workerGrid'),
                bodyHeight: 300,
                rowHeaders: ['rowNum'],
                scrollX: false,
                data: list.map(r => ({
                    wpoId: r.WPO_ID,
                    wreId: r.WRE_ID,
                    wreDate: dateFormatter(r.WRE_DATE, true),
                    empNum: r.EMP_NUM,
                    empNm: r.EMP_NM,
                    wreJcount: r.WRE_JCOUNT,
                    wreMemo: r.WRE_MEMO || ''
                })),
                columns: [
                    { header: '날짜', name: 'wreDate', align: 'center', sortable: true, width: 170 },
                    { header: '사원번호', name: 'empNum', align: 'center', sortable: true, width: 80 },
                    { header: '이름', name: 'empNm', align: 'center', sortable: true, width: 100 },
                    { header: '수량', name: 'wreJcount', align: 'center', sortable: true, editor: customTextEditor, width: 80 },
                    { header: '비고', name: 'wreMemo', align: 'center', sortable: true }
                ],
                summary: {
                    position: 'bottom',
                    columnContent: {
                        wreJcount: { template: v => `총 ${v.sum}개` }
                    }
                }
            });
			
			//작업일 기준으로 그리드 정렬
            workerGrid.sort('wreDate', false);

			//사원별 생산 실적의 변경은 공정 완료 전에만 가능
            workerGrid.on('editingStart', ev => {
                if (ev.columnName === 'wreJcount' && (headerRow.wpoStatus !== 'wpo_sts_02' || headerRow.wpoStatus !== 'wpo_sts_03')) {
                    ev.stop();	// 편집창 뜨기 직전에 차단
                    alert('생산중 상태에서만 수정 가능합니다.');
                }
                if (ev.columnName === 'wreJcount') {
                    beforeEdit = Number(workerGrid.getRow(ev.rowKey).wreJcount);
                }
            });

			//사원의 생산량 변경하기
            workerGrid.on('editingFinish', async ev => {
                if (ev.columnName !== 'wreJcount') return;
				
				//기존값과 새로 입력한 값 가져오기
                const row = workerGrid.getRow(ev.rowKey);
                const oldVal = beforeEdit;
                const newVal = Number(ev.value);

                if (newVal === oldVal) return;

                const wpoOcount = headerRow.wpoOcount;
				
				// 현재 변경하려는 사원 외에 다른 사원들의 합계 구하기
                const otherSum = workerGrid.getData()
                    .filter(r => r.wpoId === row.wpoId && r.wreId !== row.wreId)
                    .reduce((acc, cur) => acc + Number(cur.wreJcount), 0);

                const totalAfterChange = otherSum + newVal;

                if (totalAfterChange > wpoOcount) {
                    alert(`총 수량은 지시수량 ${wpoOcount}개를 초과할 수 없습니다. 현재 총합: ${totalAfterChange}`);
					// 편집 취소하고 이전 값으로 복원
                    workerGrid.setValue(ev.rowKey, 'wreJcount', oldVal);
                    return;
                }

				// 사용자에게 저장 여부 확인
                const ok = window.confirm(`수량을 ${oldVal} ▶ ${newVal} 으로 저장하시겠습니까?`);
                if (!ok) {
					// 취소하면 화면 값을 되돌림
                    workerGrid.setValue(ev.rowKey, 'wreJcount', oldVal);
                    return;
                }

				const body  = {
					wpoId : row.wpoId,
					wreId : row.wreId,        // ← PK (실적 테이블 PK를 컬럼으로 내려주세요)
					newCount : newVal, // 입력값
				};
						
				try {
					const res = await fetch('/SOLEX/operator/api/workerCount', {
						method : 'PATCH',            // 또는 'POST'
						headers: { 'Content-Type': 'application/json' },
						body   : JSON.stringify(body)
					});
					
					if (!res.ok) {
						const msg = await res.text();           // ← 서버가 보내 준 에러 메시지
						throw new Error(msg || res.status);
					}

					// ✔ 성공 시 화면 데이터 동기화(합계, 비율 갱신 등)
					row.wreJcount = body.newCount; 
					needReload = true; 

					/*currentPage = 0;
					await managerList(currentPage);*/

				} catch (e) {
					alert('저장 중 오류가 발생했습니다.');
					console.error(e);
					// 실패하면 원래 값으로 롤백
					workerGrid.setValue(ev.rowKey, 'wreJcount', ev.oldValue);
				}
			});
					
			/* ② 모달이 완전히 닫힌 뒤 실행 */
			modalEl.addEventListener('hidden.bs.modal', async () => {
				if (needReload) {
					currentPage = 0;                // 첫 페이지부터
					await managerList(currentPage); // 메인 그리드 재로드
					needReload = false;             // 플래그 리셋
				}
			}, { once: true });                 // 리스너 1회용
					
			//, sortable: 'true' filter: 'select' editable: false
			/* 사원별 합계 Grid -------------------------------------------- */
			sumGrid = new tui.Grid({
				el: document.getElementById('sumGrid'),
				bodyHeight: 260,
				rowHeaders: ['rowNum'],
				scrollX: false,
				data: sumArr,
				columns: [
					{ header: '사원번호', name: 'empNum', align: 'center', sortable: 'true', width: 120 },
					{ header: '이름',     name: 'empNm', align: 'center', sortable: 'true', width: 120 },
					{ header: '총수량',   name: 'qty',   align: 'center', sortable: 'true' },
					{ header: '작업비율',   name: 'qtyRate',   align: 'center', sortable: 'true',
						formatter: ({ value }) => `${value}%` 
					}
				],
				summary: {
					position: 'bottom',
					columnContent: {
						qty: { template: v => `누계 ${v.sum}개` }
					}
				}
			});
					
			// 그리드 정렬
			sumGrid.sort('qtyRate', /*ascending*/ false);

			/* 6) 탭 전환 시 레이아웃 갱신 ---------------------------------- */
			document
				.getElementById('workerTab')
				.addEventListener('shown.bs.tab', e => {
					const target = e.target.dataset.bsTarget;
					
					if (target === '#tabDetail') workerGrid.refreshLayout();
					if (target === '#tabSum')    sumGrid.refreshLayout();
				});
			},
			{ once: true } // 모달 열릴 때 한 번만 실행
		);
	} catch (e) {
		console.error(e);
		alert('작업 내역을 불러오지 못했습니다.');
	}
}
