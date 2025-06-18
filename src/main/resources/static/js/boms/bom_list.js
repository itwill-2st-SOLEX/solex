document.addEventListener('DOMContentLoaded', () => {
	
	// 상세공통코드 그리드 생성
	window.bom_grid = new tui.Grid({
		el: document.getElementById('bom-grid'),
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
					url: `/SOLEX/boms/api/bomList`,
					method: 'GET',
					initParams: {
						opt_id: '',
						keyword: ''
					},
					responseHandler: function(res) {
						return {
							data: res.data || [],
			        		pagination: {
								page: res.pagination.page,
								totalCount: Number(res.pagination.totalCount)
							}
						};
					}
				}
			},
			initialRequest: false
		},
		columns: [
			{ header: 'BOM번호', name: 'bom_id', align : 'center' },
			{ header: '제품', name: 'opt_id',align : 'center', sortable: 'true' },
			{ header: '원자재', name: 'mat_id',align : 'center', sortable: 'true' },
			{ header: '소모량', name: 'bom_cnt', sortable: 'true',align : 'center' },
			{ header: '단위', name: 'bom_unit', sortable: 'true',align : 'center' },
			{ header: '설명', name: 'bom_comm', sortable: 'true',align : 'center' },
			{ header: '등록일', name: 'bom_reg_date', sortable: 'true',align : 'center' }
		]
	});
	window.loadBomList = function(opt_id) {
		
		if (!opt_id) return;
		window.selectedOptId = opt_id;
		// ✅ 기존 데이터 및 내부 상태 초기화
		window.bom_grid.resetData([]);
		// ✅ 첫 페이지부터 무한스크롤 다시 시작
		window.bom_grid.readData(1, { opt_id });
	};
	
//	// 검색기능
//	document.getElementById('codeDetail-search').addEventListener('keypress', (e) => {
//		if (e.key === 'Enter') {
//			triggerCodeDetailSearch();
//		}
//	});
//
//	function triggerCodeDetailSearch() {
//		const keyword = document.getElementById('codeDetail-search').value.trim();
//		
//		// 기존 데이터 초기화
//		codeDetail_grid.resetData([]);
//		
//		// readData 호출 (예: COD_ID 필요 시 selectedCodId도 같이 전달)
//		codeDetail_grid.readData(1, {
//			keyword: keyword,
//			cod_id: window.selectedCodId || ''
//		});
//	}
	
});