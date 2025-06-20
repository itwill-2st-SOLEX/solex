document.addEventListener('DOMContentLoaded', () => {
	let selectedDetId = null;
	window.processOptions = []; // 공정 목록 저장용

	// 공정 리스트 불러오기 (콜백 기반)
	window.loadProcessOptions = function(callback) {
		$.ajax({
			url: '/SOLEX/process/list',
			method: 'GET',
			success: function(res) {
				window.processOptions = res.map(p => ({
					value: p.PRC_ID,
					text: p.PRC_NM,
					...p
				}));
				if (typeof callback === 'function') callback();
			},
			error: function() {
				alert('공정 목록을 불러오지 못했습니다.');
			}
		});
	}

	// 초기화 함수 정의
	function initGrids() {
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
				{ header: '제품유형ID', name: 'DET_ID', hidden: true },
				{ header: '제품유형', name: 'DET_NM', align: 'center' }
			]
		});

		// 제품유형 클릭 시 공정순서 조회
		window.type_list_grid.on('focusChange', ev => {
			const rowKey = ev.rowKey;
			const rowData = window.type_list_grid.getRow(rowKey);
			if (rowData) {
				selectedDetId = rowData.DET_ID;
				loadTypeProcessList(selectedDetId);
			}
		});

		// 공정순서 조회 함수
		function loadTypeProcessList(DET_ID) {
			// 콜백으로 processOptions 로드 완료 보장
			window.loadProcessOptions(() => {
				$.ajax({
					url: '/SOLEX/typeProcess/list',
					type: 'GET',
					data: { DET_ID: DET_ID },
					success: function(res) {
						window.type_process_grid.resetData(res);
					},
					error: function() {
						alert('공정순서 조회에 실패했습니다.');
					}
				});
			});
		}

		// 공정순서 그리드
		window.type_process_grid = new tui.Grid({
			el: document.getElementById('type-process-grid'),
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
			data: [],
			columns: [
				{ header: '공정ID', name: 'PRC_ID', hidden: true },
				{ header: '제품유형', name: 'PRD_TYPE', hidden: true },
				{ header: '공정코드', name: 'PRC_CODE', editable: false, align: 'center', width: 150 },
				{
					header: '공정명',
					name: 'PRC_NM',
					editor: {
						type: 'select',
						options: {
							listItems: processOptions
						}
					},
					formatter: ({ value }) => {
						const item = window.processOptions.find(p => String(p.value) === String(value));
						return item ? item.text : value;
					},
					align: 'center',
					width: 150
				},
				{ header: '공정설명', name: 'PRC_DES', editable: false, align: 'center', width: 350 },
				{ header: '작업순서', name: 'PCP_SEQ', editor: 'text', align: 'center', width: 120 }
			]
		});

		// 공정명 선택 시 공정코드, 설명 자동 입력
		window.type_process_grid.on('editingFinish', ev => {
			if (ev.columnName === 'PRC_NM') {
				const selectedValue = ev.value;
				const item = window.processOptions.find(p => String(p.value) === String(selectedValue));

				if (item) {
					// 해당 row의 공정코드 및 설명 자동 설정
					window.type_process_grid.setValue(ev.rowKey, 'PRC_CODE', item.PRC_CODE);
					window.type_process_grid.setValue(ev.rowKey, 'PRC_DES', item.PRC_DES);
				}
			}
		});

		// ✅ 추가 버튼
		document.querySelector('#tp-add').addEventListener('click', () => {
			if (!selectedDetId) {
				alert('먼저 제품유형을 선택해주세요.');
				return;
			}
			window.type_process_grid.appendRow({
				PRC_CODE: '',
				PRC_NM: '',
				PRC_DES: '',
				PCP_SEQ: '',
				__isNew: true
			}, { focus: true });
		});

		// ✅ 저장 버튼
		document.querySelector('#tp-save').addEventListener('click', () => {
			if (!selectedDetId) {
				alert('먼저 제품유형을 선택해주세요.');
				return;
			}

			const grid = window.type_process_grid;
			const { createdRows, updatedRows } = grid.getModifiedRows();
			const newOrEditedRows = [...createdRows, ...updatedRows];
			const allRows = grid.getData();

			let hasDuplicate = false;

			// ✅ 모든 셀에서 기존 오류 스타일 제거
			allRows.forEach((row, rowKey) => {
				grid.removeCellClassName(rowKey, 'PCP_SEQ', 'cell-error');
				grid.removeCellClassName(rowKey, 'PRC_NM', 'cell-error');
			});

			// ✅ 중복 체크 (신규/수정 행 vs 전체 행)
			newOrEditedRows.forEach(modifiedRow => {

				// 공정명 매핑
				const matched = window.processOptions.find(opt => String(opt.value) === String(modifiedRow.PRC_NM));
				if (matched) {
					modifiedRow.PRC_NM = matched.text;
					modifiedRow.PRC_CODE = matched.PRC_CODE;
					modifiedRow.PRC_DES = matched.PRC_DES;
				}

				// 중복 여부 개별 체크
				const isNameDuplicate = allRows.some(existingRow => {
					if (existingRow.rowKey === modifiedRow.rowKey) return false;
					return String(existingRow.PRC_NM).trim() === String(modifiedRow.PRC_NM).trim();
				});

				const isSeqDuplicate = allRows.some(existingRow => {
					if (existingRow.rowKey === modifiedRow.rowKey) return false;
					return String(existingRow.PCP_SEQ).trim() === String(modifiedRow.PCP_SEQ).trim();
				});

				console.log("🟢 이름중복:", isNameDuplicate, "🔵 순서중복:", isSeqDuplicate);

				// 중복 처리
				if (isNameDuplicate || isSeqDuplicate) {
					const rowKey = modifiedRow.rowKey; // 자기 자신에 표시
					if (isNameDuplicate) grid.addCellClassName(rowKey, 'PRC_NM', 'cell-error');
					if (isSeqDuplicate) grid.addCellClassName(rowKey, 'PCP_SEQ', 'cell-error');
					hasDuplicate = true;
				}

			});

			if (hasDuplicate) {
				alert('중복된 공정명 또는 작업순서가 있습니다. 확인해주세요.');

				return;
			}

			// ✅ 필수값 체크 (예: 공정명, 순서)
			const requiredFields = ['PRC_NM', 'PCP_SEQ'];
			const invalidRows = newOrEditedRows.filter(row =>
				requiredFields.some(field => !row[field] || row[field].toString().trim() === '')
			);

			if (invalidRows.length > 0) {
				alert('입력되지 않은 필수값이 있습니다.');
				return;
			}

			// ✅ 저장 payload 준비
			const payload = {
				createdRows: createdRows.map(row => ({
					DET_ID: selectedDetId,
					PRC_ID: row.PRC_ID,
					PRC_CODE: row.PRC_CODE,
					PRC_NM: row.PRC_NM,
					PRC_DES: row.PRC_DES,
					PCP_SEQ: row.PCP_SEQ
				})),
				updatedRows: updatedRows.map(row => ({
					DET_ID: selectedDetId,
					PRC_ID: row.PRC_ID,
					PRC_CODE: row.PRC_CODE,
					PRC_NM: row.PRC_NM,
					PRC_DES: row.PRC_DES,
					PCP_SEQ: row.PCP_SEQ
				}))
			};

			console.log("저장할 데이터 : ", payload);
		});

		// ✅ 삭제 버튼
		document.querySelector('#tp-delete').addEventListener('click', () => {
			if (!selectedDetId) {
				alert('먼저 제품유형을 선택해주세요.');
				return;
			}

			const checkedRows = window.type_process_grid.getCheckedRows();
			if (checkedRows.length === 0) {
				alert('삭제할 행을 선택해주세요.');
				return;
			}

			const onlyNewRowKeys = checkedRows.filter(row => row.__isNew).map(row => row.rowKey);
			if (onlyNewRowKeys.length === 0) {
				alert('추가된 행만 삭제할 수 있습니다.');
				return;
			}

			onlyNewRowKeys.sort((a, b) => b - a).forEach(rowKey => {
				window.type_process_grid.removeRow(rowKey);
			});
		});
	}

	// 최초 실행 시점에서 processOptions 준비 후 초기화
	window.typeProcess = {
		initProcessGrid: function() {
			if (window.type_list_grid && window.type_process_grid) return;
			loadProcessOptions(initGrids);
		}
	};
});
