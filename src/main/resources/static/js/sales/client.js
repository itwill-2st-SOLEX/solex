// =================================================================================================
// 전역 변수 선언 및 초기화 (DOM 요소 로드 후에 접근하도록 주의)
// =================================================================================================

// 무한 스크롤 및 검색 관련 전역 변수
let currentPage = 0; // 현재 페이지 번호 (0부터 시작)
const pageSize = 30; // 한 번에 가져올 데이터 수 (백엔드와 일치해야 함)
let currentSearchTerm = ''; // 현재 적용된 검색어
// let hasMoreData = true; // 이 줄을 제거합니다! (다른 분의 코드에서 사용하지 않으므로 통일)

// 사업자등록번호 검증 상태를 나타내는 전역 변수
let isBizRegNoVerified = false;

// 모달 및 관련 요소 참조 (DOMContentLoaded 이후에 안전하게 초기화)
let myModalEl;
let modalContentContainer;
let bootstrapModalInstance;

// 현재 모달이 '등록' 모드인지 '수정' 모드인지 추적하는 변수
// null이면 등록 모드, 숫자면 수정 모드 (수정할 거래처의 ID)
let currentClientId = null;

// --- 유틸리티 함수 ---

// 거래처 유형을 한글로 변환하는 함수 (백엔드 Enum에 맞게)
const getClientTypeDisplayName = (type) => {
    switch (type) {
        case 'BUYER':
            return '구매처';
        case 'SELLER':
            return '판매처';
        case 'EQUIPMENT':
            return '설비';
        default:
            return type; // 매핑되지 않는 값은 원본 그대로 표시
    }
};



// { header: '상세', name: 'detail',
//     formatter: ({ value }) => { // value는 `processedData`에서 `client.cliId`로 설정됩니다.
//         return `<button class="btn btn-link p-0 open-detail" style="width: 100%;" tabindex="-1" title="detail" onclick="openDetailModal('${value}')">
//                   <span>⋮</span>
//                 </button>`;
//     }
// }





// =================================================================================================
// TUI Grid 인스턴스 생성
// =================================================================================================
// TUI Grid 인스턴스 생성 (초기 데이터는 비어있고, API 호출로 채워집니다)
const grid = new tui.Grid({
    el: document.getElementById('grid'),
    data: [], // 초기에는 빈 배열로 시작, scrollMoreClient 함수가 데이터를 채움
    height: 600,
    bodyHeight: 500,
    autoWidth: true,
    columns: [
        { header: '거래처 번호', name: 'cliId', align: 'center',renderer: {
			     styles: {
			       color: '#007BFF',
			       textDecoration: 'underline',
			       cursor: 'pointer'
			     }
			   } },
        { header: '거래처 명', name: 'cliNm',align: 'center' }, // 백엔드 DTO 필드명 (camelCase)
        { header: '대표자 명', name: 'cliCeo',align: 'center' },
        { header: '사업자 등록번호', name: 'bizRegNo',align: 'center' },
        { header: '거래처 유형', name: 'cliType', width: 80,align: 'center' },
        { header: '연락처', name: 'cliPhone',align: 'center' },
        { header: '담당자 명', name: 'cliMgrName',align: 'center' },
        { header: '담당자 연락처', name: 'cliMgrPhone',align: 'center' },
        { header: '거래처 사용여부', name: 'cliIsActive', width: 120,align: 'center' },
        { header: '주소', name: 'cliAddres', width: 400,align: 'center' }
    ]
});


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
        getBizRegNoInfoBtn: document.getElementById('getBizRegNoInfo'),
        clientIsActiveSelect: document.getElementById('clientIsActiveSelect')
    };
};

// =================================================================================================
// 모달 HTML 생성 및 관리 함수
// =================================================================================================

// 모달 HTML 템플릿을 동적으로 생성하는 함수
// data 객체의 속성명을 백엔드 DTO(camelCase)에 맞춰 수정
function generateModalHtml(mode, data = {}, clientId = null) {
    const isUpdateMode = mode === 'update';
    const modalTitleText = isUpdateMode ? '거래처 수정' : '거래처 등록';
    const submitButtonText = isUpdateMode ? '수정' : '등록';
    const submitFunctionCall = `submitClientForm()`;
	

    // 폼 필드 기본값 설정 (DTO 필드명에 맞춤)
    const cli_nm = data.CLI_NM || '';
    const cli_ceo = data.CLI_CEO || '';
    const biz_reg_no_value = data.BIZ_REG_NO || ''; // 실제 사업자 번호 값
    const cli_type = data.CLI_TYPE || ''; // select box의 기본 선택 값
    const cli_phone = data.CLI_PHONE || '';
    const cli_mgr_name = data.CLI_MGR_NAME || '';
    const cli_mgr_phone = data.CLI_MGR_PHONE || '';
    const cli_pc = data.CLI_PC || '';
    const cli_add = data.CLI_ADD || '';
    const cli_da = data.CLI_DA || '';
    const cli_id = data.CLI_ID || '';
    const cli_is_active = data.CLI_IS_ACTIVE || '';
    

	// '사업자 등록번호 미보유' 상태 결정
    const isNoBizRegNo = biz_reg_no_value === '-';
	const no_biz_checkbox_checked = isNoBizRegNo ? 'checked' : '';
	const no_biz_text_display = isNoBizRegNo ? 'block' : 'none';
	const biz_reg_input_disabled = isNoBizRegNo ? 'disabled' : '';
	const actual_biz_reg_no_for_input = isNoBizRegNo ? '' : biz_reg_no_value;

    // 거래처 유형 옵션은 loadClientTypes 함수에서 동적으로 채워집니다.
    // 여기서는 초기 <select> 태그만 생성합니다.
    return `
        <div class="modal-header">
            <h5 class="modal-title" id="exampleModalLabel">${modalTitleText}</h5>
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
	            <label for="biz_reg_no" class="form-label">사업자 등록번호 <span style="color:red">*</span></label>
	            <div class="d-flex align-items-center">
	                <input type="text" maxlength="10" id="biz_reg_no" name="biz_reg_no" class="form-control" placeholder="사업자 등록번호 (숫자만)" style="width: 48.4%;" value="${actual_biz_reg_no_for_input}" ${biz_reg_input_disabled}>
	                <button type="button" class="btn btn-primary ms-7" id="getBizRegNoInfo" ${biz_reg_input_disabled}>사업자 등록번호 조회</button>
	            </div>
	            <div class="form-check mt-2">
	                <input type="checkbox" class="form-check-input" id="no_biz_checkbox" name="no_biz_checkbox" ${no_biz_checkbox_checked}>
	                <label for="no_biz_checkbox" class="form-check-label">사업자 등록번호 미보유</label>
	                <div class="form-text" style="color: #f35a5a; display:${no_biz_text_display};" id="no_biz_text">
	                    사업자등록번호 없으면 세금계산서 발행이 제한될 수 있습니다.
	                </div>
	            </div>
	        </div>
            <div class="mb-4 row">
                <div class="col">
                    <label for="clientTypeSelect" class="form-label">거래처 유형 <span style="color:red">*</span></label>
                    <br>
                    <select id="clientTypeSelect" class="form-select">
                        </select>
                </div>

                <div class="col">
                    <label for="clientIsActiveSelect" class="form-label">거래 여부 <span style="color:red">*</span></label>
                    <br>
                    <select id="clientIsActiveSelect" class="form-select"></select>
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
                    <button type="button" class="btn btn-primary ms-7" onclick="findPostCode()">우편번호 찾기</button>
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
    loadClientTypes(); // 거래처 유형 로드
    loadClientIsActive(); // 거래처 사용여부 로드
    attachDynamicEventListeners(); // 동적 이벤트 리스너 재연결
    bootstrapModalInstance.show(); // 모달 표시
}

// '거래처 수정' 모달을 여는 함수
window.openDetailModal = async (clientId) => { // TUI Grid formatter에서 호출되므로 window에 바인딩
    try {
        // API 엔드포인트에 맞게 URL 수정
        const response = await fetch(`/SOLEX/clients/${clientId}`); // /clients/{cli_id} API 호출
        if (!response.ok) {
            throw new Error('거래처 정보를 가져오지 못했습니다.');
        }
        const resData = await response.json();
        const data = resData.data; // 컨트롤러 응답 형식에 따라 .data 접근

        if (!data) {
            throw new Error("클라이언트 데이터가 응답에 포함되어 있지 않습니다.");
        }

        // 모달 HTML 생성 (data 객체는 이미 camelCase 필드명을 가짐)
        modalContentContainer.innerHTML = generateModalHtml('update', data, clientId);
        currentClientId = clientId; // 수정 모드 설정 (ID 저장)

        // isBizRegNoVerified 상태 설정
        const isNoBizRegNo = data.BIZ_REG_NO === '-';
        if (isNoBizRegNo) {
            const { noBizCheckbox } = getFormElements();
            if (noBizCheckbox) {
                noBizCheckbox.checked = true;
                toggleBizRegNoRelatedUI(true);
            }
        }
        isBizRegNoVerified = false; // 수정 모드 진입 시 검증 상태 초기화

        loadClientTypes(data.CLI_TYPE);
        loadClientIsActive(data.CLI_IS_ACTIVE,data.CLI_IS_ACTIVE_NM);
        attachDynamicEventListeners();

        bootstrapModalInstance.show();

    } catch (error) {
        console.error('거래처 상세 정보를 불러오는 데 실패했습니다:', error);
        alert('거래처 정보를 불러오는 데 실패했습니다.');
    }
};


// 동적으로 생성된 요소에 이벤트 리스너를 다시 연결하는 함수
function attachDynamicEventListeners() {
    const { noBizCheckbox, cliPhoneInput, cliMgrPhoneInput, getBizRegNoInfoBtn, bizRegNoInput } = getFormElements();

    if (noBizCheckbox) {
        noBizCheckbox.onchange = function() {
            toggleBizRegNoRelatedUI(this.checked);
        };
    }
    if (getBizRegNoInfoBtn) { // 사업자 등록번호 조회 버튼 이벤트
        getBizRegNoInfoBtn.onclick = function() {
            getBizRegNoInfo();
        };
    }


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
            cliPhoneInput, cliMgrNameInput, cliMgrPhoneInput, cliPcInput, cliDaInput, clientIsActiveSelect } = getFormElements();

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

    if (noBizCheckbox && !noBizCheckbox.checked) { // '사업자 등록번호 미보유'가 체크되지 않은 경우
        if (!bizRegNoInput || bizRegNoInput.value.trim() === '') {
            alert("사업자 등록번호를 입력해주세요.");
            if(bizRegNoInput) bizRegNoInput.focus();
            return false;
        }
        if (!isBizRegNoVerified) { // 검증 필요
            alert("사업자 등록번호 검증을 먼저 진행해주세요.");
            if(bizRegNoInput) bizRegNoInput.focus();
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
        if(cliMgrPhoneInput) cliMgrMgrPhoneInput.focus(); // 오타 수정: cliMgrMgrPhoneInput -> cliMgrPhoneInput
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


    if (!clientIsActiveSelect || clientIsActiveSelect.value === '') {
        alert("거래 여부를 선택해주세요.");
        if(clientIsActiveSelect) clientIsActiveSelect.focus();
        return false;
    }

    return true;
}

// '등록' 및 '수정' 기능을 통합하여 처리하는 함수
async function submitClientForm() {
    if (!isValidForm()) {
        return;
    }

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
            noBizCheckbox,
            clientIsActiveSelect } = getFormElements();

    let finalBizRegNo = '';
    if (noBizCheckbox && noBizCheckbox.checked) {
        finalBizRegNo = '-';
    } else if (bizRegNoInput.value.trim() !== '') {
        finalBizRegNo = bizRegNoInput.value.trim();
    } else {
        finalBizRegNo = '-'; // 미보유가 아니지만 값이 없는 경우에도 '-' 처리
    }

    // 서버로 보낼 데이터 (Java DTO 필드명(camelCase)과 일치하도록 조정)
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
        cli_id: currentClientId,
        cli_is_active: clientIsActiveSelect ? clientIsActiveSelect.value : ''
    };


    let url = '';
    let method = '';
    let successMessage = '';
    let errorMessage = '';

    if (currentClientId) { // 수정 모드
        url = `/SOLEX/clients/${currentClientId}`; // API 엔드포인트 수정
        method = 'PUT';
        successMessage = '거래처 수정이 완료되었습니다.';
        errorMessage = '거래처 수정 중 오류가 발생했습니다.';
    } else { // 등록 모드
        url = '/SOLEX/clients'; // API 엔드포인트 수정
        method = 'POST';
        successMessage = '거래처 등록이 완료되었습니다.';
        errorMessage = '거래처 등록 중 오류가 발생했습니다.';
    }

    try {
        const response = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(clientData)
        });

        const result = await response.json();

        if (response.ok && result.status === "OK") { // `result.status`로 성공 여부 판단
            alert(result.message || successMessage);
            bootstrapModalInstance.hide();
            scrollMoreClient(true);
        } else {
            alert(result.message || `오류: ${response.status} ${response.statusText}`);
        }
    } catch (err) {
        console.error("네트워크 오류:", err);
        alert('네트워크 오류가 발생했습니다. 다시 시도해주세요.');
    }
}

// =================================================================================================
// 무한 스크롤 및 검색 관련 메인 데이터 로딩 함수
// =================================================================================================
/**
 * 클라이언트 데이터를 서버에서 불러와 TUI Grid에 추가/재설정하는 함수
 * @param {boolean} isInitialLoad 초기 로드 (검색/페이지 진입)인지 여부. true면 기존 데이터 재설정.
 */
async function scrollMoreClient(isInitialLoad = false) {
    // hasMoreData 변수 및 관련 조건은 제거합니다.
    // 무한 스크롤 종료는 grid.off('scrollEnd')로 제어합니다.
    // if ((isInitialLoad === false && hasMoreData === false)) {
    //     ("데이터 로딩 중이거나 더 이상 불러올 데이터가 없습니다.");
    //     return;
    // }

    if (isInitialLoad) {
        currentPage = 0; // 초기 로드/검색 시 페이지 번호 초기화
        // hasMoreData = true; // 이 줄을 제거합니다.
    }

    try {
        const params = new URLSearchParams();
        params.append('limit', pageSize);
        params.append('offset', currentPage * pageSize);

        if (currentSearchTerm) { // 검색어가 있을 경우 추가
            params.append('search_term', currentSearchTerm);
        }
		
        // 백엔드 API 엔드포인트 호출 (새로 정의한 /clients/data 경로)
        const response = await fetch(`/SOLEX/clients/data?${params.toString()}`);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json(); // 서버 응답 (Map<String, Object> 형태)

        (result);
		

        if (result.status === "OK" && result.data) {
            // TUI Grid에 맞게 데이터 가공 (예: 주소 조합, 타입 한글 변환)
            const processedData = result.data.map(client => ({
                cliId: client.CLI_ID,
                cliNm: client.CLI_NM,
                cliCeo: client.CLI_CEO,
                bizRegNo: client.BIZ_REG_NO || "-",
                cliType: getClientTypeDisplayName(client.CLI_TYPE), // 한글 변환 적용
                cliPhone: client.CLI_PHONE,
                cliMgrName: client.CLI_MGR_NAME,
                cliMgrPhone: client.CLI_MGR_PHONE,
                cliAddres: (client.CLI_ADD || "") + " " + (client.CLI_DA || ""),
                detail: client.CLI_ID, // 상세 버튼을 위해 cliId 전달
                cliIsActive: client.CLI_IS_ACTIVE_NM // 거래처 사용여부
            }));

            if (isInitialLoad) {
                grid.resetData(processedData); // 초기 로드 또는 새 검색 시 데이터 재설정
			} else {
                grid.appendRows(processedData); // appendRow -> appendRows로 변경!
			    grid.refreshLayout(); // 추가: 간혹 레이아웃 갱신이 필요할 수 있습니다.
			}
			
            currentPage++; // 다음 페이지를 위해 페이지 번호 증가

            // 받아온 데이터 수가 pageSize보다 적으면 더 이상 데이터가 없다고 판단
            if (processedData.length < pageSize) {
                // hasMoreData = false; // 이 줄을 제거합니다.
                grid.off('scrollEnd'); // 무한 스크롤 종료
            } else {
                // hasMoreData = true; // 이 줄을 제거합니다.
                // 데이터가 남아있으면 스크롤 이벤트가 계속 활성화되어 있도록 합니다.
                // 현재 로직상 이미 활성화 되어있으므로, 명시적으로 재바인딩할 필요는 없습니다.
                // bindScrollEvent(); // 이전에 논의했던 내용처럼, 여기에 bindScrollEvent()를 호출하면 중복 바인딩될 수 있습니다.
                                     // 필요한 경우 searchNotice 함수에서만 초기화 용도로 호출합니다.
            }

        } else {
            alert(result.message || "데이터 로딩 중 알 수 없는 오류 발생");
            // hasMoreData = false; // 이 줄을 제거합니다.
            grid.off('scrollEnd'); // 오류 발생 시에도 무한 스크롤 종료
        }

    } catch (error) {
        console.error("데이터 로딩 중 오류 발생:", error);
        alert("데이터를 불러오는 중 오류가 발생했습니다.");
        // hasMoreData = false; // 이 줄을 제거합니다.
        ("데이터 로딩 중 예외 발생. 스크롤 이벤트를 해제합니다.");
        grid.off('scrollEnd'); // 오류 발생 시 스크롤 이벤트 해제
    }
}






// =================================================================================================
// 기타 유틸리티 함수
// =================================================================================================

// 사업자 등록번호 조회 (API 호출)
function getBizRegNoInfo() {

    const bizRegNoInput = getFormElements().bizRegNoInput;
    const input = bizRegNoInput ? bizRegNoInput.value.trim() : '';
    const cleanedInput = input.replace(/[^0-9]/g, '');

	const overlay = document.getElementById('loadingOverlay');
	// API 호출 전에 스피너를 보여줍니다.
	overlay.style.display = 'block'; 

    if (cleanedInput.length !== 10) {
        alert('사업자등록번호는 숫자 10자리여야 합니다.');
        if (overlay) overlay.style.display = 'none';
        return;
    }

    fetch('/SOLEX/clients/check-biz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bizNumber: cleanedInput })
    })
    .then(res => res.json())
    .then(data => {
        if (overlay) overlay.style.display = 'none';

        const taxTypeInfo = data.taxType && data.taxType.data && data.taxType.data.length > 0 ? data.taxType.data[0].tax_type : null;

        let message = '';
        if (taxTypeInfo === '국세청에 등록되지 않은 사업자등록번호입니다.') {
            message = taxTypeInfo;
        } else if (!taxTypeInfo || taxTypeInfo.trim() === '') {
            message = '사업자등록번호 정보가 없습니다.';
        } else {
            const { bizRegNoInput, getBizRegNoInfoBtn } = getFormElements();
            if (bizRegNoInput) bizRegNoInput.readOnly = true;
            if (getBizRegNoInfoBtn) getBizRegNoInfoBtn.disabled = true;

            isBizRegNoVerified = true;
            message = '조회 완료';
        }
        alert(message);
    })
    .catch(err => {
        console.error('API 호출 오류:', err);
        alert('조회 중 오류가 발생했습니다.');
        if (overlay) overlay.style.display = 'none';
    });
}

// 사업자 등록번호 관련 UI 활성화/비활성화 토글
function toggleBizRegNoRelatedUI(isChecked) {
    const { getBizRegNoInfoBtn, bizRegNoInput, noBizText } = getFormElements();

    if (!getBizRegNoInfoBtn || !bizRegNoInput || !noBizText) {
        console.error("사업자 등록번호 관련 UI 요소를 찾을 수 없습니다. HTML ID를 확인해주세요.");
        return;
    }

    if (isChecked) {
        bizRegNoInput.value = '';
        bizRegNoInput.disabled = true;
        getBizRegNoInfoBtn.disabled = true;
        noBizText.style.display = 'block';
        isBizRegNoVerified = false;
    } else {
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
    if (!select) {
        return; // 요소가 없으면 종료
    }

    try {
        const response = await fetch('/SOLEX/clients/client-types');
        if (!response.ok) {
            throw new Error('거래처 유형을 불러오지 못했습니다.');
        }
        const clientTypes = await response.json();
        select.innerHTML = ''; // 기존 옵션 비우기

        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.textContent = '선택하세요';
        defaultOption.disabled = true;
        if (!selectedValue) { // 수정 모드가 아닐 때 (또는 선택된 값이 없을 때) 기본값 선택
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

async function loadClientIsActive(selectedValue = null, selectedText = null) {
    const select = document.getElementById('clientIsActiveSelect');
    if (!select) {
        return; // 요소가 없으면 종료
    }

    try {
        const response = await fetch('/SOLEX/clients/client-is-active');
        if (!response.ok) {
            throw new Error('거래처 사용여부를 불러오지 못했습니다.');
        }
        const clientIsActive = await response.json();

        select.innerHTML = ''; // 기존 옵션 비우기

        // 3. '선택하세요' 기본 옵션을 생성하고 추가합니다.
        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.textContent = '선택하세요';
        defaultOption.disabled = true; // 직접 선택할 수 없도록 비활성화
        select.appendChild(defaultOption);

        // 4. 서버에서 받아온 데이터로 옵션들을 생성하고 추가합니다.
        clientIsActive.forEach(type => {
            const option = document.createElement('option');
            option.value = type.DET_ID;
            option.textContent = type.DET_NM;
            select.appendChild(option);
        });

        // 5. selectedValue가 있으면 해당 값을 가진 옵션을 선택된 상태로 만듭니다.
        //    - selectedValue가 없거나(신규 등록), 일치하는 옵션이 없으면 '선택하세요'가 선택된 상태로 유지됩니다.
        if (selectedValue) {
            select.value = selectedValue;
        } else {
            select.selectedIndex = 0; // '선택하세요'를 명시적으로 선택
        }





    } catch (error) {
        console.error("거래처 사용여부 로드 중 오류 발생:", error);
        alert("거래처 유형을 불러오는 데 실패했습니다.");
    }
}





// 함수가 짧은 시간 내에 여러 번 호출되는 것을 방지합니다.
const debounce = (func, delay) => {
    let timeoutId;
    return (...args) => {
        if (timeoutId) {
            clearTimeout(timeoutId);
        }
        timeoutId = setTimeout(() => {
            func.apply(this, args);
        }, delay);
    };
};


// =================================================================================================
// DOMContentLoaded 이벤트 리스너: 문서 로드 후 초기화
// =================================================================================================
document.addEventListener('DOMContentLoaded', () => {




    // 모달 관련 요소 초기화
    myModalEl = document.getElementById('myModal');
    modalContentContainer = document.getElementById('modalContentContainer');
    if (myModalEl) {
        bootstrapModalInstance = new bootstrap.Modal(myModalEl);
    } else {
        console.error("Bootstrap 모달 요소를 찾을 수 없습니다 (ID: myModal).");
    }

    // '새 거래처 등록' 버튼에 openCreateClientModal() 연결
    const openClientModalBtn = document.getElementById('openClientModalBtn');
    if (openClientModalBtn) {
        openClientModalBtn.addEventListener('click', openCreateClientModal);
    } else {
        console.warn("거래처 등록 버튼 (ID: openClientModalBtn)을 찾을 수 없습니다.");
    }

	// --- TUI Grid 스크롤 이벤트에 연결 ---
    // 이전에 논의했던 DOM 기반 스크롤 감지 로직을 TUI Grid의 scrollEnd 이벤트 내부에 적용
    grid.on('scrollEnd', (ev) => {
        const gridContainerElement = grid.el;

        if (!gridContainerElement) {
            console.error("TUI Grid 컨테이너 요소를 찾을 수 없습니다. grid.el이 유효한지 확인해주세요.");
            return;
        }

        // 실제 스크롤이 발생하는 TUI Grid 내부의 body area 요소를 찾습니다.
        const gridBodyArea = gridContainerElement.querySelector('.tui-grid-body-area');

        if (!gridBodyArea) {
            console.error("TUI Grid body area 요소를 찾을 수 없습니다. HTML 구조 또는 클래스명을 확인해주세요.");
            return;
        }

        // DOM 요소의 속성으로 스크롤 정보 가져오기
        const currentScrollTop = gridBodyArea.scrollTop;
        const scrollHeight = gridBodyArea.scrollHeight;
        const clientHeight = gridBodyArea.clientHeight;


        // 스크롤이 수직으로 끝까지 도달했는지 확인 (오차 범위 10px)
        const SCROLL_THRESHOLD = 10;
        const isVerticalScrollEnd = (currentScrollTop + clientHeight >= scrollHeight - SCROLL_THRESHOLD);

        if (isVerticalScrollEnd) {
            scrollMoreClient(false); // 추가 로드 (다음 페이지)
        } else {
        }
    });

    grid.on('click', (ev) => {
        if (ev.columnName === 'cliId') {
            const rowData = grid.getRow(ev.rowKey);
            openDetailModal(rowData.cliId);
        }
    });





    // --- 검색 입력 필드 및 검색 버튼 이벤트 ---
    const searchInput = document.getElementById('searchInput'); // 검색 입력 필드 ID

	if (searchInput) {
        // 1. Enter 키 이벤트 (기존 로직 유지)
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault(); // Enter 키 기본 동작 (폼 제출) 방지
                currentSearchTerm = searchInput.value;
                scrollMoreClient(true); // 검색 결과의 초기 로드
            }
        });

        // 2. input 이벤트 (실시간 검색, 디바운스 적용)
        // 사용자가 입력을 멈춘 후 300ms 뒤에 검색 실행
        const debouncedSearch = debounce(() => {
            if (currentSearchTerm !== searchInput.value) { // 실제 값이 변경되었을 때만
                currentSearchTerm = searchInput.value;
                scrollMoreClient(true);
            }
        }, 300); // 300ms (0.3초) 디바운스 설정

        searchInput.addEventListener('input', debouncedSearch);

    } else {
        console.warn("검색 입력 필드 (ID: searchInput)를 찾을 수 없습니다.");
    }

    // --- 페이지 로드 시 초기 데이터 불러오기 ---
    scrollMoreClient(true); // 초기 로드 (첫 페이지)
});