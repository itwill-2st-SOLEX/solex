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
		
        console.log("DEBUG: materialList 로드 완료:", materialList); // Debug: materialList 확인
		
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
	                        listItems: materialList // 서버에서 가져온 데이터 사용
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
		
		// ⭐ 그리드 생성 후 바로 이벤트 리스너 등록
	    window.bom_grid.on('afterChange', (ev) => {
	        ev.changes.forEach(({ rowKey, columnName, value }) => {
	            if (columnName === 'MAT_NM') {
					console.log('MAT_NM 컬럼 변경 감지!'); // MAT_NM 변경 시 이 로그가 찍히는지 확인
	                const selectedMaterial = materialList.find(item => String(item.value) === String(value));
					console.log('Selected Material:', selectedMaterial); // 찾은 데이터 확인
	                if (selectedMaterial) {
						// ⭐ MAT_NM 컬럼에는 다시 '이름'을 표시 (사용자에게 보이는 값)
						window.bom_grid.setValue(rowKey, 'MAT_NM', selectedMaterial.text, false);
						// ⭐ 숨겨진 MAT_ID 컬럼에는 실제 ID를 저장 (DB 전송용)                        
						window.bom_grid.setValue(rowKey, 'MAT_ID', selectedMaterial.id, false);
						// BOM_UNIT 자동 채우기
	                    window.bom_grid.setValue(rowKey, 'BOM_UNIT', selectedMaterial.unit, false);
						console.log('DEBUG: Unit and Comm set.');
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
        console.error('원자재 목록을 가져오는데 실패했습니다:', error);
        // 에러 처리: 기본값 설정 또는 사용자에게 알림
    }
});