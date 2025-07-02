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
	
	/* ───────────────── 모달 열릴 때 제품, 자재 목록 캐싱 ───────────────── */
	$('#equipmentHistoryModal').on('show.bs.modal', async () => {
		if ((cache.material && cache.product) || loading) return; // 이미 캐시됐거나 로딩 중
	    loading = true;
	    try {
			const [matRes, prodRes] = await Promise.all([
				fetch("/SOLEX/material"),
				fetch("/SOLEX/product")
			]);
			if (!matRes.ok || !prodRes.ok) throw new Error();
			cache["area_type_01"] = await matRes.json();  // [{ID, NAME}, ...]
			cache["area_type_02"]  = await prodRes.json();
	    } catch (e) {
	      console.error("품목 목록 로드 실패", e);
	      alert("품목 목록을 불러오지 못했습니다.");
	    } finally {
	      loading = false;
	    }
	});
	
	/* ── 설비 수리이력 등록 ─────────────────────────────────── */
	$('#submitWarehouse').on('click', async function () {
		// 1) 모달 안의 값 읽기
		const $modal     = $('#equipmentHistoryModal');
		const eqpName    = $.trim($modal.find('#ephName').val());          // 설비명
		const startDate  = $.trim($modal.find('input[name="eqh_start"]').val());
		const endDate    = $.trim($modal.find('input[name="eqh_end"]').val());

	  // 2) 기본 검증
	  if (!eqpName)          { alert('설비명을 입력하세요.'); return; }
	  if (!startDate || !endDate) { alert('수리 시작·종료일을 입력하세요.'); return; }
	  if (new Date(startDate) > new Date(endDate)) {
	    alert('시작일이 종료일보다 늦을 수 없습니다.');
	    return;
	  }

	  // 3) 컨트롤러로 보낼 데이터 구성
	  const payload = {
	    eqpName   : eqpName,
	    startDate : startDate,
	    endDate   : endDate
	  };

	  try {
	    const res = await fetch('/SOLEX/equipmenthistory', {   // ← 컨트롤러 URL에 맞게 조정
	      method  : 'POST',
	      headers : { 'Content-Type': 'application/json' },
	      body    : JSON.stringify(payload)
	    });

	    if (!res.ok) throw new Error(`응답 코드: ${res.status}`);

	    // 4) 성공 처리: 모달 닫기 + 목록 새로고침
	    alert('수리이력이 등록되었습니다.');
	    $modal.modal('hide');

	    currentPage = 0;            // 첫 페이지부터 다시 로드
	    equipmentList(currentPage); // 목록 다시 불러오기
	  } catch (err) {
	    console.error('수리이력 등록 실패', err);
	    alert('등록 중 오류가 발생했습니다.');
	  }
	});
});