// =================================================================================================
// 전역 변수 선언 및 초기화 (DOM 요소 로드 후에 접근하도록 주의)
// =================================================================================================

// TUI Grid 초기화 시 사용되는 데이터 변환
const listJson = JSON.parse(list);  // 'list' 변수는 HTML에서 서버 사이드 템플릿 엔진을 통해 주입되어야 합니다.
const gridData = [];

listJson.forEach(client => {
  const listData = {
    cli_nm: client.CLI_NM,
    cli_ceo: client.CLI_CEO,
    biz_reg_no: client.BIZ_REG_NO || "-",
    cli_type: client.CLI_TYPE,
    cli_phone: client.CLI_PHONE,
    cli_mgr_name: client.CLI_MGR_NAME,
    cli_mgr_phone: client.CLI_MGR_PHONE,
    cli_addres: client.CLI_ADD + " " + client.CLI_DA,
    detail :
    `<button class="btn btn-link p-0 open-detail" style="width: 100%;" tabindex="-1" title="detail" onclick="openDetailModal('${client.CLI_ID}')">
      <span>⋮</span>
    </button>`
  };
  gridData.push(listData);
});

// TUI Grid 인스턴스 생성
const grid = new tui.Grid({
   el: document.getElementById('grid'),
   data: gridData,
   height: 600,
   bodyHeight: 500,
   autoWidth: true,
   columns: [
      { header: '거래처 명', name: 'cli_nm' },
      { header: '대표자 명', name: 'cli_ceo' },
      { header: '사업자 등록번호', name: 'biz_reg_no' },
      { header: '거래처 유형', name: 'cli_type', width: 80 },
      { header: '연락처', name: 'cli_phone' },
      { header: '담당자 명', name: 'cli_mgr_name' },
      { header: '담당자 연락처', name: 'cli_mgr_phone' },
      { header: '주소', name: 'cli_addres', width: 400 },
      { header: '상세', name: 'detail' }
    ]
});

// 사업자등록번호 검증 상태를 나타내는 전역 변수
let isBizRegNoVerified = false;

// 모달 및 관련 요소 참조 (DOMContentLoaded 이후에 안전하게 초기화)
let myModalEl;
let modalContentContainer;
let bootstrapModalInstance;

// 현재 모달이 '등록' 모드인지 '수정' 모드인지 추적하는 변수
// null이면 등록 모드, 숫자면 수정 모드 (수정할 거래처의 ID)
let currentClientId = null;

// =================================================================================================
// 폼 요소 참조 헬퍼 함수
// =================================================================================================

// 폼 필드 요소를 가져오는 헬퍼 함수 (모달이 생성된 후에 호출되어야 함)
const getFormElements = () => {
    return {
        cliNmInput: document.getElementById('cli_nm'),
        cliCeoInput: document.getElementById('cli_ceo'),
        bizRegNoInput: document.getElementById('biz_reg_no'),
        clientTypeSelect: document.getElementById('clientTypeSelect'),
        cliPhoneInput: document.getElementById('cli_phone'),
        cliMgrNameInput: document.getElementById('cli_mgr_name'),
        cliMgrPhoneInput: document.getElementById('cli_mgr_phone'),
        cliPcInput: document.getElementById('cli_pc'),
        cliAddInput: document.getElementById('cli_add'),
        cliDaInput: document.getElementById('cli_da'),
        noBizCheckbox: document.getElementById('no_biz_checkbox'),
        noBizText: document.getElementById('no_biz_text'),
        getBizRegNoInfoBtn: document.getElementById('getBizRegNoInfo')
    };
};

// =================================================================================================
// 모달 HTML 생성 및 관리 함수
// =================================================================================================

