$(function() {
	let currentPage = 0;
	const pageSize = 20;

	const grid = new tui.Grid({
		el: document.getElementById('grid'),
		bodyHeight: 500,
		scrollY: true,
		data: [],
		columns: [
			{ header: '창고 번호', name: 'whs_id' },
			{ header: '창고 이름', name: 'whs_nm', sortable: 'true' },
			{ header: '위치', name: 'whs_1', sortable: 'true' },
			{ header: '구역', name: 'whs_2' },
			{ header: '담당자', name: 'whs_3' },
			{ header: '상태', name: 'whs_4' }
		]
	});

	async function loadDrafts(page) {
		try {
			const response = await fetch(`/SOLEX/warehouse?page=${page}&size=${pageSize}`);
			const rawData = await response.json();
			const data = rawData.map(row => ({
				whs_id: row.DOC_ID,
				whs_nm: row.DOC_TYPE_CODE,
				whs_id: row.DOC_TYPE,
				whs_id: row.APL_STS,
				whs_id: row.DOC_REG_TIME,
				whs_id: row.APL_STEP_NO,
				whs_id: row.APL_ID
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
//			const docTypeCode = rowData.doc_type_code;
//			openDetailModal(rowData, docTypeCode);
		}
	});

	// 동적화면구성 - 창고에서도 필요한가? 화면이 바뀌진 않는데
	const formTemplates = `
  			<div class="doc-type01">
  				<div id="emp-nm" class="mb-3">
  					<label class="form-label">사번</label>
					<input type="text" class="form-control" id="docEmp_id" name="emp_id" />
					<input type="hidden" name="emp_id">
  				</div>
				<div id="emp-nms" class="mb-3">
					<label class="form-label">성명</label>
					<input type="text" id="docEmp_nm" class="form-control" name="emp_nm" />
				</div>
  			</div>
  			<div class="doc-type01">
  				<div id="dept-nm" class="mb-3">
  					<label class="form-label">부서</label>
  					<input type="text" class="form-control" id="docdept_nm" name="emp_dep_nm" />
  				</div>
  				<div id="dept-teams" class="mb-3">
  					<label class="form-label">팀</label>
  					<input type="text" class="form-control" id="docdept_team" name="emp_team_nm" />
  				</div>
  			</div>
			<div class="doc-type01">
				<div id="job-posits" class="mb-3">
					<label class="form-label">직급</label>
					<input type="text" class="form-control" id="docdept_position" name="emp_pos_nm"/>
				</div>
				<div id="dates" class="date mb-3">
					<label class="form-label">날짜</label>
					<input type="text" id="dateRange" class="form-control" name="dbdaterange" placeholder="휴가기간 선택">
					<input type="hidden" name="lea_start_date" id="startDate">
					<input type="hidden" name="lea_end_date" id="endDate">
				</div>
			</div>
  			<div class="btn-group" role="group" aria-label="반차 연차 선택">
  				<input type="radio" class="btn-check" name="lea_type" id="businessTrip" value="반차" checked>
  				<label class="btn btn-purple" for="businessTrip">반차</label>
  				
  				<input type="radio" class="btn-check" name="lea_type" id="fieldWork" value="연차">
  				<label class="btn btn-purple" for="fieldWork">연차</label>
  			</div>
  			<div class="mb-3">
  				<label class="form-label">제목</label>
  				<input type="text" class="form-control" id="docTitle" name="lea_tt" placeholder="50자내로 입력"  maxlength="50"/>
  			</div>
  			<div class="mb-3">
  				<label class="form-label">사유</label>
  				<textarea class="form-control" id="docContent" name="lea_con" rows="4"></textarea>
  			</div>
	`;

	// 창고 등록
	document.querySelectorAll('.submit-btn').forEach(btn => {
	    btn.addEventListener('click', async () => {
	        const docId  = btn.dataset.docId;     // ex) 123
	        const action = btn.dataset.action;
			const stepNo    = btn.dataset.aplStepNo; 
			const aplId     = btn.dataset.aplId;      

	        try {
	            const res = await fetch(`/SOLEX/warehouse`, {
	                method : 'POST',
	                headers: {
	                    'Content-Type': 'application/json'
	                },
	                body: JSON.stringify({
	                    // === 요청 바디 예시 ===
	                    123   : action,      // 결재 결과
	                    123  : aplId,
						123 : stepNo,
	                    123    : action === 'apl_sts_03'
	                                  ? '사유를 입력하세요'
	                                  : null,
						
	                })
	            });

	            if (!res.ok) throw new Error(`HTTP ${res.status}`);
	            // 성공 시 알림 & 새로고침
	            alert('처리되었습니다 🙌');
	            window.location.reload();
	        } catch (err) {
	            console.error(err);
	            alert('처리 중 오류가 발생했습니다');
	        }
	    });
	});

	
	// 상세조회 모달
	async function openDetailModal(row, docTypeCode) {
		const formTemplates = commonTemplate;
		const form = document.querySelector("#detailModal .modal-body");
		
		form.innerHTML = formTemplates;
		form.querySelectorAll("input, textarea, select").forEach(el => {
			el.disabled = true;
		});

		try {
			const response = await fetch(`/SOLEX/warehouse/${row.whs_id}`);
			if (!response.ok) throw new Error("상세 조회 실패");

			const data = await response.json();

			// 일반 input, textarea, select 값 주입
			for (const [key, value] of Object.entries(data)) {
				const el = form.querySelector(`[name="${key.toLowerCase()}"]`);
				if (el) el.value = value;
			}
			// list 로 가져오기 싫어서 sql에서 처리
			const nameList = (data.APL_EMP_POS_NM || "").split(",");
			const statusList = (data.APL_STS || "").split(",");
			const timeList = (data.APL_ACTION_TIME || "").split(",");
			debugger;
			// thead 구성
			const theadRow = document.querySelector(".approval-line thead tr");
			theadRow.innerHTML = "";

			const headLabel = document.createElement("th");
			headLabel.innerText = " ";
			theadRow.appendChild(headLabel);

			nameList.forEach(pos => {
				const th = document.createElement("th");
				th.innerText = pos;
				theadRow.appendChild(th);
			});

			// tbody 구성
			const tbody = document.querySelector(".approval-line tbody");
			tbody.innerHTML = "";
			const rowEl = document.createElement("tr");
			const bodyLabel = document.createElement("td");
			bodyLabel.innerText = "결재";
			rowEl.appendChild(bodyLabel);
//			const returnReason = data.APL_RREMARK || "";

			// 모달 오픈
			document.querySelectorAll('.modal-backdrop').forEach(bd => bd.remove());
			const modal = new bootstrap.Modal(document.getElementById('detailModal'));
			modal.show();
		} catch (err) {
			console.error("상세 조회 중 에러:", err);
			alert("상세 조회에 실패했습니다.");
		}
	}
	
	/* ───────────────── 전역 상수/상태 ───────────────── */
	const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
	let   areaCount = 0;                    // 현재 구역 개수
	const $areaContainer = $("#areaContainer");

	/* 캐시: { material: [...], product: [...] } */
	const cache   = { material: null, product: null };
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
	            <option value="material">자재</option>
	            <option value="product">제품</option>
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

	  /* ───────────────── 모달 열릴 때 품목 목록 캐싱 ───────────────── */
	  $('#warehouseModal').on('show.bs.modal', async () => {
	    if ((cache.material && cache.product) || loading) return; // 이미 캐시됐거나 로딩 중
	    loading = true;
	    try {
	      const [matRes, prodRes] = await Promise.all([
	        fetch("/SOLEX/inventory/api/items?type=material"),
	        fetch("/SOLEX/inventory/api/items?type=product")
	      ]);
	      if (!matRes.ok || !prodRes.ok) throw new Error();
	      cache.material = await matRes.json();  // [{ID, NAME}, ...]
	      cache.product  = await prodRes.json();
	    } catch (e) {
	      console.error("품목 목록 로드 실패", e);
	      alert("품목 목록을 불러오지 못했습니다.");
	    } finally {
	      loading = false;
	    }
	  });

	  /* ───────────────── 구분 선택 → 캐시에서 옵션 채우기 ───────────────── */
	  $areaContainer.on("change", ".area-type", function () {
	    const type  = $(this).val();                       // material | product
	    const list  = cache[type] || [];                   // 캐시된 배열
	    const $item = $(this).closest(".area-row")
	                         .find(".area-item")
	                         .prop("disabled", false);

	    if (list.length === 0) {
	      $item.html(`<option disabled>목록 없음</option>`).prop("disabled", true);
	      return;
	    }

	    const options = list.map(i =>
	      `<option value="\${i.ID}">\${i.NAME}</option>`).join("");
	    $item.html(`<option value="" disabled selected>선택</option>${options}`);
	  });

	  /* ───────────────── 제출 ───────────────── */
	  $("#submitWarehouse").on("click", async () => {
	    // 1) 창고 기본 정보
	    const whs_nm  = $("#whsName").val().trim();
	    const whs_mgr = $("#whsManager").val().trim();
	    if (!whs_nm || !whs_mgr) {
	      alert("창고명과 담당자 사번을 입력하세요."); return;
	    }

	    // 2) 구역 정보 수집/검증
	    const areas = [];
	    let   valid = true;
	    $areaContainer.find(".area-row").each((i, row) => {
	      const $r      = $(row);
	      const type    = $r.find(".area-type").val();
	      const itemId  = $r.find(".area-item").val();
	      const maxCnt  = $r.find(".area-max").val();

	      if (!type || !itemId || !maxCnt) { valid = false; return false; }
	      areas.push({
	        area_nm : LETTERS[i],
	        area_tp : type,
	        item_id : itemId,
	        max_cnt : Number(maxCnt)
	      });
	    });
	    if (!valid) { alert("모든 구역 정보를 채워 주세요."); return; }

	    // 3) 서버 전송
	    try {
	      const res = await fetch("/SOLEX/warehouse/register", {
	        method : "POST",
	        headers: { "Content-Type": "application/json" },
	        body   : JSON.stringify({
	          whs_nm,
	          whs_mgr_id: whs_mgr,
	          areas
	        })
	      });
	      if (!res.ok) throw new Error();
	      alert("창고가 등록되었습니다!");
	      bootstrap.Modal.getInstance($('#warehouseModal')[0]).hide();
	      location.reload();
	    } catch (e) {
	      console.error(e);
	      alert("등록 실패. 다시 시도해 주세요.");
	    }
	  });
	  
});
//로그인한 사원정보 넣어주기
function fillEmployeeInfo() {
	$.ajax({
		url: '/SOLEX/approval/employee/info',
		type: 'GET',
		dataType: 'json',
		success: function(data) {
			$('#docEmp_id').val(data.EMP_ID).prop('disabled', true);
			$('#docEmp_nm').val(data.EMP_NM).prop('disabled', true);
			$('#docdept_nm').val(data.EMP_DEP_NM).prop('disabled', true);
			$('#docdept_team').val(data.EMP_TEAM_NM).prop('disabled', true);
			$('#docdept_position').val(data.EMP_POS_NM).prop('disabled', true);
		},
		error: function() {
			alert('사원 정보를 불러오지 못했습니다.');
		}
	});
}
// 날짜 추출하기
function attachDateRangeChange() {
	const input = document.getElementById('dateRange');
	if (!input) return;
	input.removeEventListener('change', onDateRangeChange);
	input.addEventListener('change', onDateRangeChange);
}

function onDateRangeChange() {
	const [startDate, endDate] = this.value.split(' to ');
	document.getElementById('startDate').value = startDate || '';
	document.getElementById('endDate').value = endDate || '';
}