/* ---------------- 메인 로딩 ---------------- */
document.addEventListener('DOMContentLoaded', () => {
    noticeList();     // 📢 최근 공지 4건
    approvalList();   // 📝 결재 목록 4건
	
	//사원정보
	document.getElementById('mypageModifyBtn').addEventListener('click', async () => {
		// 1. 연락처, 이메일 병합
		const fullPhone = [
			document.getElementById('emp_phone1')?.value,
			document.getElementById('emp_phone2')?.value,
			document.getElementById('emp_phone3')?.value
		].join('-');
		
		const fullEmail = [
			document.getElementById('emp_email1')?.value,
			document.getElementById('emp_email2')?.value
		].join('@');

		// 2. 서버에 보낼 텍스트 데이터(payload) 생성
		const payload = {
			empNm: document.getElementById('empNm').value,
			empPhone: fullPhone,
			empEmail: fullEmail,
			empPc: document.getElementById('sample6_postcode').value,
			empAdd: document.getElementById('sample6_address').value,
			empDa: document.getElementById('sample6_detailAddress').value
		};
		
        // 3. FormData 객체 생성 및 텍스트 데이터 추가
		const finalFormData = new FormData(); 
	    finalFormData.append(
	        'emp',
	        new Blob([JSON.stringify(payload)], { type: 'application/json' })
	    );

        // ✅ 수정: 사용자가 새로 선택한 파일이 있을 경우에만 FormData에 추가
        const fileInput = document.getElementById('emp_img');
        if (fileInput.files.length > 0) {
            finalFormData.append('emp_img', fileInput.files[0]);
        }

		// 4. 서버로 FormData 전송
		
		if (validateForm()) {
			console.log('유효성 검사 통과!');
			
			try {
				const response = await fetch('/SOLEX/mypage/personalDataModify', {
					method: 'PUT',
					body: finalFormData
				});

				if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(`수정 실패: ${errorText}`);
                }
				
				alert(`수정이 완료되었습니다.`);
				bootstrap.Modal.getInstance(document.getElementById('mypageModal')).hide();

			} catch (error) {
				console.error('수정 실패 !@!#@!#!', error);
				alert(error.message);
			}
		}
	});

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





		
		// "마이페이지" 메뉴 클릭 시 실행
		async function openMypagePopup(event) {
			event.preventDefault();
			
			try {
				const response = await fetch(`/SOLEX/mypage/empData`);
				if (!response.ok) throw new Error('사원 정보를 불러오는데 실패했습니다.');
				const empData = await response.json();
				openModalWithData(empData);
			} catch (error) {
				console.error(error);
				alert(error.message);
			}
		}
		
		// 마이페이지 모달창을 데이터로 채우고 보여주는 함수
		function openModalWithData(empData){
			
			const modalElement = document.getElementById('mypageModal');
			if (!modalElement) return;

			const modal = new bootstrap.Modal(modalElement);
			const modalBody = modalElement.querySelector('.modal-body');
			modalBody.innerHTML = ''; // 이전 내용 초기화
			
			const {
			 	empNm, empPc, empAdd, empDa, empEmail, empPhone,
			 	empHire, empBirth, empGd,
			 	EMPPOSCD, EMPCATCD, EMPDEPCD, EMPTEAMCD, empProfileImg // 📸 프로필 이미지 경로 추가
			} = empData;
				  
			// 핸드폰·이메일 분리
			const [hp1 = '', hp2 = '', hp3 = ''] = empPhone ? empPhone.split('-') : [];
			const [em1 = '', em2 = ''] = empEmail ? empEmail.split('@') : [];
			
			// ✅ 수정: empProfileImg가 있을 때만 경로를 만들고, 없으면 기본 이미지를 사용합니다.
			const profileImgSrc = empProfileImg 
                ? `/SOLEX/uploads/${empProfileImg}` 
                : '/SOLEX/assets/img/emp/simple_person_pic.jpg';

			// 모달 바디에 들어갈 Form HTML 생성
			const formHTML = `
				<form id="mypageForm" onsubmit="return false;">
					<div class="container-fluid">
						<div class="row g-4">
							<div class="col-md-4 text-center">
								<label class="form-label fw-semibold">사진</label>
								<img id="emp_img_preview" src="${profileImgSrc}"
										class="w-100 rounded shadow-sm mb-3" style="aspect-ratio:4/5;object-fit:cover;" />
								<input type="file" class="form-control" name="emp_img" id="emp_img" accept="image/*">
							</div>
							
							<div class="col-md-8">
								<div class="row g-3">
									<div class="col-md-6">
										<label for="empNm" class="form-label">이름</label>
										<input type="text" class="form-control" id="empNm" name="emp_nm" value="${empNm || ''}" required>
									</div>
									<div class="col-md-6">
										<label for="empHire" class="form-label">입사일</label>
										<input type="text" class="form-control" id="empHire" name="emp_hire" value="${empHire || ''}" readonly>
									</div>
									
									<div class="col-md-6 d-flex align-items-end">
										<div class="me-3">
											<label class="form-label d-block mb-1">성별</label>
											<div class="btn-group" role="group" aria-label="gender switcher">
												<input type="radio" class="btn-check" name="emp_gd" id="genderM" value="M" ${empGd === 'M' ? 'checked' : ''} disabled>
												<label class="btn btn-outline-primary" for="genderM">남</label>
												<input type="radio" class="btn-check" name="emp_gd" id="genderW" value="W" ${empGd === 'W' ? 'checked' : ''} disabled>
												<label class="btn btn-outline-primary" for="genderW">여</label>
											</div>
										</div>
									</div>
									<div class="col-md-6">
										<label for="emp_birth" class="form-label">생년월일</label>
										<input type="text" class="form-control" name="emp_birth" id="emp_birth" value="${empBirth || ''}" readonly>
									</div>
									
									<div class="col-12">
										<label class="form-label">연락처</label>
										<div class="input-group">
											<input type="text" id="emp_phone1" class="form-control" value="${hp1}" placeholder="010" required>
											<span class="input-group-text">-</span>
											<input type="text" id="emp_phone2" class="form-control" value="${hp2}" placeholder="1234" required>
											<span class="input-group-text">-</span>
											<input type="text" id="emp_phone3" class="form-control" value="${hp3}" placeholder="5678" required>
										</div>
										<input type="hidden" name="emp_phone" id="emp_phone">
									</div>
	
									<div class="col-12">
										<label class="form-label">이메일</label>
										<div class="input-group">
											<input type="text" id="emp_email1" class="form-control" value="${em1}" placeholder="example" required>
											<span class="input-group-text">@</span>
											<input type="text" id="emp_email2" class="form-control" value="${em2}" placeholder="company.com" required>
										</div>
										<input type="hidden" name="emp_email" id="emp_email">
									</div>
	
									<div class="col-md-6">
										<label class="form-label">직급</label>
										<input type="text" class="form-control" value="${EMPPOSCD}" readonly>
									</div>
									<div class="col-md-6">
										<label class="form-label">종류</label>
										<input type="text" class="form-control" value="${EMPCATCD}" readonly>
									</div>
									<div class="col-md-6">
										<label class="form-label">부서</label>
										<input type="text" class="form-control" value="${EMPDEPCD}" readonly>
									</div>
									<div class="col-md-6">
										<label class="form-label">팀</label>
										<input type="text" class="form-control" value="${EMPTEAMCD}" readonly>
									</div>
									
									<div class="col-12">
										<label class="form-label">주소</label>
										<div class="input-group mb-2">
											<input type="text" id="sample6_postcode" name="emp_pc" class="form-control" placeholder="우편번호" value="${empPc || ''}" required>
											<button type="button" class="btn btn-outline-secondary" onclick="sample6_execDaumPostcode()">우편번호 찾기</button>
										</div>
										<input type="text" id="sample6_address" name="emp_add" class="form-control mb-2" placeholder="주소" value="${empAdd || ''}" required>
										<input type="text" id="sample6_detailAddress" name="emp_da" class="form-control" placeholder="상세주소" value="${empDa || ''}" required>
									</div>
								</div>
							</div>
						</div>
					</div>
				</form>
			`;
			modalBody.innerHTML = formHTML;
				
			// 📸 사진 파일 선택 시 미리보기 업데이트 (이벤트 위임 사용)
			modalBody.addEventListener('change', e => {
				if (e.target.id === 'emp_img') {
					const file = e.target.files[0];
					if (file) {
						const reader = new FileReader();
						reader.onload = evt => {
							document.getElementById('emp_img_preview').src = evt.target.result;
						};
						reader.readAsDataURL(file);
					}
				}
			});

			modal.show();
		}
		
		//폼 제출 전 유효성 검사!
		function validateForm() {
			
			
		    // 1. 이름 유효성 검사 (2~4자)
		    const empNm = document.getElementById('empNm');
			if(!empNm.value){
				alert('이름을 입력해주세요');
			} else if (empNm.value.length < 2 || empNm.value.length > 4) {
			    alert('이름은 최소 2자이상 입력해주세요.');
			    empNm.focus();
			    return false;
			}

		    // 2. 연락처 유효성 검사 (010-xxxx-xxxx)
		    const empPhone1 = document.getElementById('emp_phone1');
		    const empPhone2 = document.getElementById('emp_phone2');
		    const empPhone3 = document.getElementById('emp_phone3');
		    const phonePattern = /^010-\d{4}-\d{4}$/;
		    const fullPhoneNumber = `${empPhone1.value}-${empPhone2.value}-${empPhone3.value}`;
			
			if(!fullPhoneNumber){
				alert('연락처를 입력해주세요');
			} else if (!phonePattern.test(fullPhoneNumber)) {
		        alert('연락처 형식이 올바르지 않습니다.');
		        empPhone1.focus();
		        return false;
		    }
		   
		    // 필수 입력 필드 확인 (입사일, 이메일 등)
		    const requiredFields = document.querySelectorAll('#empForm [required]');
		    for (const field of requiredFields) {
		        if (!field.value) {
		            // 필드에 연결된 label 텍스트를 가져옵니다.
		            const label = field.closest('.col-md-6, .col-12, .col-md-4')?.querySelector('label');
		            const fieldName = label ? label.innerText.replace('*', '').trim() : field.name || field.id;
		            alert(`'${fieldName}' 를 입력해주세요.`);
		            field.focus();
		            return false;
		        }
		    }

		    // 모든 검사를 통과하면 true 반환
		    return true;
		}

		// "수정" 버튼 클릭 이벤트
		
		
		function sample6_execDaumPostcode() {	
		    new daum.Postcode({
		        oncomplete: function(data) {
		            var addr = '';
		            if (data.userSelectedType === 'R') {
		                addr = data.roadAddress;
		            } else {
		                addr = data.jibunAddress;
		            }
		            document.getElementById('sample6_postcode').value = data.zonecode;
		            document.getElementById("sample6_address").value = addr;
		            document.getElementById("sample6_detailAddress").focus();
		        }
		    }).open();
		}





















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

			// 일반 input, textarea, select 값 주입
			for (const [key, value] of Object.entries(data)) {
				const el = form.querySelector(`[name="${key.toLowerCase()}"]`);
				if (el) el.value = value;
			}
			
			// 결재선 부분 시작		
			const approvalLineDiv = document.querySelector("#detailModal .approval-line");
			approvalLineDiv.innerHTML = ""; // Clear previous content

			const nameList = (data.APL_EMP_POS_NM || "").split(",");
			const statusList = (data.APL_STS || "").split(",");
			const timeList = (data.APL_ACTION_TIME || "").split(",");

			nameList.forEach((pos, i) => {
				const status = statusList[i] || "대기";
				// Format time to include a line break if date and time are present
				const time = (timeList[i] || "").replace(" ", "<br/>");

				let statusClass = "status-pending";
				if (status === "승인") statusClass = "status-approved";
				else if (status === "반려") statusClass = "status-rejected";

				const approverBox = document.createElement("div");
				approverBox.className = "approver-box";
				approverBox.innerHTML = `
					<div class="approver-position">${pos}</div>
					<div class="approver-status ${statusClass}">${status}</div>
					<div class="approver-time">${time || "-"}</div>
				`;
				approvalLineDiv.appendChild(approverBox);

				// Add arrow separator if not the last item
				if (i < nameList.length - 1) {
					const arrow = document.createElement('div');
					arrow.className = 'approver-arrow';
					arrow.innerHTML = `→`;
					approvalLineDiv.appendChild(arrow);
				}
			});
						

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
			// 결재선 부분 끝
			
			// 모달 오픈
			document.querySelectorAll('.modal-backdrop').forEach(bd => bd.remove());
			const modal = new bootstrap.Modal(document.getElementById('detailModal'));
			modal.show();
		} catch (err) {
			console.error("상세 조회 중 에러:", err);
			alert("상세 조회에 실패했습니다.");
		}
	}
	