// 모달 HTML 템플릿을 동적으로 생성하는 함수
function generateModalHtml(mode, data = {}, clientId = null) {
	console.log(data);
    const isUpdateMode = mode === 'update';
    const modalTitleText = isUpdateMode ? '거래처 수정' : '거래처 등록';
    const submitButtonText = isUpdateMode ? '수정' : '등록';
    const submitFunctionCall = `submitClientForm()`; // 항상 submitClientForm() 함수만 호출

    // 폼 필드 기본값 설정
    const cli_nm = data.CLI_NM || '';
    const cli_ceo = data.CLI_CEO || '';
    const biz_reg_no_value = data.BIZ_REG_NO || ''; // 실제 사업자 번호 값
    const cli_type = data.CLI_YTPE || ''; // select box의 기본 선택 값
    const cli_phone = data.CLI_PHONE || '';
    const cli_mgr_name = data.CLI_MGR_NAME || '';
    const cli_mgr_phone = data.CLI_MGR_PHONE || '';
    const cli_pc = data.CLI_PC || '';
    const cli_add = data.CLI_ADD || '';
    const cli_da = data.CLI_DA || '';
	// '사업자 등록번호 미보유' 상태 결정
    const isNoBizRegNo = biz_reg_no_value === '-';

	const no_biz_checkbox_checked = isNoBizRegNo ? 'checked' : '';
	const no_biz_text_display = isNoBizRegNo ? 'block' : 'none';
	const biz_reg_input_disabled = isNoBizRegNo ? 'disabled' : '';
	// 조회 버튼도 동일하게 비활성화. 실제 input에 들어갈 값은 BIZ_REG_NO가 '-'가 아니면 그 값을 사용
	const actual_biz_reg_no_for_input = isNoBizRegNo ? '' : biz_reg_no_value;

	
	
	
    // 거래처 유형 옵션 (서버에서 받아온 데이터로 동적으로 생성하는 것이 일반적)
    const clientTypeOptions = [
        { value: '1', text: '일반거래처' },
        { value: '2', text: '협력업체' },
        { value: '3', text: '개인' }
    ].map(option => `<option value="${option.value}" ${cli_type == option.value ? 'selected' : ''}>${option.text}</option>`).join('');

    return `
        <div class="modal-header">
            <h5 class="modal-title mb-4" id="exampleModalLabel">${modalTitleText}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body big-box">
            <div class="row mb-4">
                <div class="col">
                    <label for="cli_nm" class="form-label">거래처명 <span style="color:red">*</span></label>
                    <input type="text" id="cli_nm" name="cli_nm" class="form-control" placeholder="거래처명" value="${cli_nm}">
                </div>
                <div class="col">
                    <label for="cli_ceo" class="form-label">대표자명 <span style="color:red">*</span></label>
                    <input type="text" id="cli_ceo" name="cli_ceo" class="form-control" placeholder="대표자명" value="${cli_ceo}">
                </div>
            </div>
			<div class="mb-4">
	            <label for="biz_reg_no" class="form-label">사업자 등록번호</label>
	            <div class="d-flex align-items-center">
	                <input type="text" maxlength="10" id="biz_reg_no" name="biz_reg_no" class="form-control" placeholder="사업자 등록번호 (숫자만)" style="width: 48.4%;" value="${actual_biz_reg_no_for_input}" ${biz_reg_input_disabled}>
	                <button class="btn btn-primary ms-2" id="getBizRegNoInfo" onclick="getBizRegNoInfo()" ${biz_reg_input_disabled}>사업자 등록번호 조회</button>
	            </div>
	            <div class="form-check mt-2">
	                <input type="checkbox" class="form-check-input" id="no_biz_checkbox" name="no_biz_checkbox" ${no_biz_checkbox_checked}>
	                <label for="no_biz_checkbox" class="form-check-label">사업자 등록번호 미보유</label>
	                <div class="form-text" style="color: #f35a5a; display:${no_biz_text_display};" id="no_biz_text">
	                    사업자등록번호 없으면 세금계산서 발행이 제한될 수 있습니다.
	                </div>
	            </div>
	        </div>
            <div class="mb-4">
                <div>
                    <label for="clientTypeSelect" class="form-label">거래처 유형 <span style="color:red">*</span></label>
                    <br>
                    <select id="clientTypeSelect" class="form-select">
                        ${clientTypeOptions}
                    </select>
                </div>
            </div>
            <div class="mb-4">
                <label for="cli_phone" class="form-label">거래처 연락처 <span style="color:red">*</span></label>
                <br>
                <input type="text" id="cli_phone" name="cli_phone" class="form-control" placeholder="거래처 연락처" value="${cli_phone}">
            </div>

            <div class="row mb-4">
                <div class="col">
                    <label for="cli_mgr_name" class="form-label">담당자명 <span style="color:red">*</span></label>
                    <input type="text" id="cli_mgr_name" class="form-control" placeholder="담당자명" value="${cli_mgr_name}">
                </div>
                <div class="col">
                    <label for="cli_mgr_phone" class="form-label">담당자 연락처 <span style="color:red">*</span></label>
                    <input type="text" id="cli_mgr_phone" class="form-control" placeholder="담당자 연락처" value="${cli_mgr_phone}">
                </div>
            </div>

            <div class="mb-4">
                <div class="form-label">주소 <span style="color:red">*</span></div>
                <div class="d-flex align-items-center mb-2">
                    <input type="text" id="cli_pc" name="cli_pc" class="form-control" style="width: 48.4%;" readonly="readonly" placeholder="우편번호" value="${cli_pc}">
                    <button class="btn btn-primary ms-2" onclick="findPostCode()">우편번호 찾기</button>
                </div>
                <div class="d-flex align-items-center mb-2">
                    <input type="text" id="cli_add" name="cli_add" class="form-control" readonly="readonly" placeholder="기본주소" value="${cli_add}">
                </div>
                <div class="d-flex align-items-center">
                    <input type="text" id="cli_da" name="cli_da" class="form-control" placeholder="상세주소" value="${cli_da}">
                </div>
            </div>
        </div>
        <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">닫기</button>
            <button type="button" class="btn btn-primary" id="submitBtn" onclick="${submitFunctionCall}">${submitButtonText}</button>
        </div>
    `;
}

