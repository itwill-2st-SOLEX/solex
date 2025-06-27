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
	
	// ✅ 삭제 버튼
//	document.querySelector('#codeDetail-delete').addEventListener('click', () => {
//		const checkedRows = codeDetail_grid.getCheckedRows();
//		if (checkedRows.length === 0) {
//			alert('삭제할 행을 선택해주세요.');
//			return;
//		}
//
//		// ✅ 신규로 추가된 행만 필터링
//		const onlyNewRowKeys = checkedRows
//			.filter(row => row.__isNew)
//			.map(row => row.rowKey);
//
//		if (onlyNewRowKeys.length === 0) {
//			alert('추가된 행만 삭제할 수 있습니다.');
//			return;
//		}
//
//		onlyNewRowKeys
//			.sort((a, b) => b - a)
//			.forEach(rowKey => {
//				codeDetail_grid.removeRow(rowKey);
//			});
//	});
	
});