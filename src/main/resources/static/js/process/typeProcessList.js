document.addEventListener('DOMContentLoaded', () => {

	window.typeProcess = {
		initProcessGrid: function () {
			if (window.type_list_grid && window.type_process_grid) return;

			// 제품유형 리스트 그리드
			window.type_list_grid = new tui.Grid({
				el: document.getElementById('type-list-grid'),
				bodyHeight: 600,
				scrollY: true,
				pageOptions: {
					useClient: false,
					type: 'scroll',
					perPage: 20
				},
				rowHeaders: [
					{ type: 'checkbox', width: 40 },
					{ type: 'rowNum', width: 40, header: 'No.' }
				],
				data: {
					api: {
						readData: {
							url: '/SOLEX/product/type/list',
							method: 'GET'
						}
					}
				},
				columns: [
					{ header: '제품유형ID',	name: 'DET_ID', hidden: true },
					{ header: '제품유형',	name: 'DET_NM', align: 'center' }
				]
			});

			// 제품유형별 공정순서 그리드
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
					{ header: '작업순서', name: 'PRC_ID', editor: 'text', sortable: true, align: 'center' }
				]
			});
		}
	};
});
