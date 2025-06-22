// 전역 변수로 옵션 데이터 저장 (공통 코드 로드 후)
let allColorOptions = [];
let allSizeOptions = [];
let allHeightOptions = [];


window.addEventListener('DOMContentLoaded', () => {
	
	document.getElementById('writeProductBtn').addEventListener('click', onWriteProduct);	
});	


// 글쓰기 버튼 클릭
async function onWriteProduct() {
	try {
        // 모달 띄우기 (빈 제목, 내용과 사용자 정보 포함)
        showProductModal('new');
    } catch (e) {
        console.error('제품 등록 모달창 표시 실패', e);
        // 사용자 정보 없을 때 기본값 처리 가능
        showProductModal('new', { EMP_NM: '알 수 없음', DET_NM: '-', POS_NM: '-' });
    }
}

// 모달 표시 함수
function showProductModal(mode, data = {}) {
	console.log('data ??? '  + JSON.stringify(data));
	console.log('mode ??? '  + mode);
	
    const modalContainer = document.getElementById('showProductModal');
    const modalFooter = document.getElementById('productModalFooter');
    const isEditable = (mode === 'new' || mode === 'edit');
    const now = new Date();
	
	const modalTitleElement = document.getElementById('modalTitleText');
		

	let saveButtonText;
    if (mode === 'new') {
        saveButtonText = '등록 완료';
		modalTitleElement.textContent = '제품 등록'
    } else if (mode === 'edit') {
        saveButtonText = '수정 완료';
		modalTitleElement.textContent = '제품 수정'
    } else {
        // 'view' 모드 등 다른 모드가 있다면 여기에 추가 처리
        saveButtonText = '저장'; // 또는 다른 기본값
    }
	
	

    const title = isEditable ? 
		`<label for="prd_nm" class="form-label">제품명 <span style="color:red">*</span></label>
		 <input type="text" id="prd_nm" name="prd_nm" class="form-control" value="${data.PRD_NM || ''}" placeholder="제품명을 입력하세요">` : 
		`<span id="modalTitle">${data.PRD_NM || ''}</span>`;

    const content = isEditable ?
        `<div id="editor"></div>` :
        `${(data.NOT_CON || '내용 없음').replace(/\n/g, '<br>')}`; // \n줄바꿈 , /g 전역 검색 플래그

    modalContainer.innerHTML = `
        <div class="custom-modal-detail">
			<div class="custom-modal-header">
		    	<h4 class="custom-modal-title" id="exampleModalLabel">${title}</h4>
			</div>
            <div class="custom-modal-content" id="modalContent">
				<div class="row mb-4">
	                <div class="col">
						<label for="prd_code" class="form-label">제품 코드<span style="color:red">*</span></label>
						<input type="text" id="prd_code" name="prd_code" class="form-control" placeholder="제품 코드" value="${data.PRD_CODE ? data.PRD_CODE : ''}">
						                
	                </div>
	                <div class="col">
	                    <label for="prd_price" class="form-label">제품 가격<span style="color:red">*</span></label>
	                    <input type="text" id="prd_price" name="prd_price" class="form-control" placeholder="제품가격" value="${data.PRD_PRICE? data.PRD_PRICE : '' }">
	                </div>
	            </div>
				<div class="row mb-4">
		        	<div class="col">
		            	<label for="prd_unit" class="form-label">제품 단위<span style="color:red">*</span></label>
						<br>
						<select id="prdUnitSelect" class="form-select"></select>
		            </div>
	                <div class="col">
	                    <label for="prd_type" class="form-label">제품 유형<span style="color:red">*</span></label>
						<br>
						<select id="prdTypeSelect" class="form-select"></select>
	                </div>
		        </div>
				<div class="row mb-4">
					<div class="col">
						<label for="prd_comm" class="form-label">제품 설명<span style="color:red">*</span></label>
						<input type="text" id="prd_comm" name="prd_comm" class="form-control" placeholder="제품설명" value="${data.PRD_COMM ? data.PRD_COMM : ''}">
				    </div>
				</div>
				<div class="row mb-4">
		        	<div class="col">
		            	<label for="prd_reg_date" class="form-label">제품 등록일<span style="color:red">*</span></label>
						<br>
						<input type="text" id="prd_reg_date" name="prd_reg_date" class="form-control" placeholder="제품 등록일" 
							value="${data.PRD_REG_DATE ? formatter(data.PRD_REG_DATE, true) : formatter(now)}" readonly>
		            </div>
	                <div class="col">
	                    <label for="prd_up_date" class="form-label">제품 수정일<span style="color:red">*</span></label>
						<br>
						<input type="text" id="prd_up_date" name="prd_up_date" class="form-control" placeholder="제품 수정일" 
							value="${data.PRD_UP_DATE ? formatter(data.PRD_UP_DATE, true) : (data.PRD_REG_DATE ? formatter(now) : '')}" readonly>
	                </div>
		        </div>
				
				
				<div class="row mb-4" id="optionFields"> 
		        	<div class="col">
		            	<label for="opt_color" class="form-label">제품 색상<span style="color:red">*</span></label>
						<br>
						<select id="prdColorSelect" class="form-select"></select>
		            </div>
	                <div class="col">
	                    <label for="opt_size" class="form-label">제품 사이즈<span style="color:red">*</span></label>
						<br>
						<select id="prdSizeSelect" class="form-select"></select>
	                </div>
	                <div class="col">
	                    <label for="opt_height" class="form-label">제품 굽 높이<span style="color:red">*</span></label>
						<br>
						<select id="prdHeightSelect" class="form-select"></select>
	                </div>
		        </div>
				
				
				<button type="button" class="btn btn-info btn-sm mb-3" id="generateCombinationsBtn">옵션 조합 생성</button>
				        
		        <div id="optionCombinationsContainer" class="mb-3">
		            <table class="table table-bordered" id="optionCombinationsTable">
		                <thead>
		                    <tr>
		                        <th><input type="checkbox" id="selectAllOptions"></th>
		                        <th>색상</th>
		                        <th>사이즈</th>
		                        <th>높이</th>
		                    </tr>
		                </thead>
		                <tbody>
		                    </tbody>
		            </table>
		        </div>		
			</div><!-- custom-modal-content -->
        </div>
    `;

	modalFooter.innerHTML = `	
	        
			
			${mode === 'view' ? `<button class="btn custom-btn-blue mt-3" onclick="noticeEditMode(${data.PRD_ID})">수정</button>` : ''}
						         <button type="button" class="btn custom-btn-blue mt-3" id="saveProductBtn">${saveButtonText}</button>
						         <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">닫기</button>
			  
	    `;
		
	loadCommonCodesToSelect('prdColorSelect', 'opt_color', data.OPT_COLOR);
    loadCommonCodesToSelect('prdSizeSelect', 'opt_size', data.OPT_SIZE);
    loadCommonCodesToSelect('prdHeightSelect', 'opt_height', data.OPT_HEIGHT);
		
    const optionFields = document.getElementById('optionFields');
	const generateCombinationsBtn = document.getElementById('generateCombinationsBtn');
	if (generateCombinationsBtn) { // 버튼 요소가 존재하는지 먼저 확인
       	generateCombinationsBtn.onclick = generateAndDisplayCombinations; 
       	// 등록 모드에서만 이 버튼 활성화 (display 속성 제어)
	}
	const combinationsContainer = document.getElementById('optionCombinationsContainer');
	
	if (mode === 'new') {
		
		// 옵션 조합 생성 버튼 이벤트 리스너
	    if (optionFields) {
	        optionFields.style.display = 'none';
	    }
	} else if (mode === 'edit') {
		// 옵션 조합 생성 버튼 이벤트 리스너
		if (generateCombinationsBtn) {
	    	generateCombinationsBtn.style.display = 'none'; 
	    }
		
	    if (combinationsContainer) {
	        combinationsContainer.style.display = 'none';
	    }
		

		// '모두 선택' 체크박스 이벤트 리스너
		const selectAllOptions = document.getElementById('selectAllOptions');
		if (selectAllOptions) {
		    selectAllOptions.onclick = function() {
		        const checkboxes = document.querySelectorAll('#optionCombinationsTable tbody input[type="checkbox"]');
		        checkboxes.forEach(checkbox => {
		            checkbox.checked = this.checked;
		        });
		    };
		}
	}
		

			
	// 단위 셀렉트 박스
	//	loadPrdUnitTypes(data.PRD_SELECTED);
	loadCommonCodesToSelect('prdUnitSelect', 'prd_unit', data.PRD_SELECTED_UNIT); // 단위
	loadCommonCodesToSelect('prdTypeSelect', 'prd_type', data.PRD_SELECTED_TYPE); // 유형-카테고리
	   
	
	
	const saveProductBtn = document.getElementById('saveProductBtn');
	if (saveProductBtn) {
	    saveProductBtn.onclick = function() {
	        if (mode === 'new') {
	            console.log("새 제품 등록 로직 실행");
	             insertProduct(); // 새 제품 등록 함수 호출
	        } else if (mode === 'edit') {
	            console.log("제품 수정 로직 실행");
	             updateProduct(data.PRD_ID); // 제품 수정 함수 호출
	        }
	        // 저장 후 모달 닫기
	         const productEditModalInstance = bootstrap.Modal.getInstance(document.getElementById('productEditModal'));
	         if (productEditModalInstance) productEditModalInstance.hide();
	    };
	}
	
    // 모달 표시
    const modalEl = document.getElementById('exampleModal');
    const bsModal = new bootstrap.Modal(modalEl);
    bsModal.show();
}

