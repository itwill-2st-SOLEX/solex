$(function() {
	let currentPage = 0;
	const pageSize = 20;

	const grid = new tui.Grid({
		el: document.getElementById('grid'),
		bodyHeight: 600,
		scrollY: true,
		data: [],
		columns: [
			{ header: '지시 번호', name: 'doc_id', align: 'center' },
			{ header: '', name: 'doc_type', align: 'center', sortable: 'true' },
			{ header: '결재상태', name: 'doc_sts', sortable: 'true', align: 'center' },
			{ header: '등록일', name: 'doc_reg_time', align: 'center' }
		]
	});
	async function loadDrafts(page) {
		try {
			const response = await fetch(`/SOLEX/workOrder/list?page=${page}&size=${pageSize}`);
			const rawData = await response.json();
			const data = rawData.map(row => ({
				doc_id: row.DOC_ID,
				doc_type_code: row.DOC_TYPE_CODE,
				doc_type: row.DOC_TYPE,
				doc_sts: row.DOC_STS,
				doc_reg_time: row.DOC_REG_TIME
			}));
			page === 0 ? grid.resetData(data) : grid.appendRows(data);
			currentPage++;

			if (data.length < pageSize) grid.off("scrollEnd");
		} catch (error) {
			console.error('기안서 목록 조회 실패:', error);
		}
	}

	loadDrafts(currentPage);

	grid.on('scrollEnd', () => loadDrafts(currentPage));

	grid.on('click', (ev) => {
		if (ev.columnName === 'doc_id') {
			const rowData = grid.getRow(ev.rowKey);
			const docTypeCode = rowData.doc_type_code;
			openDetailModal(rowData, docTypeCode);
		}
	});
});