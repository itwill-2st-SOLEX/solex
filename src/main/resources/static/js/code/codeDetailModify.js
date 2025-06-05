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
			COD_ID: selectedCodId
		}, { focus: true });
	});

	// ✅ 저장 버튼
	document.getElementById('codeDetail-save').addEventListener('click', function() {
		if (!selectedCodId) {
		    alert('먼저 공통코드 그룹을 선택해주세요.');
		    return;
		}
		
		const invalidRows = [...changes.createdRows, ...updatedRows].filter(row =>
		  !row.DET_ID || !row.DET_NM || !row.DET_YN || !row.DET_SORT
		);
		if (invalidRows.length > 0) {
		  alert("필수 항목이 입력되지 않은 행이 있습니다.");
		  return;
		}
		
		const changes = codeDetail_grid.getModifiedRows();
		const updatedRows = changes.updatedRows.map(row => {
			if (!row.COD_ID) {
				const original = codeDetail_grid.getRow(row.rowKey);
				return { ...row, COD_ID: original.COD_ID };
			}
			return row;
		});
		
		// 저장 요청
		fetch('/SOLEX/detailCode/save', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				createdRows: changes.createdRows,
			    updatedRows: updatedRows
			})
		})
		.then(res => res.json())
		.then(result => {
			if (result.success) {
			alert('저장되었습니다!');
			codeDetail_grid.readData(1, { cod_id: selectedCodId }); // 데이터 재조회
			} else {
			alert('저장 실패!');
			}
		});
	});
	
});