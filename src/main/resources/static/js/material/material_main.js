$(function() {
	let currentPage = 0;
	const pageSize = 30;

	const grid = new tui.Grid({
	    el: document.getElementById('grid'),
	    data: [], // 초기에는 빈 배열로 시작, scrollMoreClient 함수가 데이터를 채움
	    height: 600,
	    bodyHeight: 500,
	    autoWidth: true,
	    columns: [
			{ header: '자재ID', name: 'matId', align : 'center', sortable: true, width:90},
			{ header: '거래처ID', name: 'cliId', align : 'center', sortable: true, width:90},
	        { header: '자재코드', name: 'matCd', align : 'center', sortable: true},
	        { header: '자재명', name: 'matNm', align : 'center', filter: 'select'},
	        { header: '단위', name: 'matUnit', align : 'center', filter: 'select' , width:85},
	        { header: '가격', name: 'mat_price', align : 'center', filter: 'select', width:90, editor: 'text' },
	        { header: '설명', name: 'mat_comm', align : 'center', width:300, editor: 'text'},
	        { header: '등록일', name: 'matRegDate', align : 'center', sortable: true},
	        { header: '사용여부', name: 'mat_is_active', align : 'center' , sortable: true, width:75,
				editor: {
				    type: 'select',
				    options: {
				        listItems: [ //드롭다운 박스에 표시될 항목의 목록들
				            { text: '사용', value: 'Y' },
				            { text: '미사용', value: 'N' }
				        ]
				    }
				}, formatter: (ev) => { // 셀에 표시될 값을 화면에 맞게 변환
				    return ev.value === 'Y' ? '사용' : '미사용';
				}
			}
	    ]
	}); //tui 그리드 가져오기 끝

	// 자재 목록 조회
	async function loadDrafts(page) { //page번호를 인자로 받아 자재목록을 불러옴 (30개당 한페이지)

		const response = await fetch(`/SOLEX/material/materialList?page=${page}&size=${pageSize}`); // 백엔드api에 fetch요청 30명씩 끊어서 ...
		const rawData = await response.json(); // 받은 데이터를 필요한 형태로 가공
		const data = rawData.map(row => ({ // 이게 서버에서 받아온 사원정보 리스트(배열) 이런식으로 들어있음 //
			// .map()함수는 배열의 요소를 다른형태로 바꿔서 새 배열을 만든다는데 뭔말;
			// row는 객체를 하나씩 꺼내서 사용할 필드만 골라 새 객체를 만들어 넣음 (=그리드에 넣을 데이터를 원하는 형태로 변환)
		    matId: row.matId,
			cliId: row.cliId,
		    matCd: row.matCd,
		    matNm: row.matNm,
		    matUnit: row.matUnit,
			mat_price: row.matPrice,
			mat_comm: row.matComm,
			matRegDate: row.matRegDate,
			mat_is_active: row.matIsActive
		}));

		//현재 페이지가 첫 페이진지(전자) 아닌지(후자) 판단 후 그리드에 데이터를 새로넣을지 : 붙일지 정하는 코드
		page === 0 ? grid.resetData(data) : grid.appendRows(data);

		//페이지를 하나 불러왔으니 다음에 불러올때는 ++로 함
      	currentPage++;

		//데이터 길이보다 페이지 사이즈가 크면 스크롤 끝
      	if (data.length < pageSize) grid.off("scrollEnd");

  	}

	loadDrafts(currentPage); //최조 1페이지 로딩
	grid.on('scrollEnd', () =>  loadDrafts(currentPage)); // 스크롤 끝나면 다음 페이지 로딩

	/**
	 * 셀 유효성 검사 함수
	 * @description 유효성 검사에 실패하면 alert을 표시하고 값을 이전으로 되돌립니다.
	 * @returns {boolean} - 유효하면 true, 아니면 false
	 */
	function validateCell(grid, rowKey, columnName, value, oldValue) {
	    // 가격(mat_price) 유효성 검사
	    if (columnName === 'mat_price') {
	        const parsedValue = parseFloat(value);
	        if (isNaN(parsedValue) || parsedValue <= 0) {
	            alert('가격은 0보다 큰 숫자여야 합니다.');
	            // ★ 핵심 수정사항: 마지막 인자를 true로 변경하여 이벤트 재발생 방지
	            grid.setValue(rowKey, columnName, oldValue, true);
	            return false;
	        }
	    }

	    // 자재 설명(mat_comm) 유효성 검사
	    if (columnName === 'mat_comm') {
	        const trimmedValue = String(value || '').trim(); // null 이나 undefined 방지
	        if (!trimmedValue) {
	            alert('자재 설명 입력은 필수입니다.');
	            grid.setValue(rowKey, columnName, oldValue, true);
	            return false;
	        }
	        if (trimmedValue.length < 10) {
	            alert('자재 설명은 10글자 이상 입력해주세요.');
	            grid.setValue(rowKey, columnName, oldValue, true);
	            return false;
	        }
	    }

	    // 모든 유효성 검사를 통과한 경우
	    return true;
	}

	//테이블에서 바로 수정할 수 있는 코드
	grid.on('afterChange', async (ev) => {
	    for (const change of ev.changes) {
	        const { rowKey, columnName, value, oldValue } = change;

            // 값이 실제로 변경되지 않았다면(예: 이벤트가 중복 발생한 경우) 아무 작업도 하지 않음
            if (value === oldValue) {
                continue;
            }

	        // 1. 정의된 유효성 검사 함수를 호출
	        const is_valid = validateCell(grid, rowKey, columnName, value, oldValue);

	        // 2. 유효성 검사를 통과한 경우에만 백엔드 업데이트 실행
	        if (is_valid) {
	            const rowData = grid.getRow(rowKey);
	            const matId = rowData.matId;

	            const updatePayload = {
	                matId: matId,
	                n: columnName,
	                v: value
	            };

	            // 서버 전송 로직 (try-catch)
	            try {
	                const response = await fetch('/SOLEX/material/updateGridCell', {
	                    method: 'PUT',
	                    headers: {
	                        'Content-Type': 'application/json',
	                    },
	                    body: JSON.stringify(updatePayload)
	                });

					const resultText = await response.text();
					const result = resultText ? JSON.parse(resultText) : { status: 'success' };

	                if (response.ok && result.status === 'success') {
	                    console.log('Material update successful:', result);
	                    // 성공 알림은 사용자가 여러 번 수정할 때 불편할 수 있으므로 주석 처리하거나 제거하는 것을 권장합니다.
	                     alert('자재 정보가 성공적으로 업데이트되었습니다.');
	                } else {
	                    const message = result.message || '알 수 없는 오류가 발생했습니다.';
	                    console.error('Material update failed from server:', message);
	                    alert(`자재 정보 업데이트 실패: ${message}`);
	                    // ★ 수정사항: 실패 시 값을 되돌릴 때도 이벤트 재발생 방지
	                    grid.setValue(rowKey, columnName, oldValue, true);
	                }

	            } catch (error) {
	                console.error('Error updating material:', error);
	                alert(`자재 정보 업데이트 실패: ${error.message}`);
	                // ★ 수정사항: 에러 발생 시 값을 되돌릴 때도 이벤트 재발생 방지
	                grid.setValue(rowKey, columnName, oldValue, true);
	            }
	        }
	    }
	}); // 테이블 수정코드 fin

	/** 공통: JSON 응답(fetch) ― 바디가 없으면 기본값 반환 */
	async function fetchJson(url, defaultValue = null) {
	  const res = await fetch(url);

	  // 204 No Content 같이 바디가 없는 성공 응답
	  if (res.status === 204) return defaultValue;

	  if (!res.ok) throw new Error(`${url} 오류`);

	  const text = await res.text();       // 바로 json() 하지 말고 text() 로 읽음
	  if (!text) return defaultValue;      // Content-Length: 0 인 경우

	  return JSON.parse(text);
	}

	// 거래처 목록을 받아와 <select> 에 채워 주는 공통 함수
	async function loadClientNames() {

		const $sel = $('#cliId');

		// 이미 한 번 불러왔으면 재요청 생략
		if ($sel.data('loaded')) return;

		try {
		    const list = await fetchJson('/SOLEX/clients/name', []);

		    list.forEach(cli => {
				$('<option>', {
		        	value: cli.CLI_ID,                // 실제 값
		        	text : cli.CLI_NM      // 사용자에게 보이는 글자
		      	}).appendTo($sel);
		    });

		    $sel.data('loaded', true);      // 플래그

		} catch (err) {
		    	console.error('거래처 목록 로딩 실패', err);
		    	alert('거래처 목록 로딩 실패');
		}
	}

	// 거래처 목록을 받아와 <select> 에 채워 주는 공통 함수
	async function loadMaterialUnits() {

		const $sel = $('#matUnit');

		// 이미 한 번 불러왔으면 재요청 생략
		if ($sel.data('loaded')) return;

		try {
		    const list = await fetchJson('/SOLEX/material/code', []);

		    list.forEach(unit => {
				$('<option>', {
		        	value: unit.DET_ID,                // 실제 값
		        	text : unit.DET_NM      // 사용자에게 보이는 글자
		      	}).appendTo($sel);
		    });

		    $sel.data('loaded', true);      // 플래그

		} catch (err) {
		    	console.error('거래처 목록 로딩 실패', err);
		    	alert('자재 단위 목록 로딩 실패');
		}
	}



	const $materialModal  = $('#exampleModal');

	$materialModal .on('show.bs.modal', loadClientNames);   // 거래처
	$materialModal .on('show.bs.modal', loadMaterialUnits); // 자재 단위

	$materialModal.on('hidden.bs.modal', function () {
		  const $modal = $(this);

		  // ① <form> 태그가 있다면 한 줄로 끝!
		  $modal.find('form')[0]?.reset();

		  // ② 별도 <form>이 없을 때는 각 요소를 개별 초기화
		  $modal.find('input, textarea').val('');
		  $modal.find('select').prop('selectedIndex', 0);   // 첫 옵션으로
		});
	// 유효성 검사 해보쟛
	const matCdInput = document.getElementById('matCd');
	const matNmInput = document.getElementById('matNm');
	const cliIdSelect = document.getElementById('cliId');
	const matUnitSelect = document.getElementById('matUnit');
	const matCommInput = document.getElementById('matComm');
	const matPriceInput = document.getElementById('matPrice');


	//동일한 문자 반복 방지를 위한 함수임
	function hasTripleRepeats(str) {
	  // (.)\1{2,} : 어떤 문자(.)가(\1) 2번 이상({2,}) 더 반복되는 경우를 찾습니다.
	  const regex = /(.)\1{2,}/;
	  return regex.test(str);
	}

	// 유효성 검사 함수
	function validateForm() {
	    const matCd = matCdInput.value;
	    const matNm = matNmInput.value;
	    const cliId = cliIdSelect.value;
	    const matUnit = matUnitSelect.value;
	    const matPrice = matPriceInput.value;
	    const matComm = matCommInput.value;

	    // 1. 필수 입력 값 확인
	    if (!matCd || !matNm || !cliId || !matUnit || !matPrice || !matComm) {
	        alert('필수 입력 항목(*)을 모두 채워주세요.');
	        return false;
	    }

	    // 2. 자재코드 유효성 검사 (영문/숫자 4자리)
	    // -> 숫자 4자리로만 제한하려면 /^\d{4}$/ 로 변경
	    // -> 영어 4자리로만 제한하려면 /^[a-zA-Z]{4}$/ 로 변경
	    const matCdRegex = /^[a-zA-Z0-9]{4}$/;
	    if (!matCdRegex.test(matCd)) {
	        alert('자재코드는 영문 또는 숫자 4자리로 입력해야 합니다.');
	        matCdInput.focus();
	        return false;
	    }

	    // 3. 가격 유효성 검사
	    if (isNaN(matPrice) || Number(matPrice) < 1) {
	        alert('가격은 1 이상의 숫자만 입력 가능합니다.');
	        matPriceInput.focus();
	        return false;
	    }

		// 4. 설명 최소 10자 이상
		if(matComm.length < 10){
			alert('자재 설명은 최소 10자 이상 입력해주세요');
	        return false;
		}

		// 5. 설명(matComm) 연속 반복 글자 검사
		if (hasTripleRepeats(matComm)) {
		    alert('설명에 동일한 글자를 3번 이상 연속으로 사용할 수 없습니다.');
		    matCommInput.focus();
		    return false;
		}
	    // 모든 유효성 검사 통과
	    return true;
	}



	// 자재 등록
	$('#submitMaterial').on('click', async function () {

		const $modal    = $('#exampleModal');

		const matCd    = $.trim($modal.find('#matCd').val());
		const matNm    = $.trim($modal.find('#matNm').val());
		const cliId    = $modal.find('#cliId').val();
		const matUnit  = $modal.find('#matUnit').val(
		);
		const matComm    = $.trim($modal.find('#matComm').val());
		const matPrice    = $.trim($modal.find('#matPrice').val());

		/* --- 검증 --- */
//	  	나중에 지피티 한테 물어봐서 유효성 검증 추가하삼

	  	/* --- 서버로 전송할 데이터 --- */
	  	const payload = {
	    	matCd     : matCd,
	    	matNm : matNm,
	    	cliId   : cliId,
			matUnit    : matUnit,
			matComm   : matComm,
			matPrice    : matPrice
	  	};
		if(validateForm())	{
			console.log('유효성 검사 통과!');
	    	const res = await fetch('/SOLEX/material', {  // ← POST 엔드포인트
	  			method  : 'POST',
	      		headers : { 'Content-Type': 'application/json' },
	      		body    : JSON.stringify(payload)
	    	});

			if(res.ok){
		    	alert('자재가 등록되었습니다@@');
		    	$modal.modal('hide');

		    	// 목록 새로고침
		    	currentPage = 0;
		    	loadDrafts(currentPage);

			} else {
	    		alert('자재등록에 실패하셨습니다@@');
			}
		}
	});
});
