document.addEventListener('DOMContentLoaded', () => {
	
	// 탭 이동 이벤트
	document.querySelectorAll(".tab-btn").forEach(button => {
		button.addEventListener("click", function () {
			const selected = this.dataset.tab;

			document.querySelectorAll(".tab-content").forEach(div => {
				div.style.display = div.id === selected ? "flex" : "none";
			});

			document.querySelectorAll(".tab-btn").forEach(btn => btn.classList.remove("active"));
			this.classList.add("active");
			
			// 탭에 따라 해당 그리드 초기화 또는 레이아웃 리프레시
			if (selected === 'category-process-tab') {
				initProcessGrid();
				window.category_list_grid.refreshLayout();
				window.category_process_grid.refreshLayout();
			} else if (selected === 'process-tab') {
				initProcessGrid();
				window.process_grid.refreshLayout();
			}
		});
	});
	
	// 공정정보 그리드
	window.process_grid = new tui.Grid({
		el: document.getElementById('process-grid'),
		bodyHeight: 600,
		scrollY: true,
		pageOptions: {
			useClient: false,
			type: 'scroll',
			perPage: 20
		},
		data: [],
		columns : [
			{ header: '순번', name: 'PRC_ID', editor: 'text', sortable: true, align: 'center' },
			{ header: '공정코드', name: 'PRC_ID', editor: 'text', sortable: true, align: 'center' },
			{ header: '공정명', name: 'PRC_ID', editor: 'text', sortable: true, align: 'center' },
			{ header: '공정설명', name: 'PRC_ID', editor: 'text', sortable: true, align: 'center' },
			{ header: '작업장명', name: 'PRC_ID', editor: 'text', sortable: true, align: 'center' },
			{ header: '사용여부', name: 'PRC_ID', editor: 'text', sortable: true, align: 'center' }
		]
	});
	
	function initProcessGrid() {
//		if (window.process_grid) return;
		// 카테고리 리스트 그리드
		window.category_list_grid = new tui.Grid({
			el: document.getElementById('category-list-grid'),
			bodyHeight: 600,
			scrollY: true,
			pageOptions: {
				useClient: false,
				type: 'scroll',
				perPage: 20
			},
			data: [],
			columns : [
				{ header: '순번', name: 'PRC_ID', editor: 'text', sortable: true, align: 'center' },
				{ header: '카테고리명', name: 'PRC_ID', editor: 'text', sortable: true, align: 'center' }
			]
		});
		
		// 카테고리별 공정순서 그리드
		window.category_process_grid = new tui.Grid({
			el: document.getElementById('category-process-grid'),
			bodyHeight: 600,
			scrollY: true,
			pageOptions: {
				useClient: false,
				type: 'scroll',
				perPage: 20
			},
			data: [],
			columns : [
				{ header: '순번', name: 'PRC_ID', editor: 'text', sortable: true, align: 'center' },
				{ header: '공정코드', name: 'PRC_ID', editor: 'text', sortable: true, align: 'center' },
				{ header: '공정명', name: 'PRC_ID', editor: 'text', sortable: true, align: 'center' },
				{ header: '공정설명', name: 'PRC_ID', editor: 'text', sortable: true, align: 'center' },
				{ header: '작업순서', name: 'PRC_ID', editor: 'text', sortable: true, align: 'center' },
				{ header: '사용여부', name: 'PRC_ID', editor: 'text', sortable: true, align: 'center' }
			]
		});
	}
			
});