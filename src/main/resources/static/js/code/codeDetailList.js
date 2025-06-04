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
		data: {
			api: {
				readData: {
					url: '/SOLEX/code/data',
					method: 'GET',
					initParams: { cod_yn: '' },
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
			{ header: '상세코드', name: 'cod_id', editor: 'text', sortable: true },
			{ header: '항목명', name: 'cod_nm', editor: 'text' },
			{ header: '사용여부',
				name: 'cod_yn',
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
			{ header: '정렬순서', name: 'cod_reg_time' }
		]
	});
	
});