// 1. 원자재 목록을 서버에서 가져오기
let materialList = [];
document.addEventListener('DOMContentLoaded', async () => {
	try {
        const response = await fetch('/SOLEX/boms/api/materialList'); // 원자재 목록을 제공하는 API 엔드포인트
        const data = await response.json();
		
        materialList = data.map(item => ({
            text: item.MAT_NM, // select 박스에 보여질 텍스트
            value: item.MAT_ID,  // 실제 선택될 값 (예: 원자재 ID)
            unit: item.MAT_UNIT,  // 단위 정보를 추가로 저장 (자동 입력을 위해)
			id: item.MAT_ID
        }));
        // '선택하세요' 옵션 추가
        materialList.unshift({ text: '선택하세요', value: '', id: '', unit: '', comm: '' });
		
		
		// 그리드 생성
		window.bom_grid = new tui.Grid({
			el: document.getElementById('bom_grid'),
			bodyHeight: 600,
			rowHeaders: ['checkbox'],
			scrollX: true,
			scrollY: true,
			pageOptions: {
				useClient: false,
				type: 'scroll',
				perPage: 20
			},
			data: {
				api: {
					readData: {
						url: `/SOLEX/boms/api/bomList`,
						method: 'GET',
						initParams: {
							opt_id: '',
							keyword: ''
						},
						responseHandler: function(res) {
							return {
								data: res.data || [],
				        		pagination: {
									page: res.pagination.page,
									totalCount: Number(res.pagination.totalCount)
								}
							};
						}
					}
				},
				initialRequest: false
			},
			columns: [
				{ header: '봄ID', name: 'BOM_ID', hidden: true }, 
				{ header: '옵션코드', name: 'OPT_ID', hidden: true }, 
				{ header: '옵션코드', name: 'MAT_ID', hidden: true }, 
				{
	                header: '원자재',
	                name: 'MAT_NM', // 실제 그리드 데이터의 'MAT_NM'은 select에서 선택된 'value'가 됩니다.
	                align: 'left',
					width: 200,
	                sortable: true,
	                editor: {
	                    type: 'select',
						options: {
						            editor: MaterialSelectEditor
				        }
	                }
	            },
				{ header: '소모량', name: 'BOM_CNT', sortable: 'true',align : 'right' , width: 70, editor: 'text' },
				{ header: '단위', name: 'BOM_UNIT', sortable: 'true',align : 'center' , width: 80 },
				{ header: '설명', name: 'BOM_COMM', sortable: 'true',align : 'left' , width: 200, editor: 'text' },
				{ header: '등록일', name: 'BOM_REG_DATE', sortable: 'true',align : 'center', formatter: ({ value }) => window.formatDateTime(value), width: 90 },
				{ header: '수정일', name: 'BOM_MOD_DATE', sortable: 'true',align : 'center', formatter: ({ value }) => window.formatDateTime(value), width: 90 }
			]
		});
		
		// ⭐ 엑셀 붙여넣기 기능 추가
		document.getElementById('bom_grid').addEventListener('paste', (event) => {
		    event.preventDefault();

		    const clipboardData = event.clipboardData || window.clipboardData;
		    const pastedText = clipboardData.getData('text');

		    if (!pastedText) {
		        return;
		    }

		    const rows = pastedText.split('\n').filter(row => row.trim() !== '');
		    const newRowsDataToAppend = [];

		    rows.forEach(row => {
		        const columns = row.split('\t');
		        const matNmFromExcel = columns[0] ? columns[0].trim() : '';
		        const bomCntFromExcel = columns[1] ? columns[1].trim() : '';
		        const bomUnitFromExcel = columns[2] ? columns[2].trim() : '';
		        const bomCommFromExcel = columns[3] ? columns[3].trim() : '';

		        const selectedMaterial = materialList.find(item => item.text === matNmFromExcel);

		        newRowsDataToAppend.push({
		            BOM_ID: '', 
		            OPT_ID: window.selectedOptId || '',
		            MAT_NM: matNmFromExcel,
		            MAT_ID: selectedMaterial ? selectedMaterial.value : '',
		            BOM_CNT: bomCntFromExcel,
		            BOM_UNIT: selectedMaterial ? selectedMaterial.unit : bomUnitFromExcel,
		            BOM_COMM: bomCommFromExcel,
		            PRD_ID: window.selectedPrdId || '',
		            __pastedFromExcel: true // 임시 플래그 유지
		        });
		    });

		    if (newRowsDataToAppend.length > 0) {
		        // 기존 appendRows 사용. 이 시점에는 createdRows에 안 잡힐 수 있음.
		        window.bom_grid.appendRows(newRowsDataToAppend);

		        // ⭐ 핵심: appendRows 후, 새로 추가된 각 행의 데이터를 setRow로 다시 설정하여
		        // TUI Grid가 이를 변경으로 인식하고 createdRows에 포함시키도록 유도
		        const currentGridData = window.bom_grid.getData(); // 현재 그리드의 모든 데이터를 가져옴
		        const addedRowKeys = []; // 새로 추가된 행들의 rowKey를 저장할 배열

		        // __pastedFromExcel 플래그를 가진 행들을 찾아냄
		        currentGridData.forEach(row => {
		            if (row.__pastedFromExcel) {
		                addedRowKeys.push(row.rowKey);
		                // 플래그는 사용 후 삭제
		                delete row.__pastedFromExcel; 
		            }
		        });
		        

		        addedRowKeys.forEach(rowKey => {
		            const rowData = window.bom_grid.getRow(rowKey);
		            if (rowData) {
		                // setRow를 사용하여 해당 행의 모든 데이터를 다시 설정
		                // 이 동작은 TUI Grid에게 해당 행이 '변경'되었다고 강력하게 알립니다.
		                // 특히, 새로 추가된 행의 경우 이것이 '생성'된 것으로 간주될 확률이 높습니다.
		                window.bom_grid.setRow(rowKey, rowData, {
		                    // doContentsChange: true // 이 옵션은 v3.x에서 주로 사용, v4+에서는 생략 가능
		                    // noDataUpdateEvent: false // 기본값은 false, 즉 이벤트 발생
		                }); 
		            }
		        });
		        
		        // ⭐ 확인: 강제 설정 후 createdRows가 제대로 채워지는지 다시 확인
		        const { createdRows, updatedRows, deletedRows } = window.bom_grid.getModifiedRows();
		    }
		});
		
		
		
		
		// ⭐ 그리드 생성 후 바로 이벤트 리스너 등록
	    window.bom_grid.on('afterChange', (ev) => {
	        ev.changes.forEach(({ rowKey, columnName, value }) => {
	            if (columnName === 'MAT_NM') {
	                const selectedMaterial = materialList.find(item => String(item.value) === String(value));
	                if (selectedMaterial) {
						// ⭐ MAT_NM 컬럼에는 다시 '이름'을 표시 (사용자에게 보이는 값)
						window.bom_grid.setValue(rowKey, 'MAT_NM', selectedMaterial.text, false);
						// ⭐ 숨겨진 MAT_ID 컬럼에는 실제 ID를 저장 (DB 전송용)                        
						window.bom_grid.setValue(rowKey, 'MAT_ID', selectedMaterial.id, false);
						// BOM_UNIT 자동 채우기
	                    window.bom_grid.setValue(rowKey, 'BOM_UNIT', selectedMaterial.unit, false);
	                } else {
						// 선택 해제되거나 찾을 수 없을 경우 초기화
						window.bom_grid.setValue(rowKey, 'MAT_ID', '', false);
	                    window.bom_grid.setValue(rowKey, 'BOM_UNIT', '', false);
	                }
	            }
	        });
	    });
		
		window.loadBomList = function(opt_id) {
			if (!opt_id) return;
			window.selectedOptId = opt_id;
			// ✅ 기존 데이터 및 내부 상태 초기화
			window.bom_grid.resetData([]);
			// ✅ 첫 페이지부터 무한스크롤 다시 시작
			window.bom_grid.readData(1, { opt_id });
		};
		
    } catch (error) {
        // 에러 처리: 기본값 설정 또는 사용자에게 알림
    }
});