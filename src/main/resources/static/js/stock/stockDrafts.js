$(function() {
	let currentPage = 0;
	const pageSize = 20;

	const grid = new tui.Grid({
		el: document.getElementById('grid'),
		bodyHeight: 500,
		scrollY: true,
		data: [],
		columns: [
			{ header: '재고 번호', name: 'stk_id', align: 'center', renderer: { styles: { color: '#007BFF', textDecoration: 'underline', cursor: 'pointer' } } },
			{ header: '재고 구분', name: 'stk_type', sortable: 'true' , align: 'center'},
			{ header: '품목명', name: 'stk_nm', sortable: 'true' , align: 'center'},
			{ header: '재고량', name: 'stk_qty', align: 'center' },
			{ header: '단위', name: 'stk_unit', align: 'center' }						
		]
	});
	
	async function loadDrafts(page) {
		try {
			const response = await fetch(`/SOLEX/stock?page=${page}&size=${pageSize}`);
			const rawData = await response.json();
			const data = rawData.map((row, idx) => ({
				stk_id : page * pageSize + idx + 1,
				code: row.CODE,
				stk_type: row.NM,
				stk_nm: row.ITEM_NM,
				item_id: row.ITEM_ID,
				stk_qty: row.QTY,
				stk_unit: row.ITEM_UNIT
			}));
			page === 0 ? grid.resetData(data) : grid.appendRows(data);
			currentPage++;

			if (data.length < pageSize) grid.off("scrollEnd");
		} catch (error) {
			console.error('창고 목록 조회 실패:', error);
		}
	}

	loadDrafts(currentPage);

	grid.on('scrollEnd', () => loadDrafts(currentPage));

	grid.on('click', (ev) => {
		if (ev.columnName === 'stk_id') {
			const rowData = grid.getRow(ev.rowKey);
			const code = rowData.code;
			openDetailModal(rowData, code);       
		}
	});
	
	const STOCK_TITLES = {
	  area_type_01: '자재 재고',
	  area_type_02: '제품 재고'
	};

	/* ② 코드 → tui.Grid 컬럼 배열 */
	const STOCK_COLUMNS = {
	  area_type_01: [                     // 자재
	    { header: '번호',    name: 'mat_num',      align: 'center', width: 80 },
	    { header: '자재명',  name: 'item_nm',      align: 'center', sortable: true, filter: 'text' },
		{ header: '창고명',  name: 'warehouse_nm', align: 'center', width: 200, filter: 'select' },
		{ header: '구역명',  name: 'area_nm',      align: 'center', width: 80, filter: 'select' },
	    { header: '재고량',  name: 'qty',          align: 'center' },
		{ header: '단위',    name: 'item_unit',    align: 'center', width: 80, filter: 'select' }
	  ],
	  area_type_02: [                     // 제품
		{ header: '번호',    name: 'prd_num',      align: 'center', width: 80 },
	    { header: '제품명',  name: 'item_nm',      align: 'center', sortable: true, filter: 'text' },
		{ header: '색깔',    name: 'op_color',     align: 'center', filter: 'select' },
	    { header: '사이즈',  name: 'op_size',      align: 'center', filter: 'select' },
		{ header: '굽',      name: 'op_height',    align: 'center', filter: 'select' },
		{ header: '창고명',  name: 'warehouse_nm', align: 'center', width: 200, filter: 'select' },
		{ header: '구역명',  name: 'area_nm',      align: 'center', filter: 'select' },
	    { header: '재고량',  name: 'qty',          align: 'center', width: 80 },
		{ header: '단위',    name: 'item_unit',    align: 'center', width: 80, filter: 'select' }
	  ]
	};
	
	/**  공통: JSON 응답(fetch) ― 바디가 없으면 기본값 반환 */
	async function fetchJson(url, defaultValue = null) {
	  const res = await fetch(url);

	  // 204 No Content 같이 바디가 없는 성공 응답
	  if (res.status === 204) return defaultValue;

	  if (!res.ok) throw new Error(`${url} 오류`);

	  const text = await res.text();       // 바로 json() 하지 말고 text() 로 읽음
	  if (!text) return defaultValue;      // Content-Length: 0 인 경우

	  return JSON.parse(text);
	}

	let stockGrid = null;
			
	async function openDetailModal(row, code) {
	
		// 모달 타이틀
		  $('#detailModalLabel').text(STOCK_TITLES[code]);

		  /* 1) stockGrid 정리 & 새로 만들기 */
		  if (stockGrid) {               // 이전에 만들었던 그리드가 있으면
		    stockGrid.destroy();         // DOM·이벤트 메모리 해제
		  }
		  stockGrid = new tui.Grid({
		    el: document.getElementById('stockGrid'),
		    bodyHeight: 400,
		    scrollY: true,
		    data: [],
		    columns: STOCK_COLUMNS[code],
		  });

		  /* 2) 데이터 조회 */
		  try {
		    const list = await fetchJson(
		      `/SOLEX/stock/${row.item_id}?type=${code}`
		    );

		    const data = list.map((item, idx) => ({
		      // 공통 필드
		      item_nm     : item.ITEM_NM,
		      warehouse_nm: item.WAREHOUSE_NM,
		      area_nm     : item.AREA_NM,
		      qty         : item.QTY,
		      item_unit   : item.ITEM_UNIT,
		      op_color    : item.OP_COLOR,   // 자재일 땐 undefined → 자동으로 공백
		      op_size     : item.OP_SIZE,
		      op_height   : item.OP_HEIGHT,

		      // 타입별 번호 필드
		      mat_num     : code === 'area_type_01' ? idx + 1 : undefined,
		      prd_num     : code === 'area_type_02' ? idx + 1 : undefined,
		    }));

		    stockGrid.resetData(data);
		  } catch (e) {
		    console.error('재고 내역 조회 실패', e);
		    stockGrid.resetData([]);
		  }

		  /* 3) 모달 오픈 & 그리드 레이아웃 갱신 */
		  const modalEl = document.getElementById('detailModal');
		  const modal   = bootstrap.Modal.getOrCreateInstance(modalEl);

		  modalEl.addEventListener('shown.bs.modal', function handle() {
		    stockGrid.refreshLayout();
		    modalEl.removeEventListener('shown.bs.modal', handle);
		  });

		  modal.show();
	
	}		
			
		
});

		
//로그인한 사원정보 넣어주기
function fillEmployeeInfo() {
	$.ajax({
		url: '/SOLEX/approval/employee/info',
		type: 'GET',
		dataType: 'json',
		success: function(data) {
			$('#docEmp_id').val(data.EMP_ID).prop('disabled', true);
			$('#docEmp_nm').val(data.EMP_NM).prop('disabled', true);
			$('#docdept_nm').val(data.EMP_DEP_NM).prop('disabled', true);
			$('#docdept_team').val(data.EMP_TEAM_NM).prop('disabled', true);
			$('#docdept_position').val(data.EMP_POS_NM).prop('disabled', true);
		},
		error: function() {
			alert('사원 정보를 불러오지 못했습니다.');
		}
	});
}


// 날짜 추출하기
function attachDateRangeChange() {
	const input = document.getElementById('dateRange');
	if (!input) return;
	input.removeEventListener('change', onDateRangeChange);
	input.addEventListener('change', onDateRangeChange);
}

function onDateRangeChange() {
	const [startDate, endDate] = this.value.split(' to ');
	document.getElementById('startDate').value = startDate || '';
	document.getElementById('endDate').value = endDate || '';
}

// 주소 
function sample6_execDaumPostcode() {
	new daum.Postcode({
	    oncomplete: function(data) {
	        // 주소 변수
	        var addr = ''; // 주소
	        var extraAddr = ''; // 참고항목
	
	        // 사용자가 선택한 주소 타입에 따라 해당 주소 값을 가져온다.
	        if (data.userSelectedType === 'R') { // 도로명 주소
	            addr = data.roadAddress;
	        } else { // 지번 주소
	            addr = data.jibunAddress;
	        }
	
	        // 참고항목
	        if(data.userSelectedType === 'R'){
	            if(data.bname !== '' && /[동|로|가]$/g.test(data.bname)){
	                extraAddr += data.bname;
	            }
	            if(data.buildingName !== '' && data.apartment === 'Y'){
	                extraAddr += (extraAddr !== '' ? ', ' + data.buildingName : data.buildingName);
	            }
	            if(extraAddr !== ''){
	                extraAddr = ' (' + extraAddr + ')';
	            }
	            document.getElementById("sample6_extraAddress").value = extraAddr;
	        } else {
	            document.getElementById("sample6_extraAddress").value = '';
	        }
	
	        // 우편번호와 주소 정보를 해당 필드에 넣는다.
	        document.getElementById('sample6_postcode').value = data.zonecode;
	        document.getElementById("sample6_address").value = addr;
	
	        // 상세주소 입력칸으로 포커스 이동
	        document.getElementById("sample6_detailAddress").focus();
	    }
	}).open();
}