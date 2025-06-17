document.addEventListener('DOMContentLoaded', async () => {
	
	// DOM 로드 시 부서명, 품질검사명 리스트 호출 
	await fetchDropdownOptions();
	
	// 부서, 품질검사명 호출 후 그리드 초기화
	initProcessGrid();
	
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
				window.process_grid.resetData([]);
				window.process_grid.readData(1);
			}
		});
	});
	
	// 부서명, 품질검사명 리스트 호출 함수
	async function fetchDropdownOptions() {
		const [depRes, quaRes] = await Promise.all([
			fetch('/SOLEX/department/list').then(res => res.json()),
			fetch('/SOLEX/quality/list').then(res => res.json())
		]);

		// 서버 응답을 TOAST UI Grid 형식으로 변환
		window.departmentOptions = depRes.map(dep => ({
			text: dep.DET_NM,
			value: dep.DET_ID
		}));
		
		window.qualityOptions = quaRes.map(qua => ({
			text: qua.QUA_NM,
			value: qua.QUA_ID
		}));
		
	}

	// 공정정보 그리드
	function initProcessGrid() {
		window.process_grid = new tui.Grid({
			el: document.getElementById('process-grid'),
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
						url: '/SOLEX/process/data',
						method: 'GET',
						responseHandler: function(res) {
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
				{ header: '공정코드', name: 'PRC_CD', editor: 'text', align: 'center', width: 200 },
				{ header: '공정명', name: 'PRC_NM', editor: 'text', align: 'center', width: 150 },
				{ header: '공정설명', name: 'PRC_DES', editor: 'text', align: 'center', width: 400 },
				{
					header: '사용여부',
					name: 'PRC_YN',
					editor: {
						type: 'select',
						options: {
							listItems : [
								{text: 'y', value: 'y'},
								{text: 'n', value : 'n'}
							]
						}
					},
					align: 'center',
					width: 100
				},
				{
					header: '사용부서',
					name: 'DET_NM',
					editor: {
						type: 'select',
						options: {
							listItems: window.departmentOptions
						}
					},
					formatter: ({ value }) => {
						const options = window.departmentOptions || [];
						const item = options.find(opt => String(opt.value) === String(value));
						return item ? item.text : value;
					},
					align: 'center',
					width: 150
				},
				{
					header: '실시검사',
					name: 'QUA_NM',
					editor: {
						type: 'select',
						options: {
							listItems: window.qualityOptions
						}
					},
					formatter: ({ value }) => {
						const options = window.qualityOptions || [];
						const item = options.find(opt => String(opt.value) === String(value));
						return item ? item.text : value;
					},
					align: 'center',
					width: 200
				}
			]
		});
	}
	// ✅ 추가 버튼
	document.querySelector('#prs-add').addEventListener('click', () => {
		process_grid.prependRow({
			PRC_CD: '',
			PRC_NM: '',
			PRC_DES: '',
			PRC_YN: '',
			DET_NM: '',
			QUA_NM: '',
			__isNew: true  // 새 행 여부
		}, { focus: true });
	});
	
});