$(function() {
	let currentPage = 0;
	const pageSize = 20;

	const grid = new tui.Grid({
		el: document.getElementById('grid'),
		bodyHeight: 500,
		scrollY: true,
		data: [],
		columns: [
			{ header: '번호', name: 'q_id', align: 'center' },
			{ header: '구분', name: 'q_type', sortable: 'true' , align: 'center'},
			{ header: '품질검사 명', name: 'q_nm', sortable: 'true' , align: 'center'}				
		]
	});
	
	async function loadDrafts(page) {
		try {
			const response = await fetch(`/SOLEX/quality?page=${page}&size=${pageSize}`);
			const rawData = await response.json();
			const data = rawData.map((row, idx) => ({
				q_id : page * pageSize + idx + 1,
				q_type: row.TP,
				q_nm: row.NM
			}));
			page === 0 ? grid.resetData(data) : grid.appendRows(data);
			currentPage++;

			if (data.length < pageSize) grid.off("scrollEnd");
		} catch (error) {
			console.error('창고 목록 조회 실패:', error);
		}
	}

	loadDrafts(currentPage);

	grid.on('scrollEnd', () => loadDrafts(currentPage));
});