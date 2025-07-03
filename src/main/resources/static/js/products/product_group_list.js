document.addEventListener('DOMContentLoaded', function() {

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
