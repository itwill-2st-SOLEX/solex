document.addEventListener('DOMContentLoaded', () => {
	
	// 상세공통코드 그리드 생성
	window.codeDetail_grid = new tui.Grid({
		el: document.getElementById('codeDetail-grid'),
		bodyHeight: 300,
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
					url: '/SOLEX/detailCode/data',
					method: 'GET'
				}
			},
			initialRequest: false
		},
		columns: [
			{ header: '상세코드', name: 'DET_ID', editor: 'text', sortable: true },
			{ header: '항목명', name: 'DET_NM', editor: 'text' },
			{ header: '사용여부',
				name: 'DET_YN',
			  editor: {
					type: 'select',
					options: {
						listItems : [
							{text: 'y', value: 'y'},
							{text: 'n', value : 'n'}
						]
					}
				},
			  filter: {
			      type: 'select',
			      options: [
			        { label: '전체', value: '' },
			        { label: 'y', value: 'y' },
			        { label: 'n', value: 'n' }
			      ]
			    }
			},
			{ header: '정렬순서', name: 'DET_SORT', editor: 'text' }
		]
	});
	
	// 필터링 시 마다 재조회
	window.codeDetail_grid.on('filter', () => {
		codeDetail_grid.readData(1, { cod_id: selectedCodId });
	});
	
	// ✅ 공통코드 선택 시 호출
	window.loadDetailCode = function(cod_id) {
		if (!cod_id) return;
		window.selectedCodId = cod_id;

		// ✅ 기존 데이터 및 내부 상태 초기화
		window.codeDetail_grid.resetData([]);

		// ✅ 첫 페이지부터 무한스크롤 다시 시작
		window.codeDetail_grid.readData(1, { cod_id });
	};
	
});