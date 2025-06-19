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
				window.loadProcessOptions(() => {
					typeProcess.initProcessGrid();
				});
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
				{ header: '공정코드', name: 'PRC_CODE', editor: 'text', align: 'center', width: 200 },
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
					width: 100
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
			PRC_CODE: '',
			PRC_NM: '',
			PRC_DES: '',
			PRC_YN: '',
			DET_NM: '',
			QUA_NM: '',
			__isNew: true  // 새 행 여부
		}, { focus: true });
	});
	
	// ✅ 저장 버튼
	document.querySelector('#prs-save').addEventListener('click', () => {
		
		// 변경사항 추출
		const changes = process_grid.getModifiedRows();
	    const { createdRows, updatedRows } = changes;
		
		// 변경사항 없음 체크
		if (createdRows.length === 0 && updatedRows.length === 0) {
	        alert('변경된 내용이 없습니다.');
	        return;
	    }
		
		// 필드 검증
		const requiredFields = ['PRC_CODE', 'PRC_NM', 'PRC_DES', 'PRC_YN', 'DET_NM', 'QUA_NM'];
	    const invalidRows = [...createdRows, ...updatedRows].filter(row =>
	        requiredFields.some(field => !row[field])
	    );
	    if (invalidRows.length > 0) {
	        alert('필수 항목이 입력되지 않은 행이 있습니다.');
	        return;
	    }
		
		// 데이터 가공
	    const payload = {
	        createdRows: createdRows.map(row => ({
	            PRC_CODE: row.PRC_CODE,
	            PRC_NM: row.PRC_NM,
	            PRC_DES: row.PRC_DES,
				PRC_YN: row.PRC_YN,
				DET_NM: row.DET_NM,
				QUA_NM: row.QUA_NM
	        })),
			updatedRows: updatedRows.filter(row => !row.__isNew).map(row => {
				// 부서명 → 부서코드
				const det = window.departmentOptions.find(opt => opt.text === row.DET_NM);
				const qua = window.qualityOptions.find(opt => opt.text === row.QUA_NM);

				return {
					PRC_CODE: row.PRC_CODE,
					PRC_NM: row.PRC_NM,
					PRC_DES: row.PRC_DES,
					PRC_YN: row.PRC_YN,
					DET_NM: det ? det.value : row.DET_NM,   // 찾으면 코드, 없으면 기존 값 유지
					QUA_NM: qua ? qua.value : row.QUA_NM
				};
			})
	    };
		
		// ✅ 서버로 데이터 전송
		fetch('/SOLEX/process/save', {
			method: 'POST',
			headers: {
			'Content-Type': 'application/json'
			},
			body: JSON.stringify(payload)
		})
		.then(res => {
			if (!res.ok) throw new Error('저장 실패');
			return res.json();
		})
		.then(data => {
			alert('저장 완료!');
			location.reload();  // 저장 후 새로고침
		})
		.catch(err => {
			console.error(err);
			alert('저장 중 오류 발생');
		});
	});
	
	// ✅ 삭제버튼
	document.querySelector('#prs-delete').addEventListener('click', () => {
		
		const checkedRows = process_grid.getCheckedRows(); // ✔ row 전체 객체 가져옴
		if (checkedRows.length === 0) {
			alert('삭제할 행을 선택해주세요.');
			return;
		}

		// ✅ 새로 추가된 행만 필터링
		const onlyNewRowKeys = checkedRows
			.filter(row => row.__isNew)
			.map(row => row.rowKey);

		if (onlyNewRowKeys.length === 0) {
			alert('추가된 행만 삭제할 수 있습니다.');
			return;
		}
		
		onlyNewRowKeys
			.sort((a, b) => b - a)
			.forEach(rowKey => {
				process_grid.removeRow(rowKey);
			});
	});
	
});