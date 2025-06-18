document.addEventListener('DOMContentLoaded', function() {
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
	    	return {
				data: res.data || [],  // 배열 강제 지정
				pagination: {
					page: res.pagination.page,
					totalCount: Number(res.pagination.totalCount)  // 숫자 변환
				}
			};
		  }
	    }
	  }
	},
    columns: [
	  { header: '상품코드', name: 'PRD_CD', align: 'center', hidden: true }, // 여기에 PRD_CD 추가
      { header: '상품명', name: 'PRD_NM', align: 'center', sortable: true , width: 200 },
//      { header: '가격', name: 'PRD_PRICE', align: 'center', sortable: true },
      { header: '유형', name: 'PRD_TYPE', align: 'center', sortable: true , width: 100 },
      { header: '단위', name: 'PRD_UNIT', align: 'center', sortable: true , width: 70 },
	  { header: '색상', name: 'PRD_COLOR', align: 'center', sortable: true , width: 70 },
	  { header: '사이즈', name: 'PRD_SIZE', align: 'center', sortable: true , width: 70 },
	  { header: '굽', name: 'PRD_HEIGHT', align: 'center', sortable: true, width: 70}
    ]
  });
  
  	// 행 클릭 시 상세공통코드 리스트 호출 함수 호출
	window.selectedOptId = null;
	
	prod_grid.on('focusChange', ev => {
		const rowKey = ev.rowKey;
		const rowData = prod_grid.getRow(rowKey);
		if (rowData && window.loadBomList) {
			selectedOptId = rowData.PRD_CD;
			window.loadBomList(rowData.PRD_CD);
//			const prdCd = rowData.PRD_CD;
//	        const optColor = rowData.opt_color_id;   // 실제 옵션 ID (예: 'opt_color_01')
//	        const optSize = rowData.opt_size_id;     // 실제 옵션 ID (예: 'opt_size_11')
//	        const optHeight = rowData.opt_height_id; // 실제 옵션 ID (예: 'opt_height_03')
//
//			window.loadBomList(prdCd, optColor, optSize, optHeight);
		}
	});
});
