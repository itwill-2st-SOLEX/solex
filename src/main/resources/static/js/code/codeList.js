document.addEventListener('DOMContentLoaded', () => {
	
	// 날짜 포맷 함수
	function formatDateTime(str) {
	if (!str) return '';
	const date = new Date(str);
	const yyyy = date.getFullYear();
	const MM = String(date.getMonth() + 1).padStart(2, '0');
	const dd = String(date.getDate()).padStart(2, '0');
	const hh = String(date.getHours()).padStart(2, '0');
	const mm = String(date.getMinutes()).padStart(2, '0');
	return `${yyyy}-${MM}-${dd} ${hh}:${mm}`;
	}
	
	window.grid = new tui.Grid({
		el: document.getElementById('code-grid'),
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
			{ header: '코드', name: 'cod_id', editor: 'text', sortable: true },
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
			{ header: '등록일시', name: 'cod_reg_time' }
		]
	});

	// 날짜 변환 함수를 전역함수로 등록
	window.formatDateTime = formatDateTime;
	
});