$(function() {
	
	let currentPage = 0;
	const pageSize = 20;

	const grid = new tui.Grid({
	    el: document.getElementById('grid'),
	    bodyHeight: 500,
		scrollY: true,
	    data: [],
	    columns: [
	        { header: '사번', name: 'empNum', align : 'center', sortable: true, renderer: { styles: { color: '#007BFF', textDecoration: 'underline', cursor: 'pointer' } } }, 
	        { header: '카테고리', name: 'empCatCd', align : 'center', filter: 'select'},
	        { header: '부서', name: 'empDepCd', align : 'center', filter: 'select' },
	        { header: '팀', name: 'empTeamCd', align : 'center', filter: 'select'},
	        { header: '직급', name: 'empPosCd', align : 'center', filter: 'select'},
	        { header: '사원명', name: 'empNm', align : 'center', filter: 'select'},
	        { header: '연락처', name: 'empPhone', align : 'center'},
	        { header: '입사일', name: 'empHire', align : 'center' , sortable: true}
		]
	});

	// 사원 목록 조회 
	async function loadDrafts(page) {
		try {
			const response = await fetch(`/SOLEX/emp?page=${page}&size=${pageSize}`); 
	  		const rawData = await response.json();
	  		const data = rawData.map(row => ({
		        empNum: row.empNum,
				empCatCd: row.empCatCd, 
		        empDepCd: row.empDepCd,
		        empTeamCd: row.empTeamCd,
		        empPosCd: row.empPosCd,
				empNm: row.empNm,
				empPhone: row.empPhone,
				empHire: row.empHire,
				// --- 상세보기(수정) 모달에서 필요한 추가 데이터 ---
				empGd: row.empGd,
				empBirth: row.empBirth,
				empEmail: row.empEmail,
				empPc: row.empPc,
				empAdd: row.empAdd,
				empDa: row.empDa,
				empProfileImg: row.empProfileImg 
	  		}));

			page === 0 ? grid.resetData(data) : grid.appendRows(data);
      		currentPage++;

			if (data.length < pageSize) grid.off("scrollEnd");
			else grid.on('scrollEnd', () =>  loadDrafts(currentPage)); // 데이터가 pageSize보다 작지 않으면 다시 스크롤 이벤트 리스너를 추가
			
    	} catch (error) {
      		console.error('사원 목록 조회 실패:', error);
    	}
  	}

  	loadDrafts(currentPage); //최조 1페이지 로딩
	grid.on('scrollEnd', () =>  loadDrafts(currentPage)); // 스크롤 끝나면 다음 페이지 로딩

	grid.on('click', (ev) => {
		if (ev.columnName === 'empNum') {
			const rowData = grid.getRow(ev.rowKey);
			console.log(rowData);
			openCorrectModal(rowData);       
		}
	});
	
	// 폼 제출 전 전화번호, 이메일 병합
	function beforeSubmit() {

		const phone1 = document.getElementById('emp_phone1')?.value || '';
	   	const phone2 = document.getElementById('emp_phone2').value || '';
	   	const phone3 = document.getElementById('emp_phone3').value || '';
	   	const fullPhone = `${phone1}-${phone2}-${phone3}`;

	   	const empPhoneInput = document.getElementById('emp_phone');
	   	if (empPhoneInput) {
	          empPhoneInput.value = fullPhone;
      	} 
	  
	  	const email1 = document.getElementById('emp_email1')?.value || ''; // email 병합
  	  	const email2 = document.getElementById('emp_email2')?.value || '';
  	   	const fullEmail = `${email1}@${email2}`;
  		const empEmailInput = document.getElementById('emp_email');
		
  		if (empEmailInput) {
			empEmailInput.value = fullEmail;
  		} 
  	   	return true; // 이 함수는 값을 조합하는 역할만 하고, 유효성 검사는 각 버튼의 이벤트 리스너에서 수행합니다.
	}
	
//	//폼 제출 전 유효성 검사!
//	function validateForm() {
//		
//	    // 0. 사진등록 유효성 검사
//	    const empImg = document.getElementById('emp_img');
//		if (empImg.files.length === 0) {
//		    alert('사진을 등록해주세요');
//		    return false;
//		}
//		
//	    // 1. 이름 유효성 검사 (2~4자)
//	    const empNm = document.getElementById('empNm');
//		if(!empNm.value){
//			alert('이름을 입력해주세요');
//		} else if (empNm.value.length < 2 || empNm.value.length > 4) {
//		    alert('이름은 최소 2자이상 입력해주세요.');
//		    empNm.focus();
//		    return false;
//		}
//
//
//	    // 2. 성별 선택 유효성 검사
//	    const genderM = document.getElementById('genderM');
//	    const genderW = document.getElementById('genderW');
//	    if (!genderM.checked && !genderW.checked) {
//	        alert('성별을 선택해주세요.');
//	        return false;
//	    }
//
//	    // 3. 생년월일 유효성 검사 (6자리, 3번째 자리 0/1, 5번째 자리 0/1/2/3)
//	    const empBirth = document.getElementById('emp_birth');
//	    const birthPattern = /^\d{2}[01]\d[0-3]\d$/;
//		if(!empBirth.value){
//			alert('생년월일을 입력해주세요');
//		} else if (!birthPattern.test(empBirth.value)) {
//	        alert('생년월일 형식이 올바르지 않습니다.\n(예: 990101, 6자리 숫자로 입력해주세요)');
//	        empBirth.focus();
//	        return false;
//	    }
//		
//	    
//	    // 4. 연락처 유효성 검사 (010-xxxx-xxxx)
//	    const empPhone1 = document.getElementById('emp_phone1');
//	    const empPhone2 = document.getElementById('emp_phone2');
//	    const empPhone3 = document.getElementById('emp_phone3');
//	    const phonePattern = /^010-\d{4}-\d{4}$/;
//	    const fullPhoneNumber = `${empPhone1.value}-${empPhone2.value}-${empPhone3.value}`;
//		
//		if(!fullPhoneNumber){
//			alert('연락처를 입력해주세요');
//		} else if (!phonePattern.test(fullPhoneNumber)) {
//	        alert('연락처 형식이 올바르지 않습니다.');
//	        empPhone1.focus();
//	        return false;
//	    }
//	   
//
//	    // 필수 입력 필드 확인 (사진, 입사일, 이메일 등)
//	    const requiredFields = document.querySelectorAll('#empForm [required]');
//	    for (const field of requiredFields) {
//	        if (!field.value) {
//	            // 필드에 연결된 label 텍스트를 가져옵니다.
//	            const label = field.closest('.col-md-6, .col-12, .col-md-4')?.querySelector('label');
//	            const fieldName = label ? label.innerText.replace('*', '').trim() : field.name || field.id;
//	            alert(`'${fieldName}' 를 입력해주세요.`);
//	            field.focus();
//	            return false;
//	        }
//	    }
//
//	    // 모든 검사를 통과하면 true 반환
//	    return true;
//	}
	
	// 직급, 종류, 부서, 팀  셀렉트 박스 부분 시작
	
	// 모달 관련 상수
	const $employeeModal = $('#exampleModal');
    const $empPosCd = $('#empPosCd');
    const $empCatCd = $('#empCatCd');
    const $empDepCd = $('#empDepCd');
    const $empTeamCd = $('#empTeamCd');

    // 셀렉트 박스 초기화 함수
    function resetSelectBox($selectElement, defaultText, disable = true) {
        $selectElement.empty();
        $selectElement.append(`<option value="">-- ${defaultText}을 선택하세요 --</option>`);
        $selectElement.prop('disabled', disable); // 비활성화 여부 추가
    }

    // 코드 데이터 로드 및 셀렉트 박스 채우기 함수 
    async function loadCodeData(url, $selectElement, defaultText) {
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            
            resetSelectBox($selectElement, defaultText, false); // 데이터 로드 시 활성화
            data.forEach(item => {
                $selectElement.append(`<option value="${item.ID}">${item.NM}</option>`);
            });
        } catch (error) {
            console.error(`Error loading ${defaultText} data:`, error);
            alert(` ${defaultText} 데이터를 불러오는 데 실패했습니다.`);
            resetSelectBox($selectElement, defaultText, true); // 에러 시 다시 비활성화
        }
    }
	
	// "공통" 옵션을 추가하는 함수
	function addCommonOption($selectElement, defaultText, prefix) { 
        resetSelectBox($selectElement, defaultText, false); 
        $selectElement.append(`<option value="${prefix}_00">공통</option>`);
    }
	
	// "ERP", "MES" 옵션을 추가하는 함수
    function addErpMesOptions($selectElement, defaultText) {
        resetSelectBox($selectElement, defaultText, false); // 활성화하고 추가
        $selectElement.append('<option value="cat_01">ERP</option>');
        $selectElement.append('<option value="cat_02">MES</option>');
    }

    // 모달이 열릴 때 직급 로드
    $employeeModal.on('show.bs.modal', async function () {
		// 종류, 부서, 팀 셀렉트 박스 초기화
        resetSelectBox($empCatCd, '종류', true);
        resetSelectBox($empDepCd, '부서', true);
        resetSelectBox($empTeamCd, '팀', true);

        // 직급 셀렉트 박스만 활성화하고 로드
        await loadCodeData('/SOLEX/code/position', $empPosCd, '직급');
    });
	
	// 직급 선택 시 로직
    $empPosCd.on('change', async function() {
        const selectedPosCd = $(this).val();

        // 직급 변경 시 모든 하위 셀렉트 박스 초기화 및 비활성화
        resetSelectBox($empCatCd, '종류', true);
        resetSelectBox($empDepCd, '부서', true);
        resetSelectBox($empTeamCd, '팀', true);
		
		if (selectedPosCd) {
            // 사장인 경우: 종류, 부서, 팀 모두 공통 (하드코딩)
            if (selectedPosCd === 'pos_01') { 
                addCommonOption($empCatCd, '종류', 'cat');
                addCommonOption($empDepCd, '부서', 'dep');
                addCommonOption($empTeamCd, '팀', 'team');
            } 
            // 사장 외 모든 경우: 종류에 ERP, MES 추가
            else { 
                addErpMesOptions($empCatCd, '종류'); // ERP, MES 하드코딩
                
                // 이사인 경우, 부서/팀은 공통으로
                if (selectedPosCd === 'pos_02') {
                    addCommonOption($empDepCd, '부서', 'dep');
                    addCommonOption($empTeamCd, '팀', 'team');
                }
                // 부장/팀장/사원은 종류 선택에 따라 부서/팀이 달라지므로, 이 단계에서는 하위 셀렉트박스 비활성 유지
            } 
        }
    });

	// 종류 선택 시 로직
    $empCatCd.on('change', async function() {
        const selectedCatCd = $(this).val();
        const selectedPosCd = $empPosCd.val(); // 현재 선택된 직급 값

        // 종류 변경 시 모든 하위 셀렉트 박스 초기화 및 비활성화
        resetSelectBox($empDepCd, '부서', true);
        resetSelectBox($empTeamCd, '팀', true);

        if (selectedCatCd) {
            // 직급이 사장/이사인 경우 (종류 선택과 무관하게 부서는 공통)
            if (selectedPosCd === 'pos_01' || selectedPosCd === 'pos_02') {
                 addCommonOption($empDepCd, '부서', 'dep');
                 addCommonOption($empTeamCd, '팀', 'team');
            }
            // 직급이 부장/팀장/사원인 경우 (선택된 종류에 따라 부서가 달라짐)
            else if (selectedPosCd === 'pos_03' || selectedPosCd === 'pos_04' || selectedPosCd === 'pos_05') {
                // 선택된 종류 (ERP/MES)에 따라 부서 로드
                await loadCodeData(`/SOLEX/code/department?catCd=${selectedCatCd}`, $empDepCd, '부서');
                // 팀은 나중에 부서 선택에 따라 로드될 것이므로 초기에는 비활성화 상태 유지
            } 
        }
    });
		
    // 부서 선택 시 로직
    $empDepCd.on('change', async function() {
        const selectedDepCd = $(this).val();
        const selectedPosCd = $empPosCd.val(); // 현재 선택된 직급 값

        // 부서 변경 시 팀 셀렉트 박스 초기화 및 비활성화
        resetSelectBox($empTeamCd, '팀', true);

        if (selectedDepCd) {
            // 직급이 사장/이사/부장인 경우 (부서 선택과 무관하게 팀은 공통)
            if (selectedPosCd === 'pos_01' || selectedPosCd === 'pos_02' || selectedPosCd === 'pos_03') {
                addCommonOption($empTeamCd, '팀', 'team');
            } 
            // 직급이 팀장, 사원인 경우 (선택된 부서에 따라 팀이 달라짐)
            else if (selectedPosCd === 'pos_04' || selectedPosCd === 'pos_05') {
                await loadCodeData(`/SOLEX/code/team`, $empTeamCd, '팀');
            }
        }
    });
	
	// 사진 선택 시 미리보기 기능
	$('#emp_img').on('change', function(event) {
		const file = event.target.files[0];
		if (file) {
			const reader = new FileReader();
			
			// 파일 읽기가 완료되면 실행될 콜백 함수
			reader.onload = function(e) {
				// img 태그의 src 속성을 읽은 파일 데이터(Data URL)로 설정
				$('#emp_img_preview').attr('src', e.target.result);
			};
			
			// 파일을 Data URL 형태로 읽기 시작
			reader.readAsDataURL(file);
		}
	});
	
	
	// 사원 등록
	const $empForm = $('#empForm');
	const $registerBtn = $('#registerBtn');
	
	$registerBtn.on('click', async function(event) {
		event.preventDefault(); // 기본 폼 제출 방지
		
		// 1. 연락처, 이메일 값 병합
		beforeSubmit();
		
		// 2. 폼 요소에서 FormData 객체를 먼저 생성합니다.
	    const formElement = document.getElementById('empForm');
	    const formData = new FormData(formElement); 
		
		const payload = {
	        emp_nm: formData.get('emp_nm'), 
	        emp_birth: formData.get('emp_birth').replace(/\./g, '-'),
	        emp_hire: formData.get('emp_hire'),
	        emp_gd: document.querySelector('input[name="emp_gd"]:checked')?.value,
	        empCatCd: formData.get('empCatCd'),
	        empDepCd: formData.get('empDepCd'),
	        empPosCd: formData.get('empPosCd'),
	        empTeamCd: formData.get('empTeamCd'),
	        emp_phone: formData.get('emp_phone'),
	        emp_email: formData.get('emp_email'),
	        emp_pc: formData.get('emp_pc'),
	        emp_add: formData.get('emp_add'),
	        emp_da: formData.get('emp_da'),
	        emp_ea: document.getElementById('sample6_extraAddress')?.value || ''
	    };

		const file = document.getElementById('emp_img').files[0];
		
		// 3. 서버로 보낼 새로운 FormData 객체를 만듭니다.
	    const finalFormData = new FormData(); 
	    finalFormData.append(
	        'emp',
	        new Blob([JSON.stringify(payload)], { type: 'application/json' })
	    );
	        
		finalFormData.append('emp_img', file);
	    
		
       // 모든 유효성 검사를 통과하면 폼을 제출
//		if (validateForm()) {
//            console.log('유효성 검사 통과!');
	try{
		const response = await fetch('/SOLEX/emp', { // 사원 등록을 처리할 서버 URL
			method: 'POST',
			body: finalFormData 
		});

		alert('사원 등록이 완료되었습니다');
		$employeeModal.modal('hide');
		
		currentPage = 0;
		grid.off('scrollEnd');
		loadDrafts(currentPage);
		
		} catch (error){
			console.error('사원 등록 중 오류발생 = ', error);
			alert('사원등록 중 네트워크 오류가 발생했습니다. \n 다시 시도해주세요');
		}
//       }
	});

	// 모달이 닫힐 때 폼 초기화
	$employeeModal.on('hidden.bs.modal', function () {
		$empForm[0].reset(); // 폼 필드 리셋
		$('#emp_img_preview').attr('src', '/SOLEX/assets/img/emp/simple_person_pic.jpg'); // 이미지 미리보기 초기화
		
		$('#emp_img').val(''); // 파일 선택 필드의 값을 명시적으로 비워줍니다.
		
		// 동적으로 로드된 셀렉트 박스들 초기 상태로 복원
        resetSelectBox($empCatCd, '종류', true);
        resetSelectBox($empDepCd, '부서', true);
        resetSelectBox($empTeamCd, '팀', true);
	});
	
	//사원 수정
	async function openCorrectModal(empData) {
		console.log('empData = ' , empData);
		const modalElement = document.getElementById('mypageModal');
		if (!modalElement) return;

		const modal = new bootstrap.Modal(modalElement);
		const modalBody = modalElement.querySelector('.modal-body');
		modalBody.innerHTML = ''; // 이전 내용 초기화
		
		const {
		 	empNm, empPc, empAdd, empDa, empEmail, empPhone,
		 	empHire, empBirth, empGd,
		 	empPosCd, empCatCd, empDepCd, empTeamCd, empProfileImg
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
							<input type="file" class="form-control" name="emp_img" id="emp_img" accept="image/*" readonly>
						</div>
						
						<div class="col-md-8">
							<div class="row g-3">
								<div class="col-md-6">
									<label for="empNm" class="form-label">이름</label>
									<input type="text" class="form-control" id="empNm" name="emp_nm" value="${empNm || ''}" readonly>
								</div>
								<div class="col-md-6">
									<label for="empHire" class="form-label">입사일</label>
									<input type="text" class="form-control" id="empHire" name="emp_hire" value="${empHire || ''}" readonly>
								</div>
								
								<div class="col-md-6 d-flex align-items-end">
									<div class="me-3">
										<label class="form-label d-block mb-1">성별</label>
										<div class="btn-group" role="group" aria-label="gender switcher">
											<input type="radio" class="btn-check" name="emp_gd" id="genderM" value="M" ${empGd === 'M' ? 'checked' : ''} readonly>
											<label class="btn btn-outline-primary" for="genderM">남</label>
											<input type="radio" class="btn-check" name="emp_gd" id="genderW" value="W" ${empGd === 'W' ? 'checked' : ''} readonly>
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
										<input type="text" id="emp_phone1" class="form-control" value="${hp1}" placeholder="010" readonly>
										<span class="input-group-text">-</span>
										<input type="text" id="emp_phone2" class="form-control" value="${hp2}" placeholder="1234" readonly>
										<span class="input-group-text">-</span>
										<input type="text" id="emp_phone3" class="form-control" value="${hp3}" placeholder="5678" readonly>
									</div>
									<input type="hidden" name="emp_phone" id="emp_phone">
								</div>

								<div class="col-12">
									<label class="form-label">이메일</label>
									<div class="input-group">
										<input type="text" id="emp_email1" class="form-control" value="${em1}" placeholder="example" readonly>
										<span class="input-group-text">@</span>
										<input type="text" id="emp_email2" class="form-control" value="${em2}" placeholder="company.com" readonly>
									</div>
									<input type="hidden" name="emp_email" id="emp_email">
								</div>

								<div class="col-md-6">
									<label class="form-label">직급</label>
									<input type="text" class="form-control" value="${empPosCd || ''}" readonly>
								</div>
								<div class="col-md-6">
									<label class="form-label">종류</label>
									<input type="text" class="form-control" value="${empCatCd}" readonly>
								</div>
								<div class="col-md-6">
									<label class="form-label">부서</label>
									<input type="text" class="form-control" value="${empDepCd}" readonly>
								</div>
								<div class="col-md-6">
									<label class="form-label">팀</label>
									<input type="text" class="form-control" value="${empTeamCd}" name="emp_team_cd" readonly>
								</div>
								
								<div class="col-12">
									<label class="form-label">주소</label>
									<div class="input-group mb-2">
										<input type="text" id="sample6_postcode" name="emp_pc" class="form-control" placeholder="우편번호" value="${empPc || ''}" readonly>
										<button type="button" class="btn btn-outline-secondary" onclick="sample6_execDaumPostcode()">우편번호 찾기</button>
									</div>
									<input type="text" id="sample6_address" name="emp_add" class="form-control mb-2" placeholder="주소" value="${empAdd || ''}" readonly>
									<input type="text" id="sample6_detailAddress" name="emp_da" class="form-control" placeholder="상세주소" value="${empDa || ''}" readonly>
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
});