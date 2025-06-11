$(function () {
	let currentPage = 0;
	const pageSize = 20;

  	const grid = new tui.Grid({
	    el: document.getElementById('grid'),
	    bodyHeight: 700,
	    scrollY: true,
	    data: [],
	    columns: [
	      { header: '기안서 번호', name: 'doc_id' },
	      { header: '기안서 종류', name: 'doc_type' },
	      { header: '결재상태', name: 'doc_sts' },
	      { header: '등록일', name: 'doc_reg_time' }
    	]
 	});

  	async function loadDrafts(page) {
		try {
			const response = await fetch(`/SOLEX/approval/api/drafts?page=${page}&size=${pageSize}`);
      		const rawData = await response.json();
      		const data = rawData.map(row => ({
	        doc_id: row.DOC_ID,
			doc_type_code: row.DOC_TYPE_CODE, 
	        doc_type: row.DOC_TYPE,
	        doc_sts: row.DOC_STS,
	        doc_reg_time: row.DOC_REG_TIME
      	}));
		page === 0 ? grid.resetData(data) : grid.appendRows(data);
      	currentPage++;

      	if (data.length < pageSize) grid.off("scrollEnd");
    	} catch (error) {
      		console.error('기안서 목록 조회 실패:', error);
    	}
  	}

  	loadDrafts(currentPage);

	grid.on('scrollEnd', () =>  loadDrafts(currentPage));
	
	grid.on('click', (ev) => {
		if (ev.columnName === 'doc_id') {
			const rowData = grid.getRow(ev.rowKey);
			const docTypeCode = rowData.doc_type_code;
			openDetailModal(rowData, docTypeCode);
    	}
	});

	async function fetchCodeOptions(groupId) {
		try {
      		const response = await fetch(`/SOLEX/approval/api/codes?group=${groupId}`);
      		const data = await response.json();
			return data.map(({ DET_ID, DET_NM }) => `<option value="${DET_ID}">${DET_NM}</option>`).join("");
		} catch (error) {
			console.error(`${groupId} 코드 불러오기 실패:`, error);
			return "<option disabled>불러오기 실패</option>";
		}
  	}
	
  	// 기안서 종류별 동적 화면 구성
 	const formTemplates = {
  		"doc_type_01": `
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
					<input type="text" id="dateRange" class="form-control" name="dbdateRange" placeholder="휴가기간 선택">
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
  		`,

  		"doc_type_02": `
			<div class="doc-type05">
				<div id="emp-id" class="mb-3">
					<label class="form-label">사번</label>
					<input type="text" class="form-control" id="docEmp_id" name="emp_id" />
					<input type="hidden" name="emp_id">
				</div>
				<div id="emp-nms" class="mb-3">
					<label class="form-label">성명</label>
					<input type="text" id="docEmp_nm" class="form-control" name="emp_nm"/>
				</div>
			</div>
			<div class="doc-type05">
				<div id="dept-nms" class="mb-3">
					<label class="form-label">부서</label>
					<input type="text" id="docdept_nm" class="form-control" name="emp_dep_nm" />
				</div>
				<div id="dept-teams" class="mb-3">
					<label class="form-label">팀</label>
					<input type="text" id="docdept_team" class="form-control" name="emp_team_nm"/>
				</div>
			</div>
			<div id="job-posit" class="mb-3">
				<label class="form-label">직급</label>
				<input type="text" class="form-control" id="docdept_position" name="emp_pos_nm" />
			</div>
			<div class="btn-group" role="group" aria-label="출장 외근 선택">
			  <input type="radio" class="btn-check" name="bus_type" value="출장" id="businessTrip" checked>
			  <label class="btn btn-purple" for="businessTrip">출장</label>

			  <input type="radio" class="btn-check" name="bus_type" value="외근" id="fieldWork">
			  <label class="btn btn-purple" for="fieldWork">외근</label>
			</div>
			<div class="doc-type05">
				<div id="date" class="mb-3">
					<label class="form-label">기간</label>
					<input type="text" id="dateRange" class="form-control" name="dbdateRange" placeholder="출장/외근 날짜 선택">
					<input type="hidden" name="bus_start_time" id="startDate">
					<input type="hidden" name="bus_end_time" id="endDate">
				</div>
				<div id="cost-detail" class="mb-3">
					<label class="form-label">경비내역</label>
					<input type="text" id="bus_cost" name="bus_cost" class="form-control" />
				</div>
			</div>
			<div class="mb-3">
				<label class="form-label">세부 업무 내용</label>
				<textarea class="form-control" id="docContents" name="bus_con" rows="4"></textarea>
			</div>
  		`,
  		"doc_type_03": `
			<div class="doc-type03">
				<div id="emp-id" class="mb-3">
					<label class="form-label">사번</label>
					<input type="text" class="form-control" id="docEmp_id" name="emp_id"/>
					<input type="hidden" name="emp_id">
				</div>
				<div id="emp-nms" class="mb-3">
					<label class="form-label">성명</label>
					<input type="text" class="form-control" id="docEmp_nm" name="emp_nm" />
				</div>
			</div>
			<div class="doc-type03">
				<div id="dept-nms" class="mb-3">
					<label class="form-label">부서</label>
					<input type="text" class="form-control" id="docdept_nm" name="emp_dep_nm" />
				</div>
				<div id="curr-team" class="team mb-3">
					<label class="form-label">팀</label>
					<input type="text" class="form-control" id="docdept_team" name="emp_team_nm"/>
				</div>
			</div>
			<div class="doc-type03">
				<div id="job-posit" class="mb-3">
					<label class="form-label">직급</label>
					<input type="text" class="form-control" id="docdept_position" name="emp_pos_nm" />
				</div>
				<div id="last-day" class="mb-3">
					<label class="form-label">사직 희망일</label>
					<input type="text" id="dateRange" class="form-control" name="dbdateRange" placeholder="퇴사 예정일 선택">
					<input type="hidden" name="res_start_date" id="startDate">
				</div>
			</div>
			<div class="mb-3">
				<label class="form-label">사직사유</label>
				<textarea class="form-control" id="resContent" name="res_con" rows="4"></textarea>
			</div>
			<div class="text-center">
				<h3 class="form-label">위와 같이 사직하고자 하니 허가하여 주시기 바랍니다.</h3>
			</div>
  		`
  	};

	// 기안서 종류별로 제목 및 달력 시간표시 나타내기
  	$('#docTypeSelect').on('change', async function () {
	    const selected = $(this).val();
	    const selectedText = $(this).find('option:selected').text();
   		$('.approval-line h2').text(selectedText);

	    const formHtml = formTemplates[selected] || '<p>지원되지 않는 문서 유형입니다.</p>';
	    $('#dynamicFormArea').html(`
	      <input type="hidden" name="doc_type" value="${selected}" />
	      ${formHtml}
	    `);
		// 2. 사원 정보 채우기
		fillEmployeeInfo();
	    attachDateRangeChange();
	
	    flatpickr("#dateRange", {
	    	mode: selected === 'doc_type_01' || selected === 'doc_type_02' ? "range" : "single",
	    	enableTime: selected !== 'doc_type_03' ? true : false,
	    	time_24hr: true,
	    	dateFormat: selected === 'doc_type_03' ? "Y-m-d" : "Y-m-d H:i",
	    	minuteIncrement: 30
    	});

	    if (selected === 'doc_type_03') {
	      const positionOptions = await fetchCodeOptions('position');
	      $('#docPositionSelect').html(`<option value="">선택하세요</option>${positionOptions}`);
	
	      const deptOptions = await fetchCodeOptions('dept');
	      $('#docDeptSelect').html(`<option value="">선택하세요</option>${deptOptions}`);
	    }
  	});

	$('#docTypeSelect').trigger('change');

 	// 기안서 등록
	document.getElementById("submitApproval").addEventListener("click", async function () {
		const docType = document.getElementById("docTypeSelect")?.value;
		// doc_type_01 유효성
		if (docType === 'doc_type_01') {
		    const docTitle = document.getElementById('docTitle')?.value.trim();
		    const docContent = document.getElementById('docContent')?.value.trim();

		    if (!docTitle || docTitle.length > 50 || !docContent) {
		      alert(
		        !docTitle ? '제목을 입력해 주세요.' :
		        docTitle.length > 50 ? '제목은 50자 이내로 입력해 주세요.' :
		        '사유를 입력해 주세요.'
		      );
		      return;
		    }
		}
		// doc_type_02 유효성
		if (docType === 'doc_type_02') {
			const dateRange = document.getElementById('dateRange')?.value.trim();
			const busCost = document.querySelector('input[name="bus_cost"]')?.value.trim();
			const busCon = document.querySelector('textarea[name="bus_con"]')?.value.trim();

	    	if (!dateRange || !busCost || !busCon) {
				alert(
					!dateRange ? '출장/외근 기간을 선택해 주세요.' :
		         	!busCost ? '경비 내역을 입력해 주세요.' :
		         	'세부 업무 내용을 입력해 주세요.'
		       	);
		       	return;
	    	}
		}
		// doc_type_03 유효성
		if (docType === 'doc_type_03') {
			const dateRange = document.getElementById('dateRange')?.value.trim();
		    const resCon = document.querySelector('textarea[name="res_con"]')?.value.trim();

		    if (!dateRange || !resCon) {
		      	alert(
			        !dateRange ? '사직 희망일을 선택해 주세요.' :
			        '사직 사유를 입력해 주세요.'
			      );
				return;
		    }
		}
		try {
      		const form = document.getElementById("draftForm");
			const formData = new FormData(form);
			const jsonObject = Object.fromEntries(formData.entries());

      		const response = await fetch("/SOLEX/approval/register/drafts", {
	        method: "POST",
	        headers: { "Content-Type": "application/json" },
	        body: JSON.stringify(jsonObject)
      		});

	      	if (!response.ok) throw new Error("서버 오류");
	
			alert("기안서가 등록 되었습니다!");
			const modalEl = document.getElementById('exampleModal');
			const modalInstance = bootstrap.Modal.getInstance(modalEl);
			modalInstance.hide();
			
			// 페이지 리셋 후 목록 다시 불러오기
			currentPage = 0;
			await loadDrafts(currentPage);
			} catch (err) {
      			console.error("등록 중 에러:", err);
      			alert("등록에 실패했습니다. 다시 시도해주세요.");
    	}
  	});
	
	// 경비내역 유효성
	$(document).on('input', '#bus_cost', function (e) {
		e.target.value = e.target.value.replace(/[^0-9]/g, "");
		if (e.target.value.length > 7) {
	    	e.target.value = e.target.value.slice(0, 7); 
        }
	});
	
	// 상세조회 모달
	async function openDetailModal(row, docTypeCode) {
		document.querySelector("#detailModal .modal-body").innerHTML = formTemplates[docTypeCode];
		// 항상 비활성화
		const form = document.querySelector("#detailModal .modal-body");
		form.querySelectorAll("input, textarea, select").forEach(el => {
			el.disabled = true;
		});
		
		try {
			const response = await fetch(`/SOLEX/approval/select/detail/${row.doc_id}?doc_type_code=${docTypeCode}`);
			if (!response.ok) throw new Error("상세 조회 실패");
	
			const data = await response.json();
			debugger;
			
			// 일반 input, textarea, select 값 주입
			for (const [key, value] of Object.entries(data)) {
			  const el = form.querySelector(`[name="${key.toLowerCase()}"]`);
			  if (el) el.value = value;
			}
			const posList = (data.APL_EMP_POS || "").split(",");
			// thead 구성
			const theadRow = document.querySelector(".approval-line thead tr");
			theadRow.innerHTML = "";
			
			const headLabel = document.createElement("th");
			headLabel.innerText = "결재";
			theadRow.appendChild(headLabel);

			posList.forEach(pos => {
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
			
			for (let i = 0; i < posList.length; i++) {
			  const td = document.createElement("td");
			  td.innerHTML = `
			    ${nameList[i] || "-"}<br>
			    <span>${statusList[i] || "대기"}<br>${timeList[i] || "-"}</span>
			  `;
			  rowEl.appendChild(td);
			}
			
			tbody.appendChild(rowEl);

			// 모달 오픈
			document.querySelectorAll('.modal-backdrop').forEach(bd => bd.remove());
			const modal = new bootstrap.Modal(document.getElementById('detailModal'));
			modal.show();
//			const modalBody = document.querySelector('.modal-body');
//	 		 // 날짜 필드 처리 (docType별 분기)
//			 
//		     if (docTypeCode === "doc_type_01") {
//		       const val = data.DBDATERANGE;
//			   debugger;
//		       modalBody.querySelector('input[name="dbdateRange"]').value = val;
//			   
//			   console.log(modalBody.querySelector('input[name="dbdateRange"]'));
//		     } 
//		     else if (docTypeCode === "doc_type_02") {
//		       const val = data.DBDATERANGE;
//		       if (start && end) {
//		         modalBody.querySelector('input[name="bus_start_time"]').value = start;
//		         modalBody.querySelector('input[name="bus_end_time"]').value = end;
//		         const fp = modalBody.querySelector("#dateRange")?._flatpickr;
//		         fp?.setDate([start, end]);
//		       }
//			   debugger;
//		     } 
//		     else if (docTypeCode === "doc_type_03") {
//		       const start = data.RES_START_DATE;
//		       if (start) {
//				debugger;
//		         modalBody.querySelector('input[name="res_start_date"]').value = start;
//		         const fp = modalBody.querySelector("#dateRange")?._flatpickr;
//		         fp?.setDate(start);
//		       }
//				   
//		     }

//			     const modal = new bootstrap.Modal(document.getElementById('detailModal'));
//			     modal.show();
//			}
		} catch(err) {
			console.error("상세 조회 중 에러:", err);
		    alert("상세 조회에 실패했습니다.");
		}
	}
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