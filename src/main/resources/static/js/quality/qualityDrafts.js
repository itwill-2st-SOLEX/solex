$(function() {
	let currentPage = 0;
	const pageSize = 20;

	const grid = new tui.Grid({
		el: document.getElementById('grid'),
		bodyHeight: 500,
		scrollY: true,
		data: [],
		columns: [
			{ header: '번호', name: 'q_id', align: 'center' },
			{ header: '구분', name: 'q_type', sortable: 'true' , align: 'center'},
			{ header: '품질검사 명', name: 'q_nm', sortable: 'true' , align: 'center'}				
		]
	});
	
	async function loadDrafts(page) {
		try {
			const response = await fetch(`/SOLEX/quality?page=${page}&size=${pageSize}`);
			const rawData = await response.json();
			const data = rawData.map((row, idx) => ({
				q_id : page * pageSize + idx + 1,
				q_type: row.TP,
				q_nm: row.NM
			}));
			page === 0 ? grid.resetData(data) : grid.appendRows(data);
			currentPage++;

			if (data.length < pageSize) grid.off("scrollEnd");
		} catch (error) {
			console.error('창고 목록 조회 실패:', error);
		}
	}

	loadDrafts(currentPage);

	grid.on('scrollEnd', () => loadDrafts(currentPage));
	
	/**  공통: JSON 응답(fetch) ― 바디가 없으면 기본값 반환 */
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
	async function loadCatNames() {
		
		const $sel = $('#qtyCat');
		
		// 이미 한 번 불러왔으면 재요청 생략
		if ($sel.data('loaded')) return;
		
		try {
		    const list = await fetchJson('/SOLEX/code/quality', []);

		    list.forEach(qty => {
				$('<option>', {
		        	value: qty.ID,                // 실제 값 
		        	text : qty.NM      // 사용자에게 보이는 글자
		      	}).appendTo($sel);
		    });

		    $sel.data('loaded', true);      // 플래그
			
		} catch (err) {
			console.error('품질검사 항목 목록 로딩 실패', err);
			alert('품질검사 항목 목록 로딩 실패');
		}
	}
	
	
	const $materialModal  = $('#exampleModal');
	$materialModal .on('show.bs.modal', loadCatNames);   // 거래처
	
	$materialModal.on('hidden.bs.modal', function () {
		const $modal = $(this);
	
		// ① <form> 태그가 있다면 한 줄로 끝!
		$modal.find('form')[0]?.reset();
	
		// ② 별도 <form>이 없을 때는 각 요소를 개별 초기화
		$modal.find('input, textarea').val('');
		$modal.find('select').prop('selectedIndex', 0);   // 첫 옵션으로
	});
	
	// 품질검사 항목 등록
	$('#submitMaterial').on('click', async function () {
		
		const $modal    = $('#exampleModal');
		
		const qtyNm    = $.trim($modal.find('#qtyNm').val()); 
		const qtyCat  = $modal.find('#qtyCat').val(); 
				
		/* --- 검증 --- */
//	  	나중에 지피티 한테 물어봐서 유효성 검증 추가하삼

	  	/* --- 서버로 전송할 데이터 --- */
	  	const payload = {
	    	qtyCat : qtyCat,
	    	qtyNm : qtyNm
	  	};
				
		try {
	    	const res = await fetch('/SOLEX/quality', {  // ← POST 엔드포인트
	  			method  : 'POST',
	      		headers : { 'Content-Type': 'application/json' },
	      		body    : JSON.stringify(payload)
	    	});
	    	if (!res.ok) throw new Error(`에러러러러러러`);

	    	alert('품질검사 항목이 등록되었습니다@@');
	    	$modal.modal('hide');

	    	// 목록 새로고침
	    	currentPage = 0;
	    	loadDrafts(currentPage);
  		} catch (err) {
    		console.error('품질검사 항목 등록 실패', err);
    		alert('품질검사 항목 등록 실패');
  		}
	});		
	
});