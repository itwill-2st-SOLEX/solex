$(function() {
	let currentPage = 0;
	const pageSize = 20;

	const grid = new tui.Grid({
		el: document.getElementById('grid'),
		bodyHeight: 500,
		scrollY: true,
		data: [],
		columns: [
			{ header: '창고 번호', name: 'whs_id', width:90, align: 'center', renderer: { styles: { color: '#007BFF', textDecoration: 'underline', cursor: 'pointer' } } },
			{ header: '창고명', name: 'whs_nm', sortable: 'true' , align: 'center'  },
			{ header: '주소', name: 'whs_full_adr', sortable: 'true' , align: 'center', width:390 },
			{ header: '구역 수', name: 'are_cnt', align: 'center' , width:90},
			{ header: '담당자 이름(사번)', name: 'emp_nm_id', align: 'center'  },
			{ header: '상태', name: 'whs_sts', align: 'center'  }						
		]
	});
	
	async function loadDrafts(page) {
		try {
			const response = await fetch(`/SOLEX/warehouse?page=${page}&size=${pageSize}`);
			const rawData = await response.json();
			const data = rawData.map(row => ({
				whs_id: row.ID,
				whs_nm: row.NM,
				whs_full_adr: row.FULL,
				are_cnt: row.CNT,
				emp_nm_id: row.EMP,
				whs_sts: row.STS
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

	grid.on('click', (ev) => {
		if (ev.columnName === 'whs_id') {
			const rowData = grid.getRow(ev.rowKey);
			openDetailModal(rowData);       
		}
	});
	
	let historyGrid = null;

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

	/* ───────────────── 구역 히스토리를 그리드에 표시 ───────────────── */
	async function renderAreaHistory(areaId) {
	    // areaId가 없으면 데이터를 비우고 상세 컬럼을 숨깁니다.
	    if (!areaId) {
	        historyGrid.resetData([]);
	        historyGrid.hideColumn('color');
	        historyGrid.hideColumn('size');
	        historyGrid.hideColumn('height');
	        return;
	    }

	    try {
	        // 1. 서버에서 원본 데이터를 가져옵니다.
	        const rawHistoryData = await fetchJson(`/SOLEX/warehouse/area/${areaId}/history`);

	        // 데이터가 없거나 비어있으면 그리드를 비우고 종료합니다.
	        if (!rawHistoryData || rawHistoryData.length === 0) {
	            historyGrid.resetData([]);
	            historyGrid.hideColumn('color');
	            historyGrid.hideColumn('size');
	            historyGrid.hideColumn('height');
	            return;
	        }

	        // 2. TUI Grid가 이해할 수 있는 형식으로 데이터를 매핑합니다. (대소문자 및 Key 이름 문제 해결)
	        const mappedData = rawHistoryData.map(row => ({
	            actionTime: row.ACTION_TIME || row.action_time,
	            status: row.STATUS || row.status,
	            itemName: row.ITEM_NAME || row.item_name,
	            quantity: row.QUANTITY || row.quantity,
	            unit: row.UNIT || row.unit,
	            color: row.OP_COLOR || row.op_color, // 'op_color' -> 'color'
	            size: row.OP_SIZE || row.op_size,     // 'op_size' -> 'size'
	            height: row.OP_HEIGHT || row.op_height, // 'op_height' -> 'height'
	            are_type: row.ARE_TYPE || row.are_type // 로직에서 사용할 타입 정보
	        }));

	        // 3. 매핑된 데이터의 첫 번째 행을 기준으로 구역 타입을 결정합니다.
	        const areaType = mappedData[0].are_type;

	        // 4. 구역 타입에 따라 상세 컬럼을 보여주거나 숨깁니다. (로직 수정)
	        if (areaType === 'area_type_01') { // 자재인 경우
	            historyGrid.hideColumn('color');
	            historyGrid.hideColumn('size');
	            historyGrid.hideColumn('height');
	        } else if (areaType === 'area_type_02') { // 제품인 경우
	            historyGrid.showColumn('color');
	            historyGrid.showColumn('size');
	            historyGrid.showColumn('height');
	        } else {
	            // 예외적인 경우, 모든 상세 컬럼을 숨깁니다.
	            historyGrid.hideColumn('color');
	            historyGrid.hideColumn('size');
	            historyGrid.hideColumn('height');
	        }
	        
	        // 5. 매핑된 데이터를 그리드에 설정합니다.
	        historyGrid.resetData(mappedData);

	    } catch (err) {
	        console.error(`구역(${areaId}) 이력 조회 실패`, err);
	        alert('이력 조회 중 오류가 발생했습니다.');
	        historyGrid.resetData([]); // 오류 발생 시 그리드 비우기
	    }
	}
			
	async function openDetailModal(row) {
		
		const $body = $("#detailModal .modal-body");

	 	/* 1) 모달 내부 HTML 골격 */
	  	$body.html(`
		    <div class="row g-3 mb-3">
				<div class="col-md-6">
		        	<label class="form-label fw-bold">창고명</label>
		        	<input type="text" id="d-whs-nm" class="form-control" disabled>
		      	</div>
		      	<div class="col-md-6">
		        	<label class="form-label fw-bold">담당자</label>
		        	<input type="text" id="d-whs-mgr" class="form-control" disabled>
		      	</div>
			</div>
	
			<div class="row g-3 mb-3">
				<div class="col-sm-4">
		        	<label class="form-label fw-bold">구역 선택</label>
		        	<select id="areaSelect" class="form-select"></select>
		      	</div>
			</div>
	
		    <div id="historyGrid" class="border"></div>
		`);

		// Grid 컬럼 설정은 모든 컬럼을 포함하여 정의합니다.
		// 나중에 데이터에 따라 동적으로 숨기거나 표시할 것입니다.
		historyGrid = new tui.Grid({
			el: document.getElementById('historyGrid'),
		    bodyHeight: 300,
		    scrollY: true,
		    autoWidth: true,
		    data: [],
		    columns: [
				{ header: '변동일시',   name: 'actionTime', align: 'center', width: 160 },
		      	{ header: '상태',       name: 'status',     align: 'center', width: 80 },
		      	{ header: '품명',       name: 'itemName',   align: 'center' },
		      	{ header: '수량',       name: 'quantity',   align: 'center', width: 80 },
				{ header: '단위',       name: 'unit',   align: 'center', width: 80 },
		      	{ header: '색상', name: 'color',    align: 'center' },
		      	{ header: '사이즈', name: 'size',    align: 'center' },
		      	{ header: '굽', name: 'height',    align: 'center' }
			]
		});

	  try {
	    /* 3) 창고 정보 + 구역 목록 가져오기 */
	    const detail = await fetchJson(`/SOLEX/warehouse/${row.whs_id}`);

	    $("#d-whs-nm").val(detail.WHS_NM || '');
	    $("#d-whs-mgr").val(detail.MGR_NM || '');

	    /* 4) 구역 select 채우기 */
	    const $sel = $("#areaSelect").empty();
	    (detail.AREAS || []).forEach(a =>
			$sel.append(`<option value="${a.AREA_ID}">${a.AREA_NM}</option>`));

	    if (!detail.AREAS || detail.AREAS.length === 0) {
			$sel.append('<option disabled selected>구역 없음</option>');
	      	await renderAreaHistory(null); // 구역이 없으면 null을 전달하여 그리드를 비우고 컬럼을 숨김
	    } else {
	      	// 첫 구역 히스토리
	      	await renderAreaHistory(detail.AREAS[0].AREA_ID);
	    }

	    /* 5) 구역 변경 이벤트 */
	    $sel.off('change').on('change', function () {
	      	renderAreaHistory(this.value);
	    });

	    /* 6) 모달 오픈 */
		const modalEl = document.getElementById('detailModal'); 
		const modal   = new bootstrap.Modal(modalEl);
		
		function handleShown() {
		  	historyGrid.refreshLayout();        // ← 핵심!
		  	modalEl.removeEventListener('shown.bs.modal', handleShown); // 이벤트 1회용
		}
		modalEl.addEventListener('shown.bs.modal', handleShown);

		modal.show();   

	  } catch (err) {
		console.error('상세 조회 실패', err);
	    alert('상세 조회 중 오류가 발생했습니다.');
	  }
	}
	
	/* ───────────────── 전역 상수/상태 ───────────────── */
	const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
	let   areaCount = 0;                    // 현재 구역 개수
	const $areaContainer = $("#areaContainer");

	/* 캐시: { area_type_01: [...], area_type_02: [...] } */
	const cache   = { area_type_01: null, area_type_02: null };
	let   loading = false;                 // 중복 요청 방지

	/* ───────────────── 구역 행 생성 ───────────────── */
	function createAreaRow(label) {
		return $(`
			<div class="row g-2 align-items-end mb-2 area-row">
	        <!-- 구역 이름 (readonly) -->
	        <div class="col-1 text-center fw-bold pt-2">
	          <span class="area-name">${label}</span>
	        </div>

	        <!-- 구분 셀렉트 -->
	        <div class="col-3">
	          <select class="form-select form-select-sm area-type" required>
	            <option value="" disabled selected>구역 구분</option>
	            <option value="area_type_01" data-code="area_type_01">자재</option>
	            <option value="area_type_02" data-code="area_type_02">제품</option>
	          </select>
	        </div>

	        <!-- 품목 셀렉트 -->
	        <div class="col-4">
	          <select class="form-select form-select-sm area-item" required disabled>
	            <option value="">먼저 구분을 선택하세요</option>
	          </select>
	        </div>

	        <!-- 최대 개수 -->
	        <div class="col-2">
	          <input type="number" class="form-control form-control-sm area-max"
	                 placeholder="최대개수" min="1" required>
	        </div>

	        <!-- 삭제 버튼 -->
	        <div class="col-2 text-end">
	          <button type="button" class="btn btn-outline-danger btn-sm del-area">
	            삭제
	          </button>
	        </div>
	      </div>
	    `);
	}

	  /* ───────────────── 구역 추가/삭제 ───────────────── */
	function addArea() {
		if (areaCount >= LETTERS.length) {
			alert("더 이상 구역을 추가할 수 없습니다."); return;
	    }
	    const label = LETTERS[areaCount++];
	    const $row  = createAreaRow(label);
	    if (label === "A") $row.find(".del-area").prop("disabled", true); // 첫 행 삭제 금지
	    $areaContainer.append($row);
	}
	
	$("#addAreaBtn").on("click", addArea);
	addArea(); // 초기 A행

	$areaContainer.on("click", ".del-area", function () {
		$(this).closest(".area-row").remove();
	    areaCount--;
	    // 레이블 다시 매기기
	    $areaContainer.find(".area-row").each((idx, row) => {
			$(row).find(".area-name").text(LETTERS[idx]);
		});
	});

	/* ───────────────── 모달 열릴 때 제품, 자재 목록 캐싱 ───────────────── */
	$('#warehouseModal').on('show.bs.modal', async () => {
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

	  /* ───────────────── 구분 선택 → 캐시에서 옵션 채우기 ───────────────── */
	$areaContainer.on("change", ".area-type", function () {
		const type  = $(this).val();                       
	    const list  = cache[type] || [];                   // 캐시된 배열
	    const $item = $(this).closest(".area-row")
	                         .find(".area-item")
	                         .prop("disabled", false);

		if (list.length === 0) {
			$item.html(`<option disabled>목록 없음</option>`).prop("disabled", true);
			return;
	    }
		
		const options = list.map(i =>
				  `<option value="${i.ID}">${i.NAME}</option>`
				).join("");
	    $item.html(`<option value="" disabled selected>선택</option>${options}`);
	});

	// 창고 등록
	$("#submitWarehouse")
		.off("click")                       // 혹시 남아 있던 바인딩 제거
		.on("click", async function (e) {
			e.preventDefault();               // 폼 submit 방지(필요 시)
		
			/* 1) 창고 기본 정보 */
			const whs_nm  = $('#whsName').val().trim();
			const whs_mgr = $('#whsManager').val().trim();
			const whs_pc  = $('#sample6_postcode').val().trim();
			const whs_add = $('#sample6_address').val().trim();
			const whs_da  = $('#sample6_detailAddress').val().trim();

			if (!whs_nm || !whs_mgr || !whs_pc || !whs_add || !whs_da) {
				alert('창고명·담당자·주소를 모두 입력하세요.');
			    return;
			}

			/* ② 구역(AREA) 정보 수집·검증 */
			const areas = [];
			let valid = true;

			$('#areaContainer .area-row').each(function (idx) {
				const $row     = $(this);
			    const area_tp  = $row.find('.area-type').val();   // material | product
			    const item_id  = $row.find('.area-item').val();   // 품목 ID
			    const max_cnt  = $row.find('.area-max').val();    // 최대 수량

			    if (!area_tp || !item_id || !max_cnt) {           // 하나라도 빠지면 중단
					valid = false;
					return false;                                   // each 탈출
		    	}

				areas.push({
					area_nm : LETTERS[idx],       // A, B, C …
					area_tp,                      // material | product
					item_id,                      // 품목 ID
					max_cnt : Number(max_cnt)
				});
			});

			if (!valid) {
				alert('모든 구역의 구분·품목·최대개수를 입력하세요.');
				return;
			}

		 	 /* ③ 서버 전송(Map<String,Object>로 받을 수 있도록 JSON 직렬화) */
			try {
				const res = await fetch('/SOLEX/warehouse', {
					method  : 'POST',
					headers : { 'Content-Type': 'application/json' },
					body : JSON.stringify({
						whs_nm,
						whs_mgr,
						whs_pc,
						whs_add,
						whs_da,
						areas
					})
				});

			if (!res.ok) throw new Error('response not ok');
			alert('창고가 성공적으로 등록되었습니다!');
			bootstrap.Modal.getInstance(
				document.getElementById('warehouseModal')
			).hide();
			location.reload();          // 목록 새로고침
			} catch (err) {
				console.error('창고 등록 실패:', err);
				alert('등록 중 오류가 발생했습니다. 다시 시도해 주세요.');
			}
		});
		
});