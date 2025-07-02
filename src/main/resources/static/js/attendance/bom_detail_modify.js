document.addEventListener('DOMContentLoaded', () => {
	
	// ✅ 추가 버튼
	document.getElementById('codeDetail-add').addEventListener('click', function() {
		if (!selectedCodId) {
		    alert('먼저 공통코드 그룹을 선택해주세요.');
		    return;
		}
		
		codeDetail_grid.prependRow({
			DET_ID: '',
			DET_NM: '',
			DET_YN: '',
			DET_SORT: '',
			COD_ID: selectedCodId,
			__isNew: true
		}, { focus: true });
	});

	// ✅ 저장 버튼
	document.getElementById('codeDetail-save').addEventListener('click', function() {
		
		if (!selectedCodId) {
		    alert('먼저 공통코드 그룹을 선택해주세요.');
		    return;
		}
		
		// 변경사항 추출
		const changes = codeDetail_grid.getModifiedRows();
	    const { createdRows, updatedRows } = changes;
		
		// 변경사항 없음 체크
	    if (createdRows.length === 0 && updatedRows.length === 0) {
	        alert('변경된 내용이 없습니다.');
	        return;
	    }
		
		// 3. 필드 검증 (detail-specific)
		const requiredFields = ['DET_ID', 'DET_NM', 'DET_YN', 'DET_SORT'];
	    const invalidRows = [...createdRows, ...updatedRows].filter(row =>
	        requiredFields.some(field => !row[field])
	    );
	    if (invalidRows.length > 0) {
	        alert("필수 항목이 입력되지 않은 행이 있습니다.");
	        return;
	    }
		
		// 5. 데이터 가공 (detail-specific)
	    const processedUpdatedRows = updatedRows.map(row => {
	        if (!row.COD_ID) {
	            const original = codeDetail_grid.getRow(row.rowKey);
	            return { ...row, COD_ID: original.COD_ID };
	        }
	        return row;
	    });
		
		const payload = {
	        createdRows: createdRows,
	        updatedRows: processedUpdatedRows
	    };
		
		// 저장 요청
		fetch('/SOLEX/detailCode/save', {
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
			codeDetail_grid.clear();
			codeDetail_grid.readData(1, { cod_id: selectedCodId }); // 데이터 재조회
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
	document.querySelector('#codeDetail-delete').addEventListener('click', () => {
		const checkedRows = codeDetail_grid.getCheckedRows();
		if (checkedRows.length === 0) {
			alert('삭제할 행을 선택해주세요.');
			return;
		}

		// ✅ 신규로 추가된 행만 필터링
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
				codeDetail_grid.removeRow(rowKey);
			});
	});
	
});