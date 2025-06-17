document.addEventListener('DOMContentLoaded', () => {
	
	document.querySelector(".tab-btn[data-tab='process-tab']").click(); // 초기 탭 강제 실행
	
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
			if (selected === 'type-tab') {
				typeProcess.initProcessGrid();
			} else if (selected === 'process-tab') {
				window.process_grid.refreshLayout();
				window.process_grid.readData(1);
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
		data: {
			api: {
				readData: {
					url: '/SOLEX/process/data',
					method: 'GET',
					responseHandler: function(res) {
						console.log("서버 응답:", res);  // 콘솔로 확인
						debugger;

						return {
							result: true, // ❗❗ 이게 없으면 TOAST UI Grid는 무시함
							data: res.data || [],
							pagination: res.pagination || { page: 1, totalCount: 0 }
						};
					}
				}
			}
		},
		columns : [
			{ header: '순번', name: 'PRC_ID', editor: 'text', align: 'center' },
			{ header: '공정코드', name: 'PRC_CD', editor: 'text', align: 'center' },
			{ header: '공정명', name: 'PRC_NM', editor: 'text', align: 'center' },
			{ header: '공정설명', name: 'PRC_DES', editor: 'text', align: 'center' },
			{ header: '사용여부', name: 'PRC_YN', editor: 'text', align: 'center' }
		]
	});
	
	// ✅ 추가 버튼
	document.querySelector('#prs-add').addEventListener('click', () => {
		process_grid.prependRow({
			PRC_ID: '',
			PRC_CD: '',
			PRC_NM: '',
			PRC_DES: '',
			PRC_YN: '',
			__isNew: true  // 새 행 여부
		}, { focus: true });
	});
	
});