//날짜 형식 함수
//날짜만 넣으면 년-월-일 형식, (날짜, true)하면 년-월-일 오전?오후 시:분 형식으로 출력
// 날짜 형식 함수 (업데이트된 버전)
// type="date" input을 위한 YYYY-MM-DD 형식만 반환하도록 합니다.
// (날짜, true) 시 시간을 포함하는 기능은 다른 용도로만 사용하고, input[type=date] 에는 false/생략으로 호출합니다.
function formatter(date, includeTime = false) {
    // 1. 입력된 날짜 값을 Date 객체로 변환 시도
    let d = new Date(date);

    // 2. Date 객체가 유효한지 확인
    // ISO 8601 문자열은 new Date()로 잘 파싱됩니다.
    // 하지만 만약 날짜가 유효하지 않다면 (예: 잘못된 문자열), isNaN(d.getTime())이 true를 반환합니다.
    if (isNaN(d.getTime())) {
        console.warn("formatter: 유효하지 않은 날짜 값:", date);
        return ''; // 유효하지 않으면 빈 문자열 반환
    }

    // 3. YYYY-MM-DD 형식으로 날짜 부분 구성
    const year = d.getFullYear();
    // getMonth()는 0부터 시작하므로 +1, 두 자리로 패딩
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');

    let result = `${year}-${month}-${day}`; // 이게 type="date" input에 들어갈 최종 형식입니다.

    // 4. 시간을 포함해야 할 경우에만 시간 정보 추가 (이 부분은 input[type=date]에는 필요 없음)
    if (includeTime) {
        // Intl.DateTimeFormat을 사용하여 시간 부분만 가져오도록 변경
        const timeParts = new Intl.DateTimeFormat('ko-KR', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true // 오전/오후 포함
        }).formatToParts(d);

        const getPart = type => timeParts.find(p => p.type === type)?.value;

        const dayPeriod = getPart('dayPeriod'); // '오전' or '오후'
        const hour = getPart('hour');
        const minute = getPart('minute');
        result += ` ${dayPeriod} ${hour}:${minute}`;
    }

    return result;
}

// 범용 공통코드 셀렉트 박스 로드 함수
async function loadCommonCodesToSelect(selectElementId, groupCode, selectedValue = null) {
    const select = document.getElementById(selectElementId);
    console.log(`[${groupCode}] 선택된 값:`, selectedValue);
    console.log(`[${groupCode}] groupCode??? :`, groupCode);
    if (!select) {
        console.error(`Error: <select> 요소를 찾을 수 없습니다. ID: ${selectElementId}`);
        return;
    }

    try {
        // groupCode를 쿼리 파라미터로 전달하여 해당 그룹의 공통코드를 요청
        const response = await fetch(`/SOLEX/products/api/prdUnitTypes?groupCode=${groupCode}`);
        console.log(`[${groupCode}] URL 호출 결과:`, response.status);

        if (!response.ok) {
            throw new Error(`[${groupCode}] 공통코드를 불러오지 못했습니다. 상태: ${response.status}`);
        }

        const responseData = await response.json();
        console.log(`[${groupCode}] 데이터 수신:`, JSON.stringify(responseData));

        const commonCodes = responseData.data; // 서버 응답 구조가 {"data": [...]} 라고 가정
		console.log('commonCodes??? ' + JSON.stringify(commonCodes));

        if (!Array.isArray(commonCodes)) {
            throw new Error(`[${groupCode}] 서버 응답 데이터 형식이 올바르지 않습니다. 배열이 아닙니다.`);
        }

        select.innerHTML = ''; // 기존 옵션 비우기

        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.textContent = '선택하세요';
        defaultOption.disabled = true;
        if (!selectedValue || selectedValue === '') {
            defaultOption.selected = true;
        }
        select.appendChild(defaultOption);

        commonCodes.forEach(codeItem => {
            const option = document.createElement('option');
            
			console.log('codeItem?? ?? ' + JSON.stringify(codeItem));
			option.value = codeItem.code || codeItem.DET_ID;        
            option.textContent = codeItem.name || codeItem.DET_NM;

            if (selectedValue !== null && String(option.value) === String(selectedValue)) {
                option.selected = true;
            }
            select.appendChild(option);
        });

    } catch (error) {
        console.error(`[${groupCode}] 공통코드 로드 중 오류 발생:`, error);
        alert(`[${groupCode}] 공통코드를 불러오는 데 실패했습니다.`);
    }
}



// 옵션 조합 생성 및 테이블에 표시
async function generateAndDisplayCombinations() {
	// 1. 현재 선택된 드롭다운 값 가져오기 (선택된 조합을 기본 체크하기 위함)
    const selectedColorCode = document.getElementById('prdColorSelect').value;
    const selectedSizeCode = document.getElementById('prdSizeSelect').value;
    const selectedHeightCode = document.getElementById('prdHeightSelect').value;


	// 2. 서버에서 각 옵션 그룹의 모든 공통 코드를 다시 가져오기 (비동기 병렬 처리)
    const [allColorsResponse, allSizesResponse, allHeightsResponse] = await Promise.all([
        fetch(`/SOLEX/products/api/prdUnitTypes?groupCode=opt_color`),
        fetch(`/SOLEX/products/api/prdUnitTypes?groupCode=opt_size`),
        fetch(`/SOLEX/products/api/prdUnitTypes?groupCode=opt_height`)
    ]);

    if (!allColorsResponse.ok || !allSizesResponse.ok || !allHeightsResponse.ok) {
        alert("옵션 데이터를 불러오는 데 실패했습니다. 서버 상태를 확인해주세요.");
        console.error("옵션 데이터 로드 실패:", allColorsResponse.status, allSizesResponse.status, allHeightsResponse.status);
        return;
    }

    const allColorsData = await allColorsResponse.json();
    const allSizesData = await allSizesResponse.json();
    const allHeightsData = await allHeightsResponse.json();

    const allColors = allColorsData.data;
    const allSizes = allSizesData.data;
    const allHeights = allHeightsData.data;

    if (!Array.isArray(allColors) || !Array.isArray(allSizes) || !Array.isArray(allHeights)) {
        alert("서버에서 받은 옵션 데이터 형식이 올바르지 않습니다.");
        console.error("잘못된 옵션 데이터 형식:", allColors, allSizes, allHeights);
        return;
    }

    const tbody = document.querySelector('#optionCombinationsTable tbody');
    tbody.innerHTML = ''; // 기존 조합 초기화

    allColors.forEach(color => {
        allSizes.forEach(size => {
            allHeights.forEach(height => {
                const row = tbody.insertRow();
                row.dataset.colorCode = color.code || color.DET_ID;
                row.dataset.sizeCode = size.code || size.DET_ID;
                row.dataset.heightCode = height.code || height.DET_ID;

                const checkboxCell = row.insertCell();
                
                // ⭐⭐ 여기 로직은 그대로 유지합니다.
                // 드롭다운에서 '선택하세요' (즉, value가 "")인 경우에도 isSelectedCombination은 false가 되므로,
                // 체크박스는 기본적으로 체크되지 않은 상태로 생성됩니다.
                const isSelectedCombination = 
                    (row.dataset.colorCode === selectedColorCode) &&
                    (row.dataset.sizeCode === selectedSizeCode) &&
                    (row.dataset.heightCode === selectedHeightCode) &&
                    // ⭐ 드롭다운에서 실제 유효한 값을 선택했을 때만 true가 되도록 조건 추가 ⭐
                    selectedColorCode !== "" && selectedSizeCode !== "" && selectedHeightCode !== "";
                
                checkboxCell.innerHTML = `<input type="checkbox" class="option-checkbox" ${isSelectedCombination ? 'checked' : ''}>`;
                
                row.insertCell().textContent = color.name || color.DET_NM;
                row.insertCell().textContent = size.name || size.DET_NM;
                row.insertCell().textContent = height.name || height.DET_NM;
            });
        });
    });

    // 모든 조합이 생성된 후, '모두 선택' 체크박스도 초기화
    const selectAllOptions = document.getElementById('selectAllOptions');
    if (selectAllOptions) {
        // 모든 조합이 체크되었다면 '모두 선택'도 체크, 아니면 해제
        // (드롭다운이 비어있으면 처음엔 아무것도 체크 안될 테니, 이 시점엔 selectAllOptions는 unchecked일 겁니다)
        const allCheckboxes = document.querySelectorAll('#optionCombinationsTable tbody input[type="checkbox"]');
        const allChecked = Array.from(allCheckboxes).every(cb => cb.checked);
        selectAllOptions.checked = allChecked; 
    }
}

// insertProduct 함수 (새로 구현할 부분)
async function insertProduct() {
    // 1. 제품 기본 정보 수집
    const prdNm = document.getElementById('prd_nm').value;
    const prdPrice = document.getElementById('prd_price').value;
    const prdRegDate = document.getElementById('PRD_REG_DATE').value;

    if (!prdNm || !prdPrice || !prdRegDate) {
        alert("제품명, 제품 가격, 등록일은 필수 입력 항목입니다.");
        return;
    }
    if (isNaN(prdPrice) || Number(prdPrice) <= 0) {
        alert("제품 가격은 유효한 숫자여야 합니다.");
        return;
    }

    // 2. 선택된 옵션 조합 수집
    const selectedOptions = [];
    document.querySelectorAll('#optionCombinationsTable tbody input.option-checkbox:checked').forEach(checkbox => {
        const row = checkbox.closest('tr');
        selectedOptions.push({
            opt_color: row.dataset.colorCode,
            opt_size: row.dataset.sizeCode,
            opt_height: row.dataset.heightCode
        });
    });

    if (selectedOptions.length === 0) {
        alert("하나 이상의 제품 옵션 조합을 선택해주세요.");
        return;
    }

    // 3. 서버로 보낼 전체 데이터 객체 생성
    const productRegistrationData = {
        product: { // 제품 기본 정보
            prdNm: prdNm,
            prdPrice: Number(prdPrice),
            prdRegDate: prdRegDate
        },
        options: selectedOptions // 선택된 옵션 조합 배열
    };

    console.log("등록할 제품 데이터:", JSON.stringify(productRegistrationData));

    // 4. Fetch API를 이용한 서버 전송
    try {
        const response = await fetch(`/SOLEX/products/api/products`, { // 새 제품 등록 API 엔드포인트
            method: 'POST', // 등록은 POST 메서드 사용
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(productRegistrationData),
        });

        if (response.ok) {
            const result = await response.json();
            alert("제품이 성공적으로 등록되었습니다: " + (result.message || ''));
            
            const productEditModal = bootstrap.Modal.getInstance(document.getElementById('productEditModal'));
            if (productEditModal) {
                productEditModal.hide(); // 모달 닫기
            }
            if (grid) {
                grid.readData(); // 그리드 데이터 새로고침
            }

        } else {
            const errorText = await response.text();
            alert("제품 등록에 실패했습니다: " + response.status + " " + errorText);
            console.error("제품 등록 실패:", errorText);
        }
    } catch (error) {
        console.error("제품 등록 중 네트워크 오류 또는 예외 발생:", error);
        alert("제품 등록 중 예상치 못한 오류가 발생했습니다.");
    }
}

async function insertProduct() {
    // 1. 제품 기본 정보 수집 (HTML ID 및 추가 필드 반영)
    const prdNm = document.getElementById('prd_nm').value;
    const prdPrice = document.getElementById('prd_price').value;
    const prdRegDate = document.getElementById('prd_reg_date').value; // ⭐ ID 수정: PRD_REG_DATE -> prd_reg_date

    // 추가된 필드들 (필요에 따라 추가)
    const prdCode = document.getElementById('prd_code').value;
    const prdUnit = document.getElementById('prdUnitSelect').value; // <select>의 value는 선택된 option의 value
    const prdType = document.getElementById('prdTypeSelect').value;
    const prdComm = document.getElementById('prd_comm').value;

    // 2. 유효성 검사 강화
    if (!prdNm) { alert("제품명을 입력해주세요."); return; }
    if (!prdPrice) { alert("제품 가격을 입력해주세요."); return; }
    if (isNaN(prdPrice) || Number(prdPrice) <= 0) {
        alert("제품 가격은 유효한 숫자여야 합니다.");
        return;
    }
    if (!prdCode) { alert("제품 코드를 입력해주세요."); return; }
    // SELECT 박스에 '선택하세요' 옵션의 value가 빈 문자열("")이므로, 아래와 같이 검사
    if (!prdUnit) { alert("제품 단위를 선택해주세요."); return; }
    if (!prdType) { alert("제품 유형을 선택해주세요."); return; }
    if (!prdComm) { alert("제품 설명을 입력해주세요."); return; }
    


    // 3. 선택된 옵션 조합 수집
    const selectedOptions = [];
    document.querySelectorAll('#optionCombinationsTable tbody input.option-checkbox:checked').forEach(checkbox => {
        const row = checkbox.closest('tr');
        selectedOptions.push({
            opt_color: row.dataset.colorCode,
            opt_size: row.dataset.sizeCode,
            opt_height: row.dataset.heightCode
        });
    });

    if (selectedOptions.length === 0) {
        alert("하나 이상의 제품 옵션 조합을 선택해주세요.");
        return;
    }

    // 4. 서버로 보낼 전체 데이터 객체 생성
    // DTO 필드명에 맞춰서 구성 (백엔드와 협의 필수!)
    const productRegistrationData = {
        // 백엔드 Product DTO의 필드명에 맞춰주세요.
        prd_nm: prdNm,         // 예: prdNm -> prd_nm
        prd_price: Number(prdPrice),
        prd_code: prdCode,
        prd_unit: prdUnit,
        prd_type: prdType,
        prd_comm: prdComm,
        prd_reg_date: prdRegDate,
        
        options: selectedOptions
    };

    console.log("등록할 제품 데이터:", JSON.stringify(productRegistrationData));

    // 5. Fetch API를 이용한 서버 전송
    try {
        // ⭐ API 엔드포인트도 백엔드와 정확히 일치하는지 다시 확인!
        const response = await fetch(`/SOLEX/products/api/productRegist`, { 
            method: 'POST', 
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(productRegistrationData),
        });

        if (response.ok) {
            const result = await response.json(); // 백엔드 응답이 JSON이라고 가정
            alert("제품이 성공적으로 등록되었습니다: " + (result.message || ''));
            
            // ⭐ 모달 ID 수정: productEditModal -> exampleModal
            const productModalInstance = bootstrap.Modal.getInstance(document.getElementById('exampleModal')); 
            if (productModalInstance) {
                productModalInstance.hide(); // 모달 닫기
            }
            if (window.grid) { // 'grid'가 전역 변수이고, window.grid로 접근 가능하다면
                window.grid.readData(); // 그리드 데이터 새로고침
            } else if (typeof loadProductList === 'function') { // 만약 그리드 새로고침 함수가 따로 있다면
                loadProductList(); // 제품 목록을 새로 불러오는 함수 호출
            }

        } else {
            // 서버에서 에러 메시지를 JSON 형태로 보낼 수도 있으므로 text() 대신 json() 시도
            const errorData = await response.json().catch(() => response.text()); // JSON 파싱 실패 시 일반 텍스트로
            const errorMessage = typeof errorData === 'object' ? (errorData.message || JSON.stringify(errorData)) : errorData;
            
            alert(`제품 등록에 실패했습니다: ${response.status} - ${errorMessage}`);
            console.error("제품 등록 실패 응답:", errorData);
        }
    } catch (error) {
        console.error("제품 등록 중 네트워크 오류 또는 예외 발생:", error);
        alert("제품 등록 중 예상치 못한 오류가 발생했습니다. 네트워크 연결을 확인해주세요.");
    }
}