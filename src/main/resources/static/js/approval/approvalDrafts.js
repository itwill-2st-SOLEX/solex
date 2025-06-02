$(function() {
	let currentPage = 0;
	const pageSize = 20;

	const grid = new tui.Grid({
		el: document.getElementById('grid'),
		bodyHeight: 700,
		scrollY: true,
		data: [],
		columns: [
			{ header: '기안서 번호', name: 'doc_id' },
			{ header: '기안서 종류', name: 'doc_type' },
			{ header: '제목', name: 'doc_tt' },
			{ header: '결재상태', name: 'doc_sts' },
			{ header: '등록일', name: 'doc_reg_time' }
		]
	});

	async function loadDrafts(page) {
		try {
			const response = await fetch(`/SOLEX/approval/api/drafts?page=${page}&size=${pageSize}`);
			const rawData = await response.json();
			// 오라클에서 넘어오는 컬럼이 대문자라 소문자로 지정 
			const data = rawData.map(row => ({
				doc_id: row.DOC_ID,
				doc_type: row.DOC_TYPE,
				doc_tt: row.DOC_TT,
				doc_sts: row.DOC_STS,
				doc_reg_time: row.DOC_REG_TIME
			}));
			
			// 첫 페이지면 기존 데이터 초기화, 아니라면 추가
			if (page === 0) {
				grid.resetData(data);
			} else {
				grid.appendRows(data);
			}

			// 다음 페이지 번호 증가
			currentPage++;

			// 만약 데이터가 요청한 수보다 적으면(끝 도달) 스크롤 이벤트 해제
			if (data.length < pageSize) {
				grid.off('scrollEnd');
			}
		} catch (error) {
			console.error('기안서 목록 조회 실패:', error);
		}
	}

	// 최초 0페이지 데이터 로드
	loadDrafts(currentPage);

	// 그리드가 스크롤 끝에 도달했을 때 다음 페이지 로드
	grid.on('scrollEnd', () => {
		loadDrafts(currentPage);
	});
	
	// 그리드에서 기안서 id클릭시 모달 띄움
	grid.on('click', (ev) => {
		if (ev.columnName === 'doc_id') {
			const rowData = grid.getRow(ev.rowKey);
			openDetailModal(rowData);
		}
	});
	function openDetailModal(row) {
		$('#detailDocId').text(row.doc_id);
		$('#detailDocType').text(row.doc_type);
		$('#detailDocTt').text(row.doc_tt);
		$('#detailDocSts').text(row.doc_sts);
		$('#detailDocRegTime').text(row.doc_reg_time);
	
		const modal = new bootstrap.Modal(document.getElementById('detailModal'));
		modal.show();
	}
});

