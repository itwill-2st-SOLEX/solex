document.addEventListener('DOMContentLoaded', () => {
	const codeList = window.codeList || [];  // HTML에서 넘겨준 데이터 (없으면 빈 배열)
	
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
	
	// 날짜 포맷을 적용한 리스트 만들기
	const formattedList = codeList.map(item => ({
		...item,
		cod_reg_time: formatDateTime(item.cod_reg_time),
		__isNew: false
	}));
	
	window.grid = new tui.Grid({
		el: document.getElementById('code-grid'),
		data: formattedList,
		bodyHeight: 300,
		rowHeaders: ['checkbox'],
		columns: [
			{ header: '코드', name: 'cod_id', editor: 'text' },
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
				}
			},
			{ header: '등록일시', name: 'cod_reg_time' }
		]
	});
	
	// 날짜 변환 함수를 전역함수로 등록
	window.formatDateTime = formatDateTime;
	
});