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
	      type: 'scroll', // 무한 스크롤 유지
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
                    data: dataArray,
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
		 
		  { header: '제품코드', name: 'PRD_ID', hidden: true },
		  { header: '옵션코드', name: 'OPT_ID', hidden: true },
	      { header: '가격', name: 'PRD_PRICE', hidden: true },
	      { header: '선택된유형', name: 'PRD_SELECTED_TYPE', hidden: true },
	      { header: '선택된단위', name: 'PRD_SELECTED_UNIT', hidden: true },
		  { header: '선택된색상', name: 'OPT_COLOR', hidden: true },
		  { header: '선택된굽', name: 'OPT_HEIGHT', hidden: true },
		  { header: '선택된사이즈', name: 'OPT_SIZE', hidden: true },
	      { header: '제품명', name: 'PRD_NM', align: 'left', sortable: true , width: 130, className: 'blue-text',
			filter: {
	            type: 'text',
	            showApplyBtn: true, // Apply 버튼을 보여줘서 사용자가 검색을 확정하도록 함
	            showClearBtn: true,
                // ⭐ 필터 적용 시 서버 데이터 재로드를 위한 readData 함수 추가
                // 이 함수가 호출되면 TUI Grid는 현재 필터 상태를 _filters 파라미터로 서버에 보냄
                readData: function(filterState) { // filterState 파라미터는 TUI Grid가 필터 정보를 전달할 때 사용
                    window.prod_grid.readData(1, true); // 첫 페이지부터 데이터 재로드 (필터링된 데이터)
                }
	        }
		  },
	      { header: '유형', name: 'PRD_TYPE', align: 'center', sortable: true,
            filter: 'select'
          },
	      { header: '단위', name: 'PRD_UNIT', align: 'center', sortable: true,
            filter: {
                type: 'select',
                showApplyBtn: true,
                showClearBtn: true,
                readData: function(filterState) {
                    window.prod_grid.readData(1, true);
                }
            }
          },
		  { header: '색상', name: 'PRD_COLOR', align: 'center', sortable: true,
            filter: {
                type: 'select',
                showApplyBtn: true,
                showClearBtn: true,
                readData: function(filterState) {
                    window.prod_grid.readData(1, true);
                }
            }
          },
		  { header: '사이즈', name: 'PRD_SIZE', align: 'center', sortable: true,
            filter: {
                type: 'select',
                showApplyBtn: true,
                showClearBtn: true,
                readData: function(filterState) {
                    window.prod_grid.readData(1, true);
                }
            }
          },
		  { header: '굽', name: 'PRD_HEIGHT', align: 'center', sortable: true,
            filter: {
                type: 'select',
                showApplyBtn: true,
                showClearBtn: true,
                readData: function(filterState) {
                    window.prod_grid.readData(1, true);
                }
            }
          }
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
   	}
	// 페이지 로드 시 초기 상태 설정
	updateBomButtonVisibility();

	   
	// 제품 체크박스 체크 이벤트 감지
	window.prod_grid.on('check', ev => {
	    const checkedRowData = window.prod_grid.getRow(ev.rowKey);
	});

	// 제품 체크박스 해제 이벤트 감지
	window.prod_grid.on('uncheck', ev => {
	    // ev.rowKey는 체크 해제된 행의 rowKey를 나타냅니다.

	    // 필요하다면 체크 해제된 행의 데이터를 가져와서 추가적인 로직을 수행할 수 있습니다.
	    const uncheckedRowData = window.prod_grid.getRow(ev.rowKey);
	    // 예시: 체크 해제된 상품의 ID를 배열에서 제거
	    // checkedProductIds = checkedProductIds.filter(id => id !== uncheckedRowData.PRD_ID);
	});

	// 제품 모두 체크
	window.prod_grid.on('checkAll', ev => {
	    // 모든 체크된 행의 데이터를 가져올 수 있습니다.
	    const allCheckedRows = window.prod_grid.getCheckedRows();
	    // console.log(allCheckedRows);
	});

	// 제품 모두 체크 해제 
	window.prod_grid.on('uncheckAll', ev => {
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
	
	// ⭐ 중요한 변경: 페이지 로드 시 데이터를 초기화하고 다시 불러오도록 함
    // 이렇게 하면 필터링 시에도 1페이지 데이터가 처음부터 로드됩니다.
    // 기존의 `resetData`와 `scrollTo`는 필요 없거나 문제가 될 수 있으므로 제거했습니다.
	if (window.prod_grid) {
	  // window.prod_grid.resetData([]); // 이 코드는 불필요하거나 문제 발생 가능성이 있어 제거
	  window.prod_grid.readData(1); // 페이지 로드 시 첫 페이지 데이터 로드
	  // 스크롤 관련 코드는 필터링 문제와는 관련 없으므로 제거 (필요시 다시 추가)
	  // setTimeout(() => {
	  //   const rowCount = window.prod_grid.getRowCount();
	  //   window.prod_grid.scrollTo(rowCount - 1);
	  // }, 300);
	}

});

// API 호출 함수
async function fetchOptions(groupCode) {
	try {
    	const res = await fetch(`/SOLEX/products/api/prdUnitTypes?groupCode=${groupCode}`);
    	const json = await res.json();
    	return json.data || [];
  	} catch (e) {
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

}