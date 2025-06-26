$(function() {
	let currentPage = 0;
	const pageSize = 20;

	const grid = new tui.Grid({
		el: document.getElementById('grid'),
		bodyHeight: 500,
		scrollY: true,
		data: [],
		columns: [
			{ header: '재고 번호', name: 'stk_id', align: 'center' },
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
				code: row.code,
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
	    { header: 'LOT',    name: 'lot',  align: 'center', width: 100 },
	    { header: '자재명', name: 'name', align: 'center', sortable: true },
	    { header: '단위',   name: 'unit', align: 'center', width: 70 },
	    { header: '재고량', name: 'qty',  align: 'right' }
	  ],
	  area_type_02: [                     // 제품
	    { header: '모델',   name: 'model',  align: 'center', width: 120 },
	    { header: '옵션',   name: 'option', align: 'center' },
	    { header: '단위',   name: 'unit',   align: 'center', width: 70 },
	    { header: '재고량', name: 'qty',    align: 'right' }
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
	
		$('#detailModalLabel').text(STOCK_TITLES[code]);
		
		stockGrid = new tui.Grid({
		      el         : document.getElementById('stockGrid'),
		      bodyHeight : 400,
		      scrollY    : true,
		      rowHeaders : ['rowNum'],
		      columns    : STOCK_COLUMNS[code],   // 첫 타입의 컬럼으로
		      data       : []                     // 초기 빈 데이터
		});
		
		try {
		    const list = await fetchJson(
		      `/SOLEX/stock/${row.item_id}?type=${code}`, []
		    );

		    // API 응답을 컬럼에 맞게 매핑
		    const data = list.map(item => ({
		      lot   : item.LOT,
		      name  : item.MAT_NM,
		      unit  : item.MAT_UNIT,
		      qty   : item.QTY,

		      model : item.PRD_MODEL,
		      option: item.PRD_OPTION
		    }));

		    stockGrid.resetData(data);
		  } catch (e) {
		    console.error('재고 내역 조회 실패', e);
		    stockGrid.resetData([]);
		  }
		  
		  const modalEl = document.getElementById('detailModal');
		  const modal   = bootstrap.Modal.getOrCreateInstance(modalEl);
			
		  modalEl.addEventListener('shown.bs.modal', function handle() {
		  	stockGrid.refreshLayout();          // 스크롤·열 너비 재계산
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