document.addEventListener('DOMContentLoaded', () => {

	window.typeProcess = {
		initProcessGrid: function () {
			if (window.type_list_grid && window.type_process_grid) return;

			// 카테고리 리스트 그리드
			window.type_list_grid = new tui.Grid({
				el: document.getElementById('type-list-grid'),
				bodyHeight: 600,
				scrollY: true,
				pageOptions: {
					useClient: false,
					type: 'scroll',
					perPage: 20
				},
				data: [],
				columns: [
					{ header: '순번', name: 'PRC_ID', editor: 'text', sortable: true, align: 'center' },
					{ header: '카테고리명', name: 'PRC_ID', editor: 'text', sortable: true, align: 'center' }
				]
			});

			// 카테고리별 공정순서 그리드
			window.type_process_grid = new tui.Grid({
				el: document.getElementById('type-process-grid'),
				bodyHeight: 600,
				scrollY: true,
				pageOptions: {
					useClient: false,
					type: 'scroll',
					perPage: 20
				},
				data: [],
				columns: [
					{ header: '순번', name: 'PRC_ID', editor: 'text', sortable: true, align: 'center' },
					{ header: '공정코드', name: 'PRC_ID', editor: 'text', sortable: true, align: 'center' },
					{ header: '공정명', name: 'PRC_ID', editor: 'text', sortable: true, align: 'center' },
					{ header: '공정설명', name: 'PRC_ID', editor: 'text', sortable: true, align: 'center' },
					{ header: '작업순서', name: 'PRC_ID', editor: 'text', sortable: true, align: 'center' },
					{ header: '사용여부', name: 'PRC_ID', editor: 'text', sortable: true, align: 'center' }
				]
			});
		}
	};
});
