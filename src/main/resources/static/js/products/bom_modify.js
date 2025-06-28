document.addEventListener('DOMContentLoaded', () => {
	
	// ✅ 추가 버튼
	document.getElementById('bom-add').addEventListener('click', function() {
		if (!selectedPrdId) {
		    alert('먼저 제품을 선택해주세요.');
		    return;
		}
		const optIdForNewRow = window.selectedOptId || ''; // 값이 없을 경우를 대비해 빈 문자열 등으로 초기화
		
		bom_grid.prependRow({
			BOM_ID: '',
			OPT_ID: optIdForNewRow ,
			MAT_ID: '',
			BOM_CNT: '',
			BOM_UNIT: '',
			BOM_COMM: '',
			PRD_ID: selectedPrdId,
			
			__isNew: true
		}, { focus: true });
	});

	// ✅ 저장 버튼
	document.getElementById('bom-save').addEventListener('click', function() {
		if (!selectedPrdId) {
		    alert('먼저 제품을 선택해주세요.');
		    return;
		}
		// 변경사항 추출
		const changes = bom_grid.getModifiedRows();
	    const { createdRows, updatedRows } = changes;
		
		// 변경사항 없음 체크
	    if (createdRows.length === 0 && updatedRows.length === 0) {
	        alert('변경된 내용이 없습니다.');
	        return;
	    }
		
		// 3. 필드 검증 (detail-specific)
		const requiredFields = ['MAT_NM', 'BOM_CNT', 'BOM_UNIT', 'BOM_COMM'];
	    const invalidRows = [...createdRows, ...updatedRows].filter(row =>
	        requiredFields.some(field => row[field] === '')
	    );
		console.log('invalidRows');
		console.log(invalidRows);
		
	    if (invalidRows.length > 0) {
	        alert("필수 항목이 입력되지 않은 행이 있습니다.");
	        return;
	    }
		
		// 5. 데이터 가공 (detail-specific)
	    const processedUpdatedRows = updatedRows.map(row => {
	        if (!row.BOM_ID) {
	            const original = bom_grid.getRow(row.rowKey);
	            return { ...row, PRD_ID: original.PRD_ID };
	        }
	        return row;
	    });
		
		const payload = {
	        createdRows: createdRows,
	        updatedRows: processedUpdatedRows
	    };
		
		// 저장 요청
		fetch('/SOLEX/boms/api/save', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(payload)
		})
		.then(res => {
	        if (!res.ok) throw new Error('저장 실패');
	        return res.json();
	    })
		.then(result => {
			if (result.success) {
			alert('저장되었습니다!');
			bom_grid.clear();
			bom_grid.readData(1, { opt_id: selectedOptId }); // 데이터 재조회
			} else {
			alert('저장 실패!');
			}
		})
		.catch(err => {
	        console.error(err);
	        alert('저장 중 오류 발생');
	    });;
	});
	
	// ⭐ 삭제 버튼 클릭 이벤트 리스너 추가 ⭐
    document.getElementById('bom-delete').addEventListener('click', async function() {
        // 1. 선택된 행의 데이터 가져오기
        const checkedRows = window.bom_grid.getCheckedRows();
        
        if (checkedRows.length === 0) {
            alert('삭제할 BOM을 선택해주세요.');
            return;
        }

        if (!confirm('선택된 BOM을 정말로 삭제하시겠습니까?')) {
            return; // 사용자가 '취소'를 누르면 중단
        }

        // 2. 선택된 BOM_ID 리스트 추출
        const bomIdsToDelete = checkedRows.map(row => row.BOM_ID);
        console.log('삭제할 BOM_ID 리스트:', bomIdsToDelete);

        try {
            // 3. 서버로 삭제 요청 전송 (DELETE 메서드)
            const response = await fetch('/SOLEX/boms/api/deleteBom', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(bomIdsToDelete) // JSON 배열 형태로 ID 전송
            });

            if (response.ok) {
                const result = await response.json();
                if (result.success) {
                    alert('선택된 BOM이 성공적으로 삭제되었습니다.');
                    // 4. 그리드 데이터 새로고침
                    // 현재 선택된 OPT_ID로 그리드를 다시 로드
                    if (window.selectedOptId) {
                        window.loadBomList(window.selectedOptId);
                    } else {
                        // OPT_ID가 없으면 전체 그리드 새로고침 (또는 적절한 초기화)
                        window.bom_grid.readData(); 
                    }
                } else {
                    alert('BOM 삭제에 실패했습니다: ' + (result.message || '알 수 없는 오류'));
                }
            } else {
                alert('서버 오류: BOM 삭제에 실패했습니다.');
            }
        } catch (error) {
            console.error('BOM 삭제 중 오류 발생:', error);
            alert('네트워크 오류 또는 요청 처리 중 문제가 발생했습니다.');
        }
    });
});