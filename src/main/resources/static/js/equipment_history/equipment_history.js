$(function() {
	//현재 페이지
	let currentPage = 0;
	
	//무한스크롤 보일 행 수 
	const pageSize = 20;

	// tui 그리드 가져오기 
	const grid = new tui.Grid({
		el: document.getElementById('grid'),
		bodyHeight: 500,
		scrollY: true,
		data: [],
		columns: [
			{ header: '설비 번호', name: 'eqp_id', align: 'center' },
			{ header: '설비 코드', name: 'eqp_code', sortable: 'true' , align: 'center'},
			{ header: '설비명', name: 'eqp_name', sortable: 'true' , align: 'center'}					
		]
	}); //0701 완 
	
	//설비수리이력 목록 조회
	async function equipmentList(page) {
			const response = await fetch(`/SOLEX/equipmenthistory?page=${page}&size=${pageSize}`);
			const rawData = await response.json();
			const data = rawData.map((row, idx) => ({
				eqp_id : row.EQP_ID, // id값 = 그냥 목록 순서 값 자동증가
				eqp_code: row.EQP_CODE,
				eqp_name: row.EQP_NAME
			}));
			
			//현재 페이지가 첫 페이진지(전자) 아닌지(후자) 판단 후 그리드에 데이터를 새로넣을지 : 붙일지 정하는 코드 
			page === 0 ? grid.resetData(data) : grid.appendRows(data);
			
			//페이지를 하나 불러왔으니 다음에 불러올때는 ++로 함 
			currentPage++;
			
			//데이터 길이보다 페이지 사이즈가 크면 스크롤 끝 
			if (data.length < pageSize) grid.off("scrollEnd");
	}

	equipmentList(currentPage);
	
	grid.on('scrollEnd', () => loadDrafts(currentPage));

	grid.on('click', (ev) => {
		if (ev.columnName === 'eqp_id') {
			const rowData = grid.getRow(ev.rowKey);
			openDetailModal(rowData);       
		}
	});
	
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
	
	let historyGrid = null;
	
	async function openDetailModal(row) {
		
	  	if (historyGrid) {               // 이전에 만들었던 그리드가 있으면
			historyGrid.destroy();         // DOM·이벤트 메모리 해제
	  	}
  
		historyGrid = new tui.Grid({
    		el: document.getElementById('historyGrid'),
    		bodyHeight: 400,
    		scrollY: true,
			data: [],
	      	columns: [
	  	        { header: '수리 시작일', name: 'startDate', sortable: true, align: 'center', width: 200 },
	  	        { header: '수리 종료일', name: 'endDate', sortable: 'true', align: 'center', width: 200 },
	  	        { header: '수리 사유', name: 'reason', align: 'center' }
	      	]
  		});

	  	/* 2) 데이터 조회 */
	  	try {
	    	const list = await fetchJson(
	      		`/SOLEX/equipmenthistory/equipment/${row.eqp_id}`
	    	);

    	const data = list.map((item) => ({
			// 공통 필드
	      	startDate     : item.STARTDATE,
      		endDate: item.ENDDATE,
      		reason     : item.REASON
    	}));

    	historyGrid.resetData(data);
	  	} catch (e) {
	    	console.error('재고 내역 조회 실패', e);
	    	historyGrid.resetData([]);
		}

	  	/* 3) 모달 오픈 & 그리드 레이아웃 갱신 */
	  	const modalEl = document.getElementById('detailModal');
	  	const modal   = bootstrap.Modal.getOrCreateInstance(modalEl);

  		modalEl.addEventListener('shown.bs.modal', function handle() {
    		historyGrid.refreshLayout();
    		modalEl.removeEventListener('shown.bs.modal', handle);
  		});

		modal.show();
	}		
	
	async function loadEquipmentOptions() {
	  const $sel = $('#eqhName');

	  // 이미 한 번 불러왔으면 재요청 생략
	  if ($sel.data('loaded')) return;

	  try {
	    const list = await fetchJson('/SOLEX/equipment/name', []);

	    list.forEach(eqp => {
	      $('<option>', {
	        value: eqp.ID,                // 실제 값 
	        text : eqp.NM      // 사용자에게 보이는 글자
	      }).appendTo($sel);
	    });

	    $sel.data('loaded', true);      // 플래그
	  } catch (err) {
	    console.error('설비 목록 로드 실패', err);
	    alert('설비 목록을 불러오지 못했습니다.');
	  }
	}
	
	/* 모달이 열릴 때 한 번만 호출 */
	$('#equipmentHistoryModal').on('show.bs.modal', loadEquipmentOptions);
	
	/* ── 설비 수리이력 등록 ─────────────────────────────────── */
	$('#submitEquipmentHistory').on('click', async function () {
		const $modal    = $('#equipmentHistoryModal');
	  	const eqpId     = $modal.find('#eqhName').val();           // 선택한 설비 ID
	  	const startDate = $.trim($modal.find('input[name="eqh_start"]').val());
	  	const endDate   = $.trim($modal.find('input[name="eqh_end"]').val());
		const reason    = $.trim($modal.find('#eqhReason').val()); // ★ 수리 사유

	  	/* --- 검증 --- */
	  	if (!eqpId)            { alert('설비를 선택하세요.'); return; }
	  	if (!startDate || !endDate) { alert('수리 시작·종료일을 입력하세요.'); return; }
	  	if (new Date(startDate) > new Date(endDate)) {
	    	alert('시작일이 종료일보다 늦을 수 없습니다.');
	    	return;
	  	}

	  	/* --- 서버로 전송할 데이터 --- */
	  	const payload = {
	    	eqpId     : eqpId,
	    	startDate : startDate,
	    	endDate   : endDate,
			reason    : reason
	  	};

	  	try {
	    	const res = await fetch('/SOLEX/equipmenthistory', {  // ← POST 엔드포인트
	  			method  : 'POST',
	      		headers : { 'Content-Type': 'application/json' },
	      		body    : JSON.stringify(payload)
	    	});
	    	if (!res.ok) throw new Error(`에러러러러러러`);

	    	alert('수리이력이 등록되었습니다.');
	    	$modal.modal('hide');

	    	// 목록 새로고침
	    	currentPage = 0;
	    	equipmentList(currentPage);
	  		} catch (err) {
	    		console.error('수리이력 등록 실패', err);
	    		alert('등록 중 오류가 발생했습니다.');
	  		}
		});
});