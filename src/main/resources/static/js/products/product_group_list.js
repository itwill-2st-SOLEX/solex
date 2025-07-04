document.addEventListener('DOMContentLoaded', function() {

	// BOM 관련 버튼들
   	const bomAddButton = document.getElementById('bom-add');
   	const bomSaveButton = document.getElementById('bom-save');
   	const bomSaveBatchButton = document.getElementById('bom-save-batch'); // 일괄 BOM 저장 버튼

	// 단일 제품 선택 시 해당 제품의 ID를 저장한다.
   	window.selectedPrdId = null;
   	window.selectedOptId = null;
	  
	// 날짜 포맷 함수
	function formatDateTime(str) {
	if (!str) return '';
	const date = new Date(str);
	const yyyy = date.getFullYear();
	const MM = String(date.getMonth() + 1).padStart(2, '0');
	const dd = String(date.getDate()).padStart(2, '0');
	const hh = String(date.getHours()).padStart(2, '0');
	const mm = String(date.getMinutes()).padStart(2, '0');
	return `${yyyy}-${MM}-${dd}`;
	}

	// 날짜 변환 함수를 전역함수로 등록
	window.formatDateTime = formatDateTime;

    window.prod_grid = new tui.Grid({
	    el: document.getElementById('prod-grid'),
	    bodyHeight: 600,
		rowHeaders: ['checkbox'],
	    scrollY: true,
	    pageOptions: {
	      useClient: false,
	      type: 'scroll',
	      perPage: 20
	    },
		data: {
		  api: {
		    readData: {
		      url: `/SOLEX/products/api/productList`,
		      method: 'GET',
			  initParams: {
				prd_yn: ''
			},
			  responseHandler: function(res) {
				const dataArray = res.data ? res.data.contents || [] : [];
				const paginationInfo = res.data ? res.data.pagination || { page: 1, totalCount: dataArray.length } : { page: 1, totalCount: 0 };

				return {
                    data: dataArray, // ⭐ 여기서 res.data.contents를 사용
                    pagination: {
                        page: paginationInfo.page,
                        totalCount: Number(paginationInfo.totalCount)
                    }
                };
			  }
		    }
		  }
		},
	    columns: [
		 
		  { header: '상품코드', name: 'PRD_ID', hidden: true },
		  { header: '옵션코드', name: 'OPT_ID', hidden: true },
	      { header: '가격', name: 'PRD_PRICE', hidden: true },
	      { header: '선택된유형', name: 'PRD_SELECTED_TYPE', hidden: true },
	      { header: '선택된단위', name: 'PRD_SELECTED_UNIT', hidden: true },
		  { header: '선택된색상', name: 'OPT_COLOR', hidden: true },
		  { header: '선택된굽', name: 'OPT_HEIGHT', hidden: true },
		  { header: '선택된사이즈', name: 'OPT_SIZE', hidden: true },
	      { header: '상품명', name: 'PRD_NM', align: 'left', sortable: true , width: 150,
			filter:
			{
	            type: 'text',
	            showApplyBtn: true,
	            showClearBtn: true
	        }
		  },
	      { header: '유형', name: 'PRD_TYPE', align: 'center', sortable: true ,
			filter:
			{
	            type: 'text',
	            showApplyBtn: true,
	            showClearBtn: true
	        }
		  },
	      { header: '단위', name: 'PRD_UNIT', align: 'center', sortable: true  },
		  { header: '색상', name: 'PRD_COLOR', align: 'center', sortable: true },
		  { header: '사이즈', name: 'PRD_SIZE', align: 'center', sortable: true },
		  { header: '굽', name: 'PRD_HEIGHT', align: 'center', sortable: true}
	    ]
	});

  	// 행 클릭 시 상세공통코드 리스트 호출 함수 호출
	window.selectedPrdId = null;

	prod_grid.on('focusChange', ev => {
		const rowKey = ev.rowKey;
		const rowData = prod_grid.getRow(rowKey);
		if (rowData && window.loadBomList) {
			selectedPrdId = rowData.PRD_ID;
			window.loadBomList(rowData.OPT_ID);
		}
	});

	// --- 더블클릭 이벤트 핸들링 (수정 모달) 추가 ---
	prod_grid.on('dblclick', ev => {
    	// 더블클릭된 행의 데이터를 가져옵니다.
       	const rowKey = ev.rowKey;
       	const rowData = prod_grid.getRow(rowKey);

       	if (rowData) {
           	console.log('행 더블클릭됨:', rowData);
           	// 여기에 제품 수정 모달을 띄우는 함수를 호출하고, rowData를 넘겨줍니다.
           	showProductModal('edit', rowData); // 예시 함수
       	}
  	});

    window.getCheckedOptIds = function() {
        const checkedRows = prod_grid.getCheckedRows();
        return checkedRows.map(row => row.OPT_ID);
    };
	
	
	// prod_grid의 체크박스 상태 변경 감지
   	if (window.prod_grid) { // prod_grid가 정의되어 있는지 확인
       	prod_grid.on('check', updateBomButtonVisibility);
       	prod_grid.on('uncheck', updateBomButtonVisibility);
       	prod_grid.on('checkAll', updateBomButtonVisibility);
       	prod_grid.on('uncheckAll', updateBomButtonVisibility);
   	} else {
       	// prod_grid가 나중에 초기화된다면, prod_grid 초기화 콜백에서 이 리스너들을 추가해야 합니다.
       	console.warn("prod_grid가 아직 초기화되지 않았습니다. 체크박스 이벤트 리스너를 나중에 등록해야 할 수 있습니다.");
   	}
	// 페이지 로드 시 초기 상태 설정
	updateBomButtonVisibility();

	   
	// 제품 체크박스 체크 이벤트 감지
	window.prod_grid.on('check', ev => {
	    // ev.rowKey는 체크된 행의 rowKey를 나타냅니다.
	    // ev.columnName은 'rowHeader'로, 체크박스 컬럼임을 나타냅니다.
	    console.log('체크됨:', ev.rowKey, '행 데이터:', window.prod_grid.getRow(ev.rowKey));

	    // 필요하다면 체크된 행의 데이터를 가져와서 추가적인 로직을 수행할 수 있습니다.
	    const checkedRowData = window.prod_grid.getRow(ev.rowKey);
	    // 예시: 체크된 상품의 ID를 배열에 추가
	    // checkedProductIds.push(checkedRowData.PRD_ID);
	});

	// 제품 체크박스 해제 이벤트 감지
	window.prod_grid.on('uncheck', ev => {
	    // ev.rowKey는 체크 해제된 행의 rowKey를 나타냅니다.
	    console.log('체크 해제됨:', ev.rowKey, '행 데이터:', window.prod_grid.getRow(ev.rowKey));

	    // 필요하다면 체크 해제된 행의 데이터를 가져와서 추가적인 로직을 수행할 수 있습니다.
	    const uncheckedRowData = window.prod_grid.getRow(ev.rowKey);
	    // 예시: 체크 해제된 상품의 ID를 배열에서 제거
	    // checkedProductIds = checkedProductIds.filter(id => id !== uncheckedRowData.PRD_ID);
	});

	// 제품 모두 체크
	window.prod_grid.on('checkAll', ev => {
	    console.log('모두 체크됨');
	    // 모든 체크된 행의 데이터를 가져올 수 있습니다.
	    const allCheckedRows = window.prod_grid.getCheckedRows();
	    // console.log(allCheckedRows);
	});

	// 제품 모두 체크 해제 
	window.prod_grid.on('uncheckAll', ev => {
	    console.log('모두 체크 해제됨');
	});
	
	// 첫화면에서는 저장버튼 숨김 
	bomSaveButton.style.display = 'none';
	bomSaveBatchButton.style.display = 'none';
	
	// 제품이 2개이상이면 단건 BOM 버튼 숨김.
	function updateBomButtonVisibility() {
		const checkedRows = window.prod_grid.getCheckedRows(); // prod_grid에서 체크된 행 가져오기
	    const checkedCount = checkedRows.length; // 체크된 행의 개수

		// 선택된 제품 ID 초기화
        window.selectedPrdId = null;
        window.selectedOptId = null;
		
	    if (checkedCount === 1) {
	        // 1개 선택 시
			const selectedRow = checkedRows[0]; // 체크된 유일한 행
           	window.selectedPrdId = selectedRow.PRD_ID; // 해당 행의 PRD_ID 설정
           	window.selectedOptId = selectedRow.OPT_ID; // 해당 행의 OPT_ID 설정

	        bomSaveButton.style.display = 'inline-block'; // 단건 저장 버튼 보이기
	        bomSaveBatchButton.style.display = 'none'; // 일괄 저장 버튼 숨기기
			
			// BOM 그리드에 해당 제품의 BOM 로드 (기존 loadBomList 함수 사용)
           	if (window.loadBomList && window.selectedOptId) {
               	window.loadBomList(window.selectedOptId);
           	}
	    } else if (checkedCount > 1) {
			const selectedRow = checkedRows[0]; // 체크된 첫 번째 행
            window.selectedPrdId = selectedRow.PRD_ID; // 해당 행의 PRD_ID 설정
            window.selectedOptId = selectedRow.OPT_ID; // 해당 행의 OPT_ID 설정

            // BOM 그리드에 첫 번째 체크된 제품의 BOM 로드 (이전과 동일하게 작동)
            if (window.loadBomList && window.selectedOptId) {
                window.loadBomList(window.selectedOptId);
            }
	        // 2개 이상 선택 시
	        bomSaveButton.style.display = 'none'; // 단건 저장 버튼 숨기기
	        bomSaveBatchButton.style.display = 'inline-block'; // 일괄 저장 버튼 보이기
	    } else {
	        // 모두 체크해제 하여 0개 선택 시
	        bomSaveButton.style.display = 'none';
	        bomSaveBatchButton.style.display = 'none';
			
			// selectedPrdId와 selectedOptId를 초기화하고 BOM 그리드를 비웁니다.
           	window.selectedPrdId = null;
           	window.selectedOptId = null;
	    }
	}
});

// API 호출 함수
async function fetchOptions(groupCode) {
	try {
    	const res = await fetch(`/SOLEX/products/api/prdUnitTypes?groupCode=${groupCode}`);
    	const json = await res.json();
    	return json.data || [];
  	} catch (e) {
    	console.error(`[${groupCode}] 옵션 로딩 실패`, e);
    	return [];
  	}
}

// selectpicker 채우기 함수
async function initAllOptionSelects() {
  	const colorOptions = await fetchOptions('opt_color');
  	const sizeOptions = await fetchOptions('opt_size');
  	const heightOptions = await fetchOptions('opt_height');

  	const colorSelect = $('#colorMultiSelect');
  	const sizeSelect = $('#sizeMultiSelect');
  	const heightSelect = $('#heightMultiSelect');

  	// 각 셀렉트 박스 초기화
  	colorSelect.empty();
  	sizeSelect.empty();
  	heightSelect.empty();

  	colorOptions.forEach(opt => {
    	colorSelect.append(`<option value="${opt.DET_ID}">${opt.DET_NM}</option>`);
  	});
  	sizeOptions.forEach(opt => {
    	sizeSelect.append(`<option value="${opt.DET_ID}">${opt.DET_NM}</option>`);
  	});
  	heightOptions.forEach(opt => {
    	heightSelect.append(`<option value="${opt.DET_ID}">${opt.DET_NM}</option>`);
  	});

  	// 비활성화 제거 + 새로고침
  	colorSelect.find('option').prop('disabled', false);
  	sizeSelect.find('option').prop('disabled', false);
  	heightSelect.find('option').prop('disabled', false);

  	colorSelect.selectpicker('render').selectpicker('refresh');
  	sizeSelect.selectpicker('render').selectpicker('refresh');
  	heightSelect.selectpicker('render').selectpicker('refresh');

  	console.log('✅ 드롭다운 초기화 완료');
}