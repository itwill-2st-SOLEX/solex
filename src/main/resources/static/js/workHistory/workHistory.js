$(function() {
	let currentPage = 0;
	const pageSize = 20;

	const grid = new tui.Grid({
		el: document.getElementById('grid'),
		bodyHeight: 580,
		scrollY: true,
		data: [],
		rowHeaders: ['checkbox'],
		header: {
			height: 80,
			complexColumns: [
				{
					header: '옵션',
					name: 'optionGroup',
					childNames: ['prd_color', 'prd_size', 'prd_height']
				}
			]
		},
		columns: [
			{ header: '주문 상세 번호', name: 'odd_id', align: 'center' ,renderer: {
				styles: {
				  color: '#007BFF',
				  textDecoration: 'underline',
				  cursor: 'pointer'
				}
			  }},
			{ header: '제품코드', name: 'prd_code', align: 'center', filter: 'select' },
			{ header: '제품명', name: 'prd_nm', align: 'center', filter: 'select' },
			{ header: '진행현황', name: 'odd_sts', align: 'center', sortable: 'true'},
			{ header: '생산수량', name: 'odd_cnt', align: 'center', filter: 'select' },
			{ header: '제품컬러', name: 'prd_color', align: 'center', filter: 'select' },
			{ header: '제품 사이즈', name: 'prd_size', align: 'center', filter: 'select' },
			{ header: '굽 높이', name: 'prd_height', align: 'center', filter: 'select' },
			{ header: '납품 예정일', name: 'ord_end_date', align: 'center', sortable: 'true' },
		]
	});

	async function loadDrafts(page) {
		try {
			const response = await fetch(`/SOLEX/workHistory/api/list?page=${page}&size=${pageSize}`);
			const rawData = await response.json();
			const data = rawData.map(row => ({
				odd_id: row.ODD_ID,
				prd_code: row.PRD_CODE,
				prd_nm: row.PRD_NM,
				odd_sts: row.ODD_STS,
				odd_cnt: row.ODD_CNT,
				prd_color: row.PRD_COLOR,
				prd_size: row.PRD_SIZE,
				prd_height: row.PRD_HEIGHT,
				ord_end_date: row.ORD_END_DATE
			}));
			page === 0 ? grid.resetData(data) : grid.appendRows(data);
			currentPage++;
			if (data.length < pageSize) grid.off("scrollEnd");
		} catch (error) {
			console.error('기안서 목록 조회 실패:', error);
		}
	}

	loadDrafts(currentPage);

	grid.on('scrollEnd', () => loadDrafts(currentPage));

	// --- TUI Grid 자체의 'click' 이벤트 핸들러 (수정됨) ---
    grid.on('click', (ev) => {
        
        const clickedColumnName = ev.columnName; // 클릭된 컬럼의 이름

		const oddId = ev.nativeEvent.target.textContent;
		console.log("oddId:", oddId);

        // 만약 'odd_id' 컬럼을 클릭했을 때만 openSujuHistory를 호출하고 싶다면:
        if (clickedColumnName === 'odd_id') {
            openSujuHistory(oddId);
		} else {
			console.warn("odd_id 컬럼을 클릭했지만, 유효한 oddId를 찾을 수 없습니다.");
		}
    });
});



// 모달 열기 함수
async function openSujuHistory(oddId) {
	try {
		const response = await fetch(`/SOLEX/workHistory/api/${oddId}`);
		const data = await response.json();
		console.log(data);
		dataFormat(data);
		
	} catch (error) {
		console.error('에러:', error);
	}
	
	const modal = new bootstrap.Modal(document.getElementById('WorkHistoryModal'));
	modal.show();
}


async function dataFormat(data) {
	document.getElementById('exampleFormControlReadOnlyInput1').value = data.list[0].ODD_ID;
	document.getElementById('exampleFormControlReadOnlyInput2').value = data.list[0].PRD_CODE;
	document.getElementById('exampleFormControlReadOnlyInput3').value = data.list[0].PRD_NM;
	document.getElementById('exampleFormControlReadOnlyInput4').value = data.list[0].ODD_CNT;
	document.getElementById('exampleFormControlReadOnlyInput5').value = data.list[0].OPT_COLOR;
	document.getElementById('exampleFormControlReadOnlyInput6').value = data.list[0].OPT_SIZE;
	document.getElementById('exampleFormControlReadOnlyInput7').value = data.list[0].OPT_HEIGHT;
	
	const container = document.getElementById('StatusList');
	container.innerHTML = '';
	 const baseColors = [
        '#cce0ff', // 연한 파랑
        '#99c2ff', // 파랑
        '#66a3ff', // 진한 파랑
        '#3385ff', // 더 진한 파랑
        '#0d6efd'  // 가장 진한 파랑
    ];
	
	data.teamList.forEach((item, index) => {
		console.log(item);
        const step = document.createElement('div');
        step.classList.add('timeline-step');
		
		const startDate = formatter(item.WPO_START_DATE, true);
		const endDate = formatter(item.WPO_END_DATE, true);
        
        let backgroundColor = '#ccc'; // 기본 회색 (대기 상태)
        let borderColor = '#ccc';
        let textColor = '#333'; // 기본 글씨색

        // process.status는 서버에서 받아온 데이터에 'STATUS_CODE'와 같은 필드로 존재한다고 가정합니다.
        // 예를 들어, 백엔드에서 '대기', '진행중', '완료' 등의 상태 값을 내려준다고 가정합니다.
        switch (item.PRC_NM) {
            case '재단': // 대기 중인 상태 (회색조)
                backgroundColor = '#f0f0f0';
                borderColor = '#ddd';
                textColor = '#666';
                break;
            case '작업완료': // 진행 중인 상태 (파란색 그라데이션)
                // 인덱스에 따라 baseColors에서 색상 선택
                const colorIndex = Math.min(index, baseColors.length - 1);
                backgroundColor = baseColors[colorIndex];
                borderColor = baseColors[colorIndex];
                textColor = 'white';
                break;
            case '창고대기': // 완료된 상태 (초록색)
                backgroundColor = '#28a745'; // Bootstrap success green
                borderColor = '#28a745';
                textColor = 'white';
                break;
            default: // 알 수 없는 상태
                backgroundColor = '#ccc';
                borderColor = '#ccc';
                textColor = '#333';
                break;
        }

        step.innerHTML = `
            <div class="timeline-icon" style="background-color: ${backgroundColor}; border-color: ${borderColor}; color: ${textColor};">
                ${index + 1}
            </div>
            <div class="timeline-content">
                <div class="step-title">${item.PRC_NM}공정${item.WPO_TEAM_NM} <br><span id="workHistory_stEdDate">시작시간 : ${startDate} <br>종료시간 : ${endDate}</span></div>
            </div>
        `;
        container.appendChild(step);
    });
}
function formatter(date, includeTime = false) {
    let d = new Date(date);

    if (isNaN(d.getTime())) {
        console.warn("formatter: 유효하지 않은 날짜 값:", date);
        return ''; 
    }

    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');

    let result = `${year}-${month}-${day}`; 

    if (includeTime) {
        const timeParts = new Intl.DateTimeFormat('ko-KR', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true 
        }).formatToParts(d);

        const getPart = type => timeParts.find(p => p.type === type)?.value;

        const dayPeriod = getPart('dayPeriod');
        const hour = getPart('hour');
        const minute = getPart('minute');
        result += ` ${dayPeriod} ${hour}:${minute}`;
    }

    return result;
}