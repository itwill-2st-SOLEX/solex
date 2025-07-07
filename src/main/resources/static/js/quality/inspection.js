// 전역 변수 설정
let currentPage = 0;
const pageSize = 10;
const gridHeight = 390;
let empId = null;
let workerGrid;
let sumGrid;

// dayjs 관련 변수 (전역으로 유지)
let currentMonth = dayjs();
// DOM 요소는 DOMContentLoaded 이후에 접근 가능하므로, 초기 할당은 DOMContentLoaded 내에서 수행
let monthLabel;
let prevMonthBtn;
let nextMonthBtn;

// 그리드 인스턴스를 저장할 변수 (전역으로 유지)
let grid;

// 현재 품질검사 중인 행의 rowKey를 저장하는 변수 (단일 작업 제한)
// null이면 현재 검사 중인 행이 없다는 의미입니다.
let currentInspectionRowKey = null; 

// 컬럼 정의를 전역 변수로 분리합니다.
const gridColumns = [
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
        defaultValue: 0,
        // editable 속성을 함수로 정의하여 동적으로 편집 가능 여부를 결정합니다.
        // currentInspectionRowKey와 현재 행의 rowKey가 일치할 때만 true를 반환합니다.
        editable: (value, row) => {
            console.log('Editable check for row:', row.rowKey, 'Result:', row.rowKey === currentInspectionRowKey);
            return row.rowKey === currentInspectionRowKey;
        },
        editor: customTextEditor // customTextEditor를 에디터로 지정
    },
    { header: '납품예정일', name: 'ordEndDate', align: 'center', sortable: true },
    { header: '진행상태', name: 'StatusName', align: 'center', filter: 'select', className: 'bold-text' },
    { header: '작업지시', name: 'Btn', align: 'center', width: 100 },
];

// ToastUI Grid 생성 (전역 변수 grid에 할당)
grid = new tui.Grid({
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
    columns: gridColumns, // 전역으로 분리한 gridColumns 사용
});

// 페이지가 완전히 로딩 된 후 자동으로 목록 호출
window.addEventListener('DOMContentLoaded', () => {
    monthLabel = document.getElementById('monthLabel');
    prevMonthBtn = document.getElementById('prevMonthBtn');
    nextMonthBtn = document.getElementById('nextMonthBtn');

    managerSummary();
    renderMonthLabel();
    bindScrollEvent();

    prevMonthBtn.addEventListener('click', () => {
        currentMonth = currentMonth.subtract(1, 'month');
        renderMonthLabel();
        loadMonthlyData();
    });

    nextMonthBtn.addEventListener('click', () => {
        const candidate = currentMonth.add(1, 'month');
        if (candidate.isAfter(dayjs(), 'month')) return;
        currentMonth = candidate;
        renderMonthLabel();
        loadMonthlyData();
    });
});

// 무한 스크롤 이벤트
function bindScrollEvent() {
    grid.off('scrollEnd');
    grid.on('scrollEnd', () => {
        List(currentPage);
    });
}

// 품질검사 중일 때만 불량수량 입력 가능 (수정됨)
grid.on('editingStart', ev => {
    // '불량' 칼럼이 아니면 통과
    if (ev.columnName !== 'qhiBcount') {
        return;
    }

    const row = grid.getRow(ev.rowKey);

    // 현재 검사 중인 행이 아니거나, '품질검사대기' 상태가 아니면 편집 중단
    if (ev.rowKey !== currentInspectionRowKey || row?.StatusName !== '품질검사대기') {
        ev.stop();
        showCustomAlert('이 행의 불량 수량은 현재 편집할 수 없습니다. "품질검사" 버튼을 클릭하여 활성화하거나, 상태를 확인하세요.');
        return;
    }
});

// 불량수량 입력 후 화면에 남아있도록 처리
grid.on('editingFinish', ev => {
    const { rowKey, columnName, value } = ev;

    if (columnName === 'qhiBcount') {
		const numberValue = Number(value);
        grid.setValue(rowKey, columnName, numberValue);
		
		
		
    }
});

async function Approve (oddId,numericValue) {
	let success = false;
	try {
       // API 호출 예시: 실제 API 엔드포인트와 데이터 형식에 맞게 수정해야 합니다.
       const response = await fetch('/SOLEX/quality/api/inspection', {
           method: 'POST', // 또는 'PATCH', 'PUT' 등 적절한 HTTP 메서드 사용
           headers: {
               'Content-Type': 'application/json',
           },
           body: JSON.stringify({
               oddId: oddId,
               qhiBcount: numericValue, // 숫자로 변환된 값 사용
           }),
       });

	   if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`API 호출 실패: ${response.status} - ${errorText}`);
      }

      const result = await response.json(); // 불량 수량 저장 API의 결과

      // 2. 불량 수량 저장이 성공했으므로, 재고 차감 백엔드 API 호출 (분리된 함수 사용)
	  const stockOutResult = await callStockOutApi(Number(oddId), Number(numericValue)); 
	          
      showCustomAlert('불량 수량 저장 및 재고 차감이 성공적으로 완료되었습니다.');
      success = true;

       // 필요하다면, 서버 응답에 따라 그리드 데이터나 UI를 추가로 업데이트할 수 있습니다.
       // 예: grid.setValue(rowKey, 'StatusName', '업데이트됨');

	   } catch (error) {
           console.error('작업 처리 중 오류 발생:', error);
           // 에러 메시지 상세화
           let errorMessage = '작업 처리 중 오류가 발생했습니다. 다시 시도해주세요.';
           if (error.message.includes('재고 차감 API 호출 실패')) {
               errorMessage = '재고 차감에 실패했습니다: ' + error.message;
           } else if (error.message.includes('API 호출 실패')) {
               errorMessage = '불량 수량 저장에 실패했습니다: ' + error.message;
           }

           showCustomAlert(errorMessage);

           if (rowKey !== undefined) {
               // 실패 시 UI 롤백 또는 초기화
               // 불량 수량 저장과 재고 차감이 하나의 트랜잭션으로 묶이지 않았다면,
               // 불량 수량 저장이 성공했더라도 재고 차감 실패 시 롤백 로직을 고려해야 함.
               grid.setValue(rowKey, 'qhiBcount', 0); // 예시: 실패 시 0으로 롤백
           }
           success = false; // 실패 시 false로 설정
       }
       return success;
}

async function callStockOutApi(oddId, qhiBcount) {
	console.log("실행됨?");
    try {
        const stockOutResponse = await fetch('/SOLEX/quality/api/inspection/outbound', {
            method: 'POST', // 재고 차감은 주로 POST/PATCH/PUT
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                oddId: oddId,
                qhiBcount: qhiBcount,
                // 기타 재고 차감에 필요한 정보 (예: 창고 ID, 옵션 ID 등)
                // 만약 이 함수 외부에서 추가적인 데이터가 필요하다면, 인자로 추가하거나 전역적으로 접근 가능한 곳에 둠.
            }),
        });

        if (!stockOutResponse.ok) {
            const errorText = await stockOutResponse.text();
            throw new Error(`재고 차감 API 호출 실패: ${stockOutResponse.status} - ${errorText}`);
        }

        const stockOutResult = await stockOutResponse.json(); // 재고 차감 API의 결과
		if(stockOutResult.oStatusCode == "SUCCESS") {
			await CallUpdateStatus(oddId);
		}
        return stockOutResult; // 성공 시 결과 반환
    } catch (error) {
        console.error('재고 차감 API 호출 중 오류 발생:', error);
        // 여기서 재고 차감 실패에 대한 구체적인 로깅이나 처리를 할 수 있습니다.
        throw error; // 오류를 다시 던져 상위 호출자(Approve 함수)가 처리하도록 함
    }
}

async function CallUpdateStatus(oddId) {
	
	try {
        const stockOutResponse = await fetch('/SOLEX/quality/api/inspection/updateStatus', {
            method: 'PATCH', // 재고 차감은 주로 POST/PATCH/PUT
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                oddId: oddId
            }),
        });

        if (!stockOutResponse.ok) {
            const errorText = await stockOutResponse.text();
            throw new Error(`상태 변경 API 호출 실패: ${stockOutResponse.status} - ${errorText}`);
        }

    } catch (error) {
        console.error('재고 차감 API 호출 중 오류 발생:', error);
        // 여기서 재고 차감 실패에 대한 구체적인 로깅이나 처리를 할 수 있습니다.
        throw error; // 오류를 다시 던져 상위 호출자(Approve 함수)가 처리하도록 함
    }
}






function renderMonthLabel() {
    if (monthLabel) {
        monthLabel.textContent = `${currentMonth.year()}년 ${currentMonth.month() + 1}월`;
    }
}

async function loadMonthlyData() {
    currentPage = 0;
    grid.resetData([]);
    await List(0);
}
document.getElementById('grid').addEventListener('click', async e => {
    const target = e.target;

    if (target.classList.contains('bcount-input')) {
        e.stopPropagation();
        target.focus();
        return;
    }

    if (target.tagName === 'BUTTON') {
        const oddId = target.getAttribute('data-id');
        if (!oddId) return;

        // 1. 해당 행의 rowKey 찾기 (Approve 함수에 전달하기 위해 필요)
        const rowKey = grid.getData().findIndex(row => row.oddId == oddId);
        if (rowKey === -1) {
            console.error('rowKey를 찾을 수 없습니다:', oddId);
            showCustomAlert('데이터를 찾을 수 없습니다. 페이지를 새로고침 해주세요.');
            return;
        }

        if (target.classList.contains('quality-btn')) { // 품질검사 버튼
            await updateStatus(oddId, 'odd_sts_07', e);

        } else if (target.classList.contains('transfer-btn')) { // 검사 완료 버튼

            await grid.finishEditing(); // 현재 편집 중인 셀이 있다면 편집 종료

            const rowData = grid.getRow(rowKey); // rowKey를 사용하여 행 데이터 가져오기
            if (!rowData) {
                console.error('해당 oddId의 행 데이터를 찾을 수 없습니다.');
                showCustomAlert('데이터를 찾을 수 없습니다. 페이지를 새로고침 해주세요.');
                return;
            }

            const bcount = Number(rowData.qhiBcount); // 그리드에 저장된 qhiBcount 값을 가져옴

            // 3. 불량 수량 유효성 검사
            if (isNaN(bcount) || bcount < 0) { // 숫자가 아니거나 음수일 경우
                showCustomAlert('유효한 불량 수량을 입력해주세요.');
                return;
            }

            // 4. 백엔드로 불량 수량 업데이트 요청 (Approve 함수가 성공 여부를 반환하도록 변경됨)
            // Approve 함수에 rowKey도 함께 전달합니다.
            const isApproved = await Approve(oddId, bcount, rowKey);

            // 5. Approve 결과에 따라 '작업 완료' 상태 업데이트 및 해당 행의 UI 갱신
            if (isApproved) { // Approve가 성공했을 때만
                await updateStatus(oddId, 'odd_sts_08', null);
            } else {
                // Approve 실패 시, 사용자에게 메시지를 보여주고 행을 삭제하지 않음
                // (Appove 함수 내에서 이미 showCustomAlert가 호출됨)
                console.log('불량 수량 업데이트 실패. 행을 삭제하지 않습니다.');
                // 여기서 필요하다면 버튼 상태를 다시 활성화하거나 다른 UI 조작을 할 수 있습니다.
            }

        } else if (target.classList.contains('success-btn')) { // 공정이관
            await updateStatus(oddId, 'odd_sts_09');
        }
    }
});

function customTextEditor(props) {
    const el = document.createElement('input');
    el.type = 'text';
    el.value = String(props.value ?? '');

    el.addEventListener('beforeinput', e => {
        if (e.data && !/^[0-9]+$/.test(e.data)) {
            e.preventDefault();
        }
    });

    el.addEventListener('input', () => {
        el.value = el.value.replace(/[^0-9]/g, '');
    });

    return {
        getElement() {
            return el;
        },
        getValue() {
            return el.value;
        },
        mounted() {
            el.focus();
            el.select();
        }
    };
}

function dateFormatter(date, includeTime = false) {
    const d = new Date(date);
    const parts = new Intl.DateTimeFormat('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: includeTime ? '2-digit' : undefined,
        minute: includeTime ? '2-digit' : undefined,
        hour12: true
    }).formatToParts(d);

    const get = type => parts.find(p => p.type === type)?.value;

    const year = get('year');
    const month = get('month');
    const day = get('day');

    let result = `${year}-${month}-${day}`;
    if (includeTime) {
        const dayPeriod = get('dayPeriod');
        const hour = get('hour');
        const minute = get('minute');
        result += ` ${dayPeriod} ${hour}:${minute}`;
    }
    return result;
}

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
        await loadMonthlyData();
    } catch (e) {
        console.error('fetch 에러 : ', e);
    }
}

async function List(page) {
    try {
        const ym = currentMonth.format('YYYYMM');
        const url = `/SOLEX/quality/api/inspection/data?page=${page}&size=${pageSize}&empId=${empId}&yearMonth=${ym}`;
        const res = await fetch(url);
        const data = await res.json();
        console.log(data);

        const list = data.list;
        
        // List 호출 시 모든 편집 상태를 리셋합니다.
        currentInspectionRowKey = null; // 현재 검사 중인 행 초기화
        grid.setColumns(gridColumns); // 컬럼 설정을 다시 적용하여 모든 '불량' 칼럼이 편집 불가능 상태로 돌아가도록 합니다.


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
                StatusName: n.ODDSTS === 'odd_sts_07' ? '품질검사대기' : n.ODDSTS,
                Btn: n.ODDSTS === `odd_sts_07` ? `<button class="btn quality-btn btn-sm btn-info" data-id="${n.ODDID}">품질검사</button>` : ''
            };
        });

        if (page === 0) grid.resetData(gridData);
        else grid.appendRows(gridData);

        currentPage++;

        if (list.length < pageSize) {
            grid.off('scrollEnd');
        }

    } catch (e) {
        console.error('fetch 에러 : ', e);
    }
}

async function updateStatus(oddId, status, eventOrValue) { // 이름 변경: bcount -> eventOrValue
    console.log('updateStatus 호출됨', oddId, status, eventOrValue);

    const rowKey = grid.getData().findIndex(row => row.oddId == oddId);
    if (rowKey === -1) {
        console.warn('rowKey를 찾을 수 없습니다:', oddId);
        return;
    }

    const currentRowData = grid.getRow(rowKey);
    if (!currentRowData) {
        console.warn('현재 행 데이터를 찾을 수 없습니다:', rowKey);
        return;
    }

    if (status === 'odd_sts_07') { // 품질검사 버튼 클릭 시
        if (currentInspectionRowKey !== null && currentInspectionRowKey !== rowKey) {
            showCustomAlert('이전 품질검사를 완료해야 다음 작업을 시작할 수 있습니다.');
            return;
        }

        currentInspectionRowKey = rowKey;
        grid.setColumns(gridColumns);
        grid.startEditing(rowKey, 'qhiBcount');

        grid.setValue(rowKey, 'Btn', `
          <button class="btn transfer-btn btn-primary btn-sm" data-id="${oddId}">검사완료</button>
        `); // 버튼 스타일도 추가

        if (eventOrValue?.target) { // eventOrValue가 이벤트 객체일 경우
            eventOrValue.target.disabled = true;
        }

    } else if (status === 'odd_sts_08') { // 검사 완료 버튼 클릭 시
        // 이 시점에서는 이미 Approve 함수가 성공적으로 호출되어 불량 수량이 백엔드에 저장되었다고 가정
        currentInspectionRowKey = null;
        grid.setColumns(gridColumns); // 컬럼 editable 재평가를 위해 재설정
        
        // 그리드에서 해당 행을 제거합니다.
        grid.removeRow(rowKey);
        
        

    } else if (status === 'odd_sts_09') { // 공정이관 버튼 클릭 시
        // 해당 로직 구현
    }
}

// CustomButtonRenderer는 현재 사용되지 않는 것으로 보입니다.
// 필요하다면 다시 통합할 수 있습니다.
/*
function CustomButtonRenderer(props) {
    const el = document.createElement('button');
    el.textContent = '품질검사중';
    el.className = 'btn btn-blue';
    el.addEventListener('click', () => {
        const rowKey = props.rowKey;
        grid.setColumnEditable('badQty', true);
        grid.setEditableCell(rowKey, 'badQty', true);
    });
    this.el = el;
}
*/

async function showWorkerDetailModal(wpoId, headerRow) {
    let needReload = false;
    let beforeEdit;

    try {
        const url = `/SOLEX/operator/api/workerReport/${wpoId}?page=0&size=${pageSize}`;
        const response = await fetch(url);
        const jsonData = await response.json();
        const list = Array.isArray(jsonData.list) ? jsonData.list : [];
        const totalQty = jsonData.wpoOcount ?? 0;

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
        const bsModal = bootstrap.Modal.getOrCreateInstance(modalEl);
        bsModal.show();

        modalEl.addEventListener('shown.bs.modal', () => {
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

            workerGrid.sort('wreDate', false);

            workerGrid.on('editingStart', ev => {
                if (ev.columnName === 'wreJcount' && (headerRow.wpoStatus !== 'wpo_sts_02' || headerRow.wpoStatus !== 'wpo_sts_03')) {
                    ev.stop();
                    showCustomAlert('생산중 상태에서만 수정 가능합니다.');
                }
                if (ev.columnName === 'wreJcount') {
                    beforeEdit = Number(workerGrid.getRow(ev.rowKey).wreJcount);
                }
            });

            workerGrid.on('editingFinish', async ev => {
                if (ev.columnName !== 'wreJcount') return;

                const row = workerGrid.getRow(ev.rowKey);
                const oldVal = beforeEdit;
                const newVal = Number(ev.value);

                if (newVal === oldVal) return;

                const wpoOcount = headerRow.wpoOcount;

                const otherSum = workerGrid.getData()
                    .filter(r => r.wpoId === row.wpoId && r.wreId !== row.wreId)
                    .reduce((acc, cur) => acc + Number(cur.wreJcount), 0);

                const totalAfterChange = otherSum + newVal;

                if (totalAfterChange > wpoOcount) {
                    showCustomAlert(`총 수량은 지시수량 ${wpoOcount}개를 초과할 수 없습니다. 현재 총합: ${totalAfterChange}`);
                    workerGrid.setValue(ev.rowKey, 'wreJcount', oldVal);
                    return;
                }

                const ok = await showCustomConfirm(`수량을 ${oldVal} ▶ ${newVal} 으로 저장하시겠습니까?`);
                if (!ok) {
                    workerGrid.setValue(ev.rowKey, 'wreJcount', oldVal);
                    return;
                }

                const body = {
                    wpoId: row.wpoId,
                    wreId: row.wreId,
                    newCount: newVal,
                };

                try {
                    const res = await fetch('/SOLEX/operator/api/workerCount', {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(body)
                    });

                    if (!res.ok) {
                        const msg = await res.text();
                        throw new Error(msg || res.status);
                    }

                    row.wreJcount = body.newCount;
                    needReload = true;

                } catch (e) {
                    showCustomAlert('저장 중 오류가 발생했습니다.');
                    console.error(e);
                    workerGrid.setValue(ev.rowKey, 'wreJcount', ev.oldValue);
                }
            });

            modalEl.addEventListener('hidden.bs.modal', async () => {
                if (needReload) {
                    currentPage = 0;
                    await List(currentPage);
                    needReload = false;
                }
            }, { once: true });

            sumGrid = new tui.Grid({
                el: document.getElementById('sumGrid'),
                bodyHeight: 260,
                rowHeaders: ['rowNum'],
                scrollX: false,
                data: sumArr,
                columns: [
                    { header: '사원번호', name: 'empNum', align: 'center', sortable: 'true', width: 120 },
                    { header: '이름', name: 'empNm', align: 'center', sortable: 'true', width: 120 },
                    { header: '총수량', name: 'qty', align: 'center', sortable: 'true' },
                    {
                        header: '작업비율', name: 'qtyRate', align: 'center', sortable: 'true',
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

            sumGrid.sort('qtyRate', /*ascending*/ false);

            document
                .getElementById('workerTab')
                .addEventListener('shown.bs.tab', e => {
                    const target = e.target.dataset.bsTarget;

                    if (target === '#tabDetail') workerGrid.refreshLayout();
                    if (target === '#tabSum') sumGrid.refreshLayout();
                });
        },
            { once: true }
        );
    } catch (e) {
        console.error(e);
        showCustomAlert('작업 내역을 불러오지 못했습니다.');
    }
}

function showCustomAlert(message) {
    const alertModalHtml = `
        <div class="modal fade" id="customAlertDialog" tabindex="-1" aria-labelledby="customAlertDialogLabel" aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content rounded-lg shadow-lg">
                    <div class="modal-header bg-blue-500 text-white rounded-t-lg">
                        <h5 class="modal-title text-lg font-semibold" id="customAlertDialogLabel">알림</h5>
                        <button type="button" class="btn-close text-white" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body p-6 text-gray-700">
                        <p>${message}</p>
                    </div>
                    <div class="modal-footer p-4 bg-gray-50 rounded-b-lg">
                        <button type="button" class="btn bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-md shadow-md transition duration-200 ease-in-out" data-bs-dismiss="modal">확인</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', alertModalHtml);
    const alertDialog = new bootstrap.Modal(document.getElementById('customAlertDialog'));
    alertDialog.show();
    document.getElementById('customAlertDialog').addEventListener('hidden.bs.modal', function (event) {
        this.remove();
    });
}

function showCustomConfirm(message) {
    return new Promise((resolve) => {
        const confirmModalHtml = `
            <div class="modal fade" id="customConfirmDialog" tabindex="-1" aria-labelledby="customConfirmDialogLabel" aria-hidden="true">
                <div class="modal-dialog modal-dialog-centered">
                    <div class="modal-content rounded-lg shadow-lg">
                        <div class="modal-header bg-blue-500 text-white rounded-t-lg">
                            <h5 class="modal-title text-lg font-semibold" id="customConfirmDialogLabel">확인</h5>
                            <button type="button" class="btn-close text-white" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body p-6 text-gray-700">
                            <p>${message}</p>
                        </div>
                        <div class="modal-footer p-4 bg-gray-50 rounded-b-lg">
                            <button type="button" class="btn bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-4 rounded-md shadow-md transition duration-200 ease-in-out" data-bs-dismiss="modal" id="confirmCancelBtn">취소</button>
                            <button type="button" class="btn bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-md shadow-md transition duration-200 ease-in-out" data-bs-dismiss="modal" id="confirmOkBtn">확인</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', confirmModalHtml);
        const confirmDialog = new bootstrap.Modal(document.getElementById('customConfirmDialog'));

        document.getElementById('confirmOkBtn').addEventListener('click', () => {
            resolve(true);
            confirmDialog.hide();
        });
        document.getElementById('confirmCancelBtn').addEventListener('click', () => {
            resolve(false);
            confirmDialog.hide();
        });

        confirmDialog.show();

        document.getElementById('customConfirmDialog').addEventListener('hidden.bs.modal', function (event) {
            this.remove();
        });
    });
}
