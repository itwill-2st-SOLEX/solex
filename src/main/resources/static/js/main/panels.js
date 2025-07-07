/* ---------------- 메인 로딩 ---------------- */
document.addEventListener('DOMContentLoaded', () => {
    noticeList();     // 📢 최근 공지 4건
    approvalList();   // 📝 결재 목록 4건
	
	

    // 공지사항 -----------------------------------------------------------------
    document.getElementById('noticeList').addEventListener('click', async (e) => {
            const link = e.target.closest('.notice-link');
            if (!link) return;      // 링크가 아니면 무시
            e.preventDefault();     // 기본 이동 막기

            const id = link.closest('.notice-item').dataset.id;

            try {
                const res = await fetch(`/SOLEX/notice/api/${id}`);
                if (!res.ok) throw new Error(res.status);
                const data = await res.json();

                showNoticeModal('view', data); // notice.js에 구현
            } catch (err) {
                console.error('공지 상세 조회 실패', err);
                alert('공지사항을 불러오지 못했습니다.');
            }
        });

    // 결재목록 -----------------------------------------------------------------
    document.getElementById('approvalList').addEventListener('click', async (e) => {
            const item = e.target.closest('.document-item');
            if (!item) return;
            e.preventDefault();

            const row         = { doc_id: item.dataset.id };
            const docTypeCode = item.dataset.type;

            openDetailModal(row, docTypeCode);
        });
});












/* 공지사항 ------------------------------------------------------------------- */
async function noticeList() {
    const ul = document.getElementById('noticeList');
    ul.innerHTML = '';

    try {
        const res = await fetch('/SOLEX/main/api/noticeList');
        if (!res.ok) throw new Error(res.status);
        const data = await res.json();
        const list = Array.isArray(data) ? data : (data.list ?? []);

        if (list.length === 0) {
            ul.innerHTML =
                `<li class="text-none small py-2 px-1">최근 공지가 없습니다.</li>`;
            return;
        }

        list.forEach(n => {
            const li = document.createElement('li');
            li.className = 'd-flex justify-content-between notice-item';
            li.dataset.id = n.NOT_ID;

            li.innerHTML = `
                <a href="#" class="notice-link">${n.NOT_TT}</a>
                <span class="text-muted small">
                    ${dayjs(n.NOT_REG_DATE).format('YYYY-MM-DD')}
                </span>`;
            ul.appendChild(li);
        });

    } catch (err) {
        console.error('공지 목록 로드 실패', err);
        ul.innerHTML =
            `<li class="text-none small py-2 px-1 text-danger">
                공지 목록을 불러오지 못했습니다.
            </li>`;
    }
}

/* 결재 목록 ------------------------------------------------------------------- */
async function approvalList() {
    const ul = document.getElementById('approvalList');
    ul.innerHTML = '';

    try {
        const res = await fetch('/SOLEX/main/api/approval');
        if (!res.ok) throw new Error(res.status);
        const data = await res.json();
        const list = Array.isArray(data) ? data : (data.list ?? []);

        if (list.length === 0) {
            ul.innerHTML =
                `<li class="text-none small py-2 px-1">최근 결재문서가 없습니다.</li>`;
            return;
        }

        list.forEach(doc => {
            const li = document.createElement('li');
            li.className = 'd-flex justify-content-between document-item';
            li.dataset.id   = doc.DOC_ID;
            li.dataset.type = doc.DOC_TYPE_CODE;

            const badge =
                doc.DOC_STS === '결재' ? 'wait'
                : doc.DOC_STS === '승인' ? 'approved'
                : doc.DOC_STS === '반려' ? 'rejected' : '';

            li.innerHTML = `
                <span class="status ${badge}">${doc.DOC_STS}</span>
                <a href="#" class="document-link">${doc.DOC_TYPE}</a>
                <span class="text-muted small">${doc.DOC_REG_TIME}</span>`;
            ul.appendChild(li);
        });

    } catch (err) {
        console.error('결재 목록 로드 실패', err);
        ul.innerHTML =
            `<li class="text-none small py-2 px-1 text-danger">
                결재 목록을 불러오지 못했습니다.
            </li>`;
    }
}



// 상세조회 모달
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
					<input type="text" id="dateRange" class="form-control" name="dbdaterange" placeholder="출장/외근 날짜 선택">
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
					<input type="text" id="dateRange" class="form-control" name="dbdaterange" placeholder="퇴사 예정일 선택">
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

			// 일반 input, textarea, select 값 주입
			for (const [key, value] of Object.entries(data)) {
				const el = form.querySelector(`[name="${key.toLowerCase()}"]`);
				if (el) el.value = value;
			}
			const nameList = (data.APL_EMP_POS_NM || "").split(",");
			const statusList = (data.APL_STS || "").split(",");
			const timeList = (data.APL_ACTION_TIME || "").split(",");
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
			
			// 반려 사유 textarea 추가
			if (data.APL_STS && data.APL_STS.includes("반려") && data.APL_RREMARK) {
				const form = document.querySelector("#detailModal .modal-body");
				if (form && !document.querySelector("#returnReason")) {
					const returnDiv = document.createElement("div");
					returnDiv.className = "mb-3 return-reason-area";

					returnDiv.innerHTML = `
						<label class="form-label text-red">반려 사유</label>
						<textarea class="form-control" id="returnReason" name="return_reason" rows="3" disabled>${data.APL_RREMARK}</textarea>
					`;

					form.appendChild(returnDiv);
				}
			}
			for (let i = 0; i < nameList.length; i++) {
				const td = document.createElement("td");
				const status = statusList[i] || "대기";
				const time = timeList[i] || "-";

				let statusClass = "";
				if (status === "승인") statusClass = "text-blue";
				else if (status === "반려") statusClass = "text-red";

				td.innerHTML = `
				  <span class="${statusClass}"> ${status}<br>${time}</span>
				`;
				rowEl.appendChild(td);
			}


			tbody.appendChild(rowEl);

			// 모달 오픈
			document.querySelectorAll('.modal-backdrop').forEach(bd => bd.remove());
			const modal = new bootstrap.Modal(document.getElementById('detailModal'));
			modal.show();
		} catch (err) {
			console.error("상세 조회 중 에러:", err);
			alert("상세 조회에 실패했습니다.");
		}
	}
	