// '거래처 등록' 모달을 여는 함수
function openCreateClientModal() {
    modalContentContainer.innerHTML = generateModalHtml('create');
    currentClientId = null; // 등록 모드 설정
    isBizRegNoVerified = false; // 사업자등록번호 검증 상태 초기화
    loadClientTypes();
    attachDynamicEventListeners();
    bootstrapModalInstance.show();
}

// '거래처 수정' 모달을 여는 함수
function openDetailModal(clientId) {
    console.log(clientId);
    fetch(`/solex/clients/${clientId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('거래처 정보를 가져오지 못했습니다.');
            }
            return response.json();
        })
        .then(resData => {
            const data = resData.data;
            if (!data) {
                throw new Error("클라이언트 데이터가 응답에 포함되어 있지 않습니다.");
            }
			console.log("야발"+data);
			console.log(data);
            modalContentContainer.innerHTML = generateModalHtml('update', data, clientId);
            currentClientId = clientId; // 수정 모드 설정 (ID 저장)
			
			// isBizRegNoVerified 상태 설정
            const isNoBizRegNo = data.BIZ_REG_NO === '-';
			
			
            loadClientTypes(data.CLI_TYPE);
            attachDynamicEventListeners();


            // ✨ 사업자등록번호 필드 및 버튼 상태 조정 ✨
            const { bizRegNoInput, getBizRegNoInfoBtn, noBizCheckbox } = getFormElements();
			
			console.log(bizRegNoInput.value);

            if (bizRegNoInput.value) { // 이미 유효한 사업자번호가 있고, 검증된 것으로 간주될 때
                bizRegNoInput.readOnly = true;
                getBizRegNoInfoBtn.disabled = true;
                
            } else if (isNoBizRegNo) { // 미보유 상태일 때 ('-' 값)
                 if (noBizCheckbox) { // 체크박스가 있다면
                    toggleBizRegNoRelatedUI(noBizCheckbox.checked); // 현재 체크박스 상태에 맞게 UI 업데이트
                 }
            }
            // 그 외의 경우 (신규 등록이거나, 수정 모드인데 사업자번호가 없었던 경우 등)는 일반적인 로직을 따름

            bootstrapModalInstance.show();
        })
        .catch(error => {
            console.error('Error fetching client details:', error);
            alert('거래처 정보를 불러오는 데 실패했습니다.');
        });
}

// 동적으로 생성된 요소에 이벤트 리스너를 다시 연결하는 함수
function attachDynamicEventListeners() {
    const { noBizCheckbox, cliPhoneInput, cliMgrPhoneInput, getBizRegNoInfoBtn, bizRegNoInput } = getFormElements();

    if (noBizCheckbox) {
        // change 이벤트 리스너 재연결
        noBizCheckbox.onchange = function() {
            toggleBizRegNoRelatedUI(this.checked);
        };
    }

    // 전화번호 필드 input 이벤트 리스너 재연결
    if (cliPhoneInput) {
        cliPhoneInput.oninput = function() {
            formatCliPhone(this);
        };
    }
    if (cliMgrPhoneInput) {
        cliMgrPhoneInput.oninput = function() {
            formatCliPhone(this);
        };
    }

}

// =================================================================================================
// 데이터 검증 및 전송 함수
// =================================================================================================

// 폼 유효성 검사 함수
function isValidForm() {
    const { cliNmInput, cliCeoInput, bizRegNoInput, noBizCheckbox, clientTypeSelect,
            cliPhoneInput, cliMgrNameInput, cliMgrPhoneInput, cliPcInput, cliDaInput, getBizRegNoInfoBtn } = getFormElements();

    if (!cliNmInput || cliNmInput.value.trim() === '') {
        alert("거래처명을 입력해주세요.");
        if(cliNmInput) cliNmInput.focus();
        return false;
    }
    if (!cliCeoInput || cliCeoInput.value.trim() === '') {
        alert("대표자명을 입력해주세요.");
        if(cliCeoInput) cliCeoInput.focus();
        return false;
    }

    if (noBizCheckbox && !noBizCheckbox.checked) {
        if (!bizRegNoInput || bizRegNoInput.value.trim() === '') {
            alert("사업자 등록번호를 입력해주세요.");
            if(bizRegNoInput) bizRegNoInput.focus();
            return false;
        }
        if (!isBizRegNoVerified) {
            alert("사업자 등록번호 검증을 먼저 진행해주세요.");
            if(getBizRegNoInfoBtn) getBizRegNoInfoBtn.focus();
            return false;
        }
    }

    if (!clientTypeSelect || clientTypeSelect.value === '') {
        alert("고객 유형을 선택해주세요.");
        if(clientTypeSelect) clientTypeSelect.focus();
        return false;
    }

    if (!cliPhoneInput || cliPhoneInput.value.trim() === '') {
        alert("거래처 연락처를 입력해주세요.");
        if(cliPhoneInput) cliPhoneInput.focus();
        return false;
    }
    if (cliPhoneInput && /[^0-9-]/.test(cliPhoneInput.value.trim())) {
        alert("거래처 연락처는 숫자와 하이픈만 입력해주세요.");
        if(cliPhoneInput) cliPhoneInput.focus();
        return false;
    }
    const cleanedCliPhone = cliPhoneInput.value.trim().replace(/-/g, '');
    if (cleanedCliPhone.length < 8 || cleanedCliPhone.length > 11) {
        alert("거래처 연락처는 8 ~ 11자리 숫자로 입력해주세요.");
        if(cliPhoneInput) cliPhoneInput.focus();
        return false;
    }

    if (!cliMgrNameInput || cliMgrNameInput.value.trim() === '') {
        alert("담당자명을 입력해주세요.");
        if(cliMgrNameInput) cliMgrNameInput.focus();
        return false;
    }

    if (!cliMgrPhoneInput || cliMgrPhoneInput.value.trim() === '') {
        alert("담당자 연락처를 입력해주세요.");
        if(cliMgrPhoneInput) cliMgrPhoneInput.focus();
        return false;
    }
    if (cliMgrPhoneInput && /[^0-9-]/.test(cliMgrPhoneInput.value.trim())) {
        alert("담당자 연락처는 숫자와 하이픈만 입력해주세요.");
        if(cliMgrPhoneInput) cliMgrPhoneInput.focus();
        return false;
    }
    const cleanedCliMgrPhone = cliMgrPhoneInput.value.trim().replace(/-/g, '');
    if (cleanedCliMgrPhone.length < 9 || cleanedCliMgrPhone.length > 11) {
        alert("담당자 연락처는 9 ~ 11자리 숫자로 입력해주세요.");
        if(cliMgrPhoneInput) cliMgrPhoneInput.focus();
        return false;
    }

    if (!cliPcInput || cliPcInput.value.trim() === '') {
        alert("우편번호 찾기를 완료해주세요.");
        return false;
    }

    if (!cliDaInput || cliDaInput.value.trim() === '') {
        alert("상세주소를 입력해주세요.");
        if(cliDaInput) cliDaInput.focus();
        return false;
    }

    return true;
}

// '등록' 및 '수정' 기능을 통합하여 처리하는 함수
async function submitClientForm() {
    // 1. 유효성 검사
    if (!isValidForm()) {
        return;
    }

    // 2. 데이터 수집
    const { 
            cliNmInput,
            cliCeoInput, 
            bizRegNoInput, 
            clientTypeSelect, 
            cliPhoneInput,
            cliMgrNameInput, 
            cliMgrPhoneInput, 
            cliPcInput, 
            cliAddInput, 
            cliDaInput, 
            noBizCheckbox } = getFormElements();

    let finalBizRegNo = '';
    if (noBizCheckbox && noBizCheckbox.checked) {
        finalBizRegNo = '-';
    } else if (bizRegNoInput.value.trim() !== '') {
        finalBizRegNo = bizRegNoInput.value.trim();
    } else {
        finalBizRegNo = '-';
    }

    const clientData = {
        cli_nm: cliNmInput.value.trim(),
        cli_ceo: cliCeoInput.value.trim(),
        biz_reg_no: finalBizRegNo,
        cli_type: clientTypeSelect ? clientTypeSelect.value : '',
        cli_phone: cliPhoneInput.value.trim(),
        cli_mgr_name: cliMgrNameInput.value.trim(),
        cli_mgr_phone: cliMgrPhoneInput.value.trim(),
        cli_pc: cliPcInput.value.trim(),
        cli_add: cliAddInput.value.trim(),
        cli_da: cliDaInput.value.trim(),
    };

    const loadingOverlay = document.getElementById('loadingOverlay');
    if (loadingOverlay) {
        loadingOverlay.style.display = 'flex';
    }

    let url = '';
    let method = '';
    let successMessage = '';
    let errorMessage = '';

    // currentClientId 값에 따라 등록/수정 분기
    if (currentClientId) { // currentClientId가 null이 아니면 수정 모드
        url = `/solex/clients/${currentClientId}`;
        method = 'PUT'; // 백엔드 API에 맞게 PUT 또는 PATCH 사용
        clientData.cli_id = currentClientId; // 수정 시 ID 필드 추가
        successMessage = '거래처 수정이 완료되었습니다.';
        errorMessage = '거래처 수정 중 오류가 발생했습니다.';
        console.log("전송할 수정 데이터:", clientData);
    } else { // currentClientId가 null이면 등록 모드
        url = '/solex/clients';
        method = 'POST';
        successMessage = '거래처 등록이 완료되었습니다.';
        errorMessage = '거래처 등록 중 오류가 발생했습니다.';
        console.log("전송할 등록 데이터:", clientData);
    }

    try {
        const response = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(clientData)
        });

        const result = await response.json();

        if (response.ok && result.success) { // 서버 응답에 success 필드가 있다고 가정
            alert(result.message || successMessage);
            bootstrapModalInstance.hide(); // 모달 닫기
            location.reload(); // 페이지 새로고침
        } else {
            alert(result.message || `오류: ${response.status} ${response.statusText}`);
        }
    } catch (err) {
        console.error(err);
        alert('네트워크 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
        loadingOverlay.style.display = 'none';
    }
}

// =================================================================================================
// 기타 유틸리티 함수
// =================================================================================================

// 사업자 등록번호 조회 (API 호출)
function getBizRegNoInfo() {
	const overlay = document.getElementById('loadingOverlay');
	  overlay.style.display = 'flex';

	  const bizRegNoInput = getFormElements().bizRegNoInput;
	  const input = bizRegNoInput ? bizRegNoInput.value.trim() : '';
	  const cleanedInput = input.replace(/[^0-9]/g, '');

	  if (cleanedInput.length !== 10) {
	    alert('사업자등록번호는 숫자 10자리여야 합니다.');
	    overlay.style.display = 'none';
	    return;
	  }

	  fetch('/solex/clients/check-biz', {
	    method: 'POST',
	    headers: { 'Content-Type': 'application/json' },
	    body: JSON.stringify({ bizNumber: cleanedInput })
	  })
	  .then(res => res.json())
	  .then(data => {
	    overlay.style.display = 'none';

	    const taxType = data.taxType.data[0].tax_type;
	    let message = '';
      	if (taxType === '국세청에 등록되지 않은 사업자등록번호입니다.') {
	        message = taxType;
	       } else if (!taxType || taxType.trim() === '') {
		    message = '사업자등록번호 정보가 없습니다.';
	       } else {
            // getFormElements()를 다시 호출하여 최신 DOM 요소 참조
            const { bizRegNoInput, getBizRegNoInfoBtn } = getFormElements();
			if (bizRegNoInput) bizRegNoInput.readOnly = true;
		    if (getBizRegNoInfoBtn) getBizRegNoInfoBtn.disabled = true;

            isBizRegNoVerified = true; // 검증 성공
		    message = '등록 완료';
		   }
		      alert(message);
      })
	    .catch(err => {
	      console.error('API 호출 오류:', err);
	      alert('조회 중 오류가 발생했습니다.');
	      overlay.style.display = 'none';
	    });
}

// 사업자 등록번호 관련 UI 활성화/비활성화 토글
function toggleBizRegNoRelatedUI(isChecked) {
    const { getBizRegNoInfoBtn, bizRegNoInput, noBizText } = getFormElements();

    if (!getBizRegNoInfoBtn || !bizRegNoInput || !noBizText) {
        console.error("사업자 등록번호 관련 UI 요소를 찾을 수 없습니다. HTML ID를 확인해주세요.");
        return;
    }

    if (isChecked) { // 체크박스가 체크된 경우 (사업자 등록번호 미보유)
        bizRegNoInput.value = '';
        bizRegNoInput.disabled = true;
        getBizRegNoInfoBtn.disabled = true;
        noBizText.style.display = 'block';
        isBizRegNoVerified = false; // 미보유 체크 시 검증 상태 초기화
    } else { // 체크박스가 체크 해제된 경우 (사업자 등록번호 보유)
        bizRegNoInput.disabled = false;
        bizRegNoInput.focus();
        getBizRegNoInfoBtn.disabled = false;
        noBizText.style.display = 'none';
    }
}

// 전화번호 하이픈 포맷팅 함수
function formatCliPhone(inputElem) {
  let num = inputElem.value.replace(/[^0-9]/g, '');

  if (num.substring(0, 2) === '02') {
    if (num.length < 3) {
      inputElem.value = num;
    } else if (num.length < 6) {
      inputElem.value = num.replace(/(\d{2})(\d{1,3})/, '$1-$2');
    } else if (num.length < 10) {
      inputElem.value = num.replace(/(\d{2})(\d{3,4})(\d{0,4})/, '$1-$2-$3');
    } else {
      inputElem.value = num.replace(/(\d{2})(\d{4})(\d{4}).*/, '$1-$2-$3');
    }
  } else if (/^01[016789]/.test(num) || num.length >= 3) {
    if (num.length < 4) {
      inputElem.value = num;
    } else if (num.length < 7) {
      inputElem.value = num.replace(/(\d{3})(\d{1,3})/, '$1-$2');
    } else if (num.length < 11) {
      inputElem.value = num.replace(/(\d{3})(\d{3,4})(\d{0,4})/, '$1-$2-$3');
    } else {
      inputElem.value = num.replace(/(\d{3})(\d{4})(\d{4}).*/, '$1-$2-$3');
    }
  } else {
    if (num.length < 4) {
      inputElem.value = num;
    } else if (num.length < 7) {
      inputElem.value = num.replace(/(\d{3})(\d{1,3})/, '$1-$2');
    } else if (num.length < 11) {
      inputElem.value = num.replace(/(\d{3})(\d{3,4})(\d{0,4})/, '$1-$2-$3');
    } else {
      inputElem.value = num.replace(/(\d{3})(\d{4})(\d{4}).*/, '$1-$2-$3');
    }
  }
}

// 우편번호 찾기 (Daum Postcode API)
function findPostCode() {
    new daum.Postcode({
        oncomplete: function(data) {
            const { cliPcInput, cliAddInput, cliDaInput } = getFormElements();
            if (!cliPcInput || !cliAddInput || !cliDaInput) {
                console.error("주소 관련 UI 요소를 찾을 수 없습니다.");
                return;
            }

        	cliPcInput.value = data.zonecode;

        	let displayAddress = '';
        	if (data.userSelectedType === 'R') {
        		displayAddress = data.roadAddress;
        		if (data.buildingName && data.buildingName !== "" && displayAddress.indexOf(data.buildingName) === -1) {
        			displayAddress += ' (' + data.buildingName + ')';
        		}
        	} else {
        		displayAddress = data.jibunAddress;
        	}
			cliAddInput.value = displayAddress;
        	cliDaInput.focus();
        }
    }).open();
}

// 거래처 유형 드롭다운 로드
async function loadClientTypes(selectedValue = null) {
	const select = document.getElementById('clientTypeSelect');
    console.log(selectedValue);
    console.log("selectValue");
	if (!select) return; // 요소가 없으면 종료

	try {
		const response = await fetch('/solex/clients/client-types');
		if (!response.ok) {
			throw new Error('거래처 유형을 불러오지 못했습니다.');
		}
		const clientTypes = await response.json();
		select.innerHTML = '';

		const defaultOption = document.createElement('option');
		defaultOption.value = '';
		defaultOption.textContent = '선택하세요';
		defaultOption.disabled = true;
		if (!selectedValue) { // 수정 모드가 아닐 때만 기본값 선택
			defaultOption.selected = true;
		}
		select.appendChild(defaultOption);

		clientTypes.forEach(type => {
		  const option = document.createElement('option');
		  option.value = type.code;
		  option.textContent = type.name;
		  if (selectedValue && type.code == selectedValue) { // 수정 모드일 때 해당 값 선택
			  option.selected = true;
		  }
		  select.appendChild(option);
		});
	} catch (error) {
		console.error("거래처 유형 로드 중 오류 발생:", error);
		alert("거래처 유형을 불러오는 데 실패했습니다.");
	}
}


// =================================================================================================
// DOMContentLoaded 이벤트 리스너: 문서 로드 후 초기화
// =================================================================================================
document.addEventListener('DOMContentLoaded', () => {
    // 모달 관련 요소 초기화 (HTML이 로드된 후에만 가능)
    myModalEl = document.getElementById('myModal');
    modalContentContainer = document.getElementById('modalContentContainer');
    bootstrapModalInstance = new bootstrap.Modal(myModalEl); // Bootstrap 모달 인스턴스 생성

    // '새 거래처 등록' 버튼에 openCreateClientModal() 연결 (HTML에 이 ID의 버튼이 있어야 함)
    const openClientModalBtn = document.getElementById('openClientModalBtn');
    if (openClientModalBtn) {
        openClientModalBtn.addEventListener('click', openCreateClientModal);
    }
});