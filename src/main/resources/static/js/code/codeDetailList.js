document.addEventListener('DOMContentLoaded', () => {
	
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
		data: [],
		columns: [
			{ header: '상세코드', name: 'DET_ID', editor: 'text', sortable: true },
			{ header: '항목명', name: 'DET_NM', editor: 'text' },
			{ header: '사용여부',
				name: 'DET_YN',
			  editor: {
					type: 'select',
					options: {
						listItems : [
							{text: 'Y', value: 'Y'},
							{text: 'N', value : 'N'}
						]
					}
				},
			  filter: {
			      type: 'select',
			      options: [
			        { label: '전체', value: '' },
			        { label: 'Y', value: 'Y' },
			        { label: 'N', value: 'N' }
			      ]
			    }
			},
			{ header: '정렬순서', name: 'DET_SORT', editor: 'text' }
		]
	});
	
	window.loadDetailCode = function(cod_id) {
		fetch(`/SOLEX/detailCode/data?cod_id=${encodeURIComponent(cod_id)}`)
			.then(res => res.json())
			.then(resData => {
				// 서버 응답이 { data: { contents: [...] } } 구조라고 가정
				window.codeDetail_grid.resetData(resData.data.contents || []);
		});
	};
	
});