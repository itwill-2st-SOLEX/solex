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
	
	// 날짜 변환 함수를 전역함수로 등록
	window.formatDateTime = formatDateTime;
	
	// 공통코드 그리드 생성
	window.code_grid = new tui.Grid({
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
			{ header: '코드', name: 'COD_ID', editor: 'text', sortable: true },
			{ header: '항목명', name: 'COD_NM', editor: 'text' },
			{ header: '사용여부',
				name: 'COD_YN',
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
			{ header: '등록일시', name: 'COD_REG_TIME' }
		]
	});
	
	// 행 클릭 시 상세공통코드 리스트 호출 함수 호출
	window.selectedCodId = null;
	
	code_grid.on('click', ev => {
		const rowKey = ev.rowKey;
		const rowData = code_grid.getRow(rowKey);
		if (rowData && window.loadDetailCode) {
			selectedCodId = rowData.COD_ID;
			window.loadDetailCode(rowData.COD_ID);
		}
	});

});