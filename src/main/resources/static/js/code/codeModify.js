document.addEventListener('DOMContentLoaded', () => {
	
	// ✅ 추가 버튼
	document.querySelector('#code-add').addEventListener('click', () => {
		code_grid.prependRow({
			cod_id: '',
			cod_nm: '',
			cod_yn: '',
			__isNew: true  // 새 행 여부
		});
	});
	
	// ✅ 편집 시작 시 제어
	code_grid.on('editingStart', ev => {
		const row = code_grid.getRow(ev.rowKey);
		const isNew = row.__isNew;

		// 기존 행은 'cod_yn'만 수정 가능
		if (!isNew && ev.columnName !== 'cod_yn') {
			ev.stop();  // 편집 막기
		}

		// 새 행은 'cod_id', 'cod_nm', 'cod_yn'만 수정 가능
		if (isNew && ev.columnName === 'cod_reg_time') {
			ev.stop();  // 편집 막기
		}
	});
	
	const saveBtn = document.querySelector('#code-save');
	
	// ✅ 저장 버튼
	saveBtn.addEventListener('click', () => {
		const { createdRows, updatedRows } = code_grid.getModifiedRows();

		// 빈 항목 체크
		const isValid = [...createdRows, ...updatedRows].every(row =>
			row.cod_id && row.cod_nm && row.cod_yn
		);

		if (!isValid) {
			alert('필수 항목이 입력되지 않은 행이 있습니다.');
			return;
		}
		// ✅ insert할 행들
		const newRows = createdRows.map(row => ({
			cod_id: row.cod_id,
			cod_nm: row.cod_nm,
			cod_yn: row.cod_yn,
			cod_reg_time: row.cod_reg_time
		}));
		
		// ✅ update할 행들 (isNew = false 이면서 수정된 행들만)
		const modifiedRows = updatedRows.filter(row => !row.__isNew).map(row => ({
			cod_id: row.cod_id,
			cod_nm: row.cod_nm,
			cod_yn: row.cod_yn
		}));

		// ✅ 서버로 데이터 전송 (AJAX)
		fetch('/SOLEX/code/save', {
			method: 'POST',
			headers: {
			'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				insertList: newRows,
				updateList: modifiedRows
			})
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
	
	// ✅ 삭제 버튼
	document.querySelector('#code-delete').addEventListener('click', () => {
		const checkedRows = code_grid.getCheckedRows(); // ✔ row 전체 객체 가져옴
		if (checkedRows.length === 0) {
			alert('삭제할 행을 선택해주세요.');
			return;
		}

		// ✅ 새로 추가된 행만 필터링
		const onlyNewRowKeys = checkedRows
			.filter(row => row.__isNew)  // 새로 추가한 행만
			.map(row => row.rowKey);     // 삭제할 rowKey 추출

		if (onlyNewRowKeys.length === 0) {
			alert('추가된 행만 삭제할 수 있습니다.');
			return;
		}
		
		onlyNewRowKeys
			.sort((a, b) => b - a) // 큰 rowKey부터 삭제 → 안정성 확보
			.forEach(rowKey => {
				code_grid.removeRow(rowKey);	// ✅ 삭제 실행
			});
	});

});