document.addEventListener('DOMContentLoaded', () => {

	let selectedDetId = null;
	
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
			
			// 제품유형 그리드 행 클릭 이벤트 -> 공정순서 조회
			type_list_grid.on('focusChange', ev => {
			    const rowKey = ev.rowKey;
			    const rowData = type_list_grid.getRow(rowKey);

			    if (rowData) {
			        selectedDetId  = rowData.DET_ID;

			        // 공정순서 목록 불러오기
			        loadTypeProcessList(selectedDetId);
			    }
			});
			
			// 공정순서 조회 함수
			function loadTypeProcessList(DET_ID) {
			    $.ajax({
			        url: '/SOLEX/typeProcess/list',
			        type: 'GET',
			        data: { DET_ID : DET_ID },
			        success: function (res) {
			            // 공정순서 그리드 초기화
			            type_process_grid.resetData(res);
			        },
			        error: function () {
			            alert('공정순서 조회에 실패했습니다.');
			        }
			    });
			}

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
				rowHeaders: [
					{ type: 'checkbox', width: 40 },
					{ type: 'rowNum', width: 40, header: 'No.' }
				],
				data: [],
				columns: [
					{ header: '공정코드', name: 'PRC_CD', editor: 'text', align: 'center', width: 150 },
					{ header: '공정명', name: 'PRC_NM', editor: 'text', align: 'center', width: 150 },
					{ header: '공정설명', name: 'PRC_DES', align: 'center', width: 350 },
					{ header: '작업순서', name: 'PCP_SEQ', editor: 'text', align: 'center', width: 120 }
				]
			});
			
			// ✅ 추가 버튼
			document.querySelector('#tp-add').addEventListener('click', () => {
				if (!selectedDetId) {
					alert('먼저 제품유형을 선택해주세요.');
					return;
				}
				
				type_process_grid.prependRow({
					PRC_CD: '',
					PRC_NM: '',
					PRC_DES: '',
					PCP_SEQ: '',
					__isNew: true  // 새 행 여부
				}, { focus: true });
			});
			
			// ✅ 추가 버튼
			document.querySelector('#tp-save').addEventListener('click', () => {
				if (!selectedDetId) {
					alert('먼저 제품유형을 선택해주세요.');
					return;
				}
			});
			
			// ✅ 삭제버튼
			document.querySelector('#tp-delete').addEventListener('click', () => {
				if (!selectedDetId) {
					alert('먼저 제품유형을 선택해주세요.');
					return;
				}
				
				const checkedRows = type_process_grid.getCheckedRows(); // ✔ row 전체 객체 가져옴
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
						type_process_grid.removeRow(rowKey);
					});
			});
		}
	};
});
