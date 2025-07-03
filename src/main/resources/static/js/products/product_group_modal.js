// 전역 변수로 옵션 데이터 저장 (공통 코드 로드 후)
let allColorOptions = [];
let allSizeOptions = [];
let allHeightOptions = [];
let toastGridInstances = [];



window.addEventListener('DOMContentLoaded', () => {
	document.getElementById('writeProductBtn').addEventListener('click', onWriteProduct);
	
	
	const productModalElement = document.getElementById('productModal');
	    if (productModalElement) {
	        productModalElement.addEventListener('shown.bs.modal', function () {
	            console.log('제품 모달이 완전히 표시되었습니다. selectpicker를 새로고침합니다.');
	            // 기존 selectpicker refresh는 그대로 둡니다.
	            $('.selectpicker').selectpicker('refresh');

	            // ⭐⭐ 여기에 data-bs-toggle 속성 제거 코드를 추가합니다 ⭐⭐
	            $('.bootstrap-select .dropdown-toggle').removeAttr('data-bs-toggle');
	            console.log('Bootstrap-select 버튼에서 data-bs-toggle 속성 제거 완료.');
	        });

	        // ⭐⭐ 새로 추가할 부분: '옵션 추가' 탭이 보여질 때 selectpicker 새로고침 ⭐⭐
	        const allOptionsTabButton = document.getElementById('all-options-tab');
	        if (allOptionsTabButton) {
	            allOptionsTabButton.addEventListener('shown.bs.tab', function (event) {
	                console.log('\'옵션 추가\' 탭이 활성화되었습니다. selectpicker를 새로고침합니다.');
	                $('.selectpicker').selectpicker('refresh');
	                // 탭이 변경될 때도 data-bs-toggle을 다시 제거해 주는 것이 좋습니다.
	                $('.bootstrap-select .dropdown-toggle').removeAttr('data-bs-toggle');
	            });
	        }
	    }
	
	
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

















async function showProductModal(mode, data = null) {
    const modalTitle = document.getElementById('productModalLabel');
    const saveProductBtn = document.getElementById('saveProductBtn');
    const prdIdHiddenInput = document.getElementById('prd_id_hidden');

    // 모달 필드 초기화 (모든 입력 필드를 비움)
    const prdNmElement = document.getElementById('prd_nm');
    const prdPriceElement = document.getElementById('prd_price');
    const prdCodeElement = document.getElementById('prd_code');
    const prdUnitSelectElement = document.getElementById('prdUnitSelect');
    const prdTypeSelectElement = document.getElementById('prdTypeSelect'); // 유형
	const prdProcessDiv = document.getElementById('prd_process'); // 공정순서
    const prdCommElement = document.getElementById('prd_comm');
    const prdRegDateElement = document.getElementById('prd_reg_date');
    const prdUpDateElement = document.getElementById('prd_up_date');
	
	// Bootstrap-select 초기화
    $('#colorMultiSelect').selectpicker('deselectAll'); // 모든 선택 해제
    $('#sizeMultiSelect').selectpicker('deselectAll');
    $('#heightMultiSelect').selectpicker('deselectAll');
    // 비활성화된 옵션이 있다면 다시 활성화
    $('#colorMultiSelect').find('option').prop('disabled', false);
    $('#sizeMultiSelect').find('option').prop('disabled', false);
    $('#heightMultiSelect').find('option').prop('disabled', false);
    $('#colorMultiSelect').selectpicker('refresh');
    $('#sizeMultiSelect').selectpicker('refresh');
    $('#heightMultiSelect').selectpicker('refresh');

    // 모든 요소가 null이 아닌지 먼저 확인하고 값을 비워줍니다.
    if (prdNmElement) prdNmElement.value = '';
    if (prdPriceElement) prdPriceElement.value = '';
    if (prdCodeElement) prdCodeElement.value = '';
    if (prdUnitSelectElement) prdUnitSelectElement.value = '';
    if (prdTypeSelectElement) prdTypeSelectElement.value = '';
    if (prdCommElement) prdCommElement.value = '';
    if (prdRegDateElement) prdRegDateElement.value = '';
    if (prdUpDateElement) prdUpDateElement.value = '';
    
    // hidden input 필드 초기화 (수정 시 PRD_ID 저장)
    if (prdIdHiddenInput) prdIdHiddenInput.value = '';

    // 옵션 요소 버튼 로직 --- 시작
    const generateCombinationsBtn = document.getElementById('generateCombinationsBtn');

    // 공통 필드 설정 및 로드 (모달이 열리기 전 미리 처리)
    if (mode === 'new') {
        modalTitle.textContent = '새 제품 등록';
        saveProductBtn.textContent = '등록 완료';
        saveProductBtn.onclick = () => processProductData('register'); 
        if (generateCombinationsBtn) {
//            generateCombinationsBtn.textContent = '옵션 등록'; // 이 줄은 주석 처리 또는 삭제
			generateCombinationsBtn.style.display='none'; // 버튼 숨김 처리
            generateCombinationsBtn.removeAttribute('disabled'); // 새 제품에 대해 활성화 상태 보장
            // generateCombinationsBtn에 대한 클릭 이벤트는 이제 탭 변경 이벤트에 의해 처리됩니다.
            // 이 특정 요청의 경우, 탭이 디스플레이를 트리거할 것입니다.
        }
        if (prdRegDateElement) prdRegDateElement.value = getNowForOracle(); 
        
		// 새로운 제품 등록 시 3개 멀티 셀렉트 초기화 (선택된 옵션 없음)
        await populateSelectPickers([]); // 빈 배열 전달 (선택된 옵션 없음)
		
		
        await loadCommonCodesToSelect('prdUnitSelect', 'prd_unit');
        await loadCommonCodesToSelect('prdTypeSelect', 'prd_type');
        
    } else if (mode === 'edit' && data) { // ⭐⭐ 이 부분 수정 ⭐⭐
        modalTitle.textContent = '제품 상세정보';
		
		try {
		    const existingProductOptions = await fetch(`/SOLEX/products/api/productOptions?prdId=${data.PRD_ID}`).then(res => {
		        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
		        return res.json();
		    });
		    console.log('Fetched existingProductOptions for edit mode:', existingProductOptions);
		    // window.currentProductExistingOptions에 실제 데이터 배열을 할당
            window.currentProductExistingOptions = existingProductOptions; // 서버 응답 전체 객체 할당
		    await populateSelectPickers(existingProductOptions); // 기존 옵션 전달
		} catch (error) {
		    console.error('기존 제품 옵션 로드 실패:', error);
		    await populateSelectPickers([]); // 실패 시 빈 상태로 초기화 (옵션 목록만 보임)
		}
		
		// 250626 제품 이름, 가격, 설명만 수정, 옵션은 추가만 가능, 삭제 불가.
		const editableElements = document.getElementsByClassName('read_only');
		Array.from(editableElements).forEach(element => {
		    element.setAttribute('readonly', 'readonly');
		});
		
		// ⭐⭐ 기존: 모든 select를 비활성화하는 코드 삭제 또는 주석 처리 ⭐⭐
		// const selectElements = document.querySelectorAll('select');
		// selectElements.forEach(select => {
		// 	select.setAttribute('disabled', 'disabled');
		// });
        
        // ⭐⭐ 새로 추가: 필요한 경우 특정 select만 비활성화 (제품 단위, 제품 유형 등) ⭐⭐
        // 제품 단위와 제품 유형을 수정 모드에서 비활성화하려면 아래 코드를 사용하세요.
        // 만약 이들도 수정 가능하게 하려면 이 코드도 삭제합니다.
        if (prdUnitSelectElement) {
             $(prdUnitSelectElement).prop('disabled', true).selectpicker('refresh');
        }
        if (prdTypeSelectElement) {
             $(prdTypeSelectElement).prop('disabled', true).selectpicker('refresh');
        }
        // 멀티 셀렉트 박스 (컬러, 사이즈, 굽)는 활성화 상태를 유지해야 하므로,
        // 이들을 명시적으로 비활성화하는 코드는 넣지 않습니다.

		saveProductBtn.textContent='수정 완료';
		saveProductBtn.onclick = () => processProductData('update'); 
		
		
        // 모달 필드에 기존 데이터 채우기 (옵션 데이터를 가져오기 전에 미리 채움)
        if (prdIdHiddenInput) prdIdHiddenInput.value = data.PRD_ID;
        if (prdNmElement) prdNmElement.value = data.PRD_NM || '';
        if (prdPriceElement) prdPriceElement.value = data.PRD_PRICE || '';
        if (prdCodeElement) prdCodeElement.value = data.PRD_CODE || '';
        if (prdCommElement) prdCommElement.value = data.PRD_COMM || '';
        if (prdRegDateElement) prdRegDateElement.value = formatter(data.PRD_REG_DATE, true);
        
        await loadCommonCodesToSelect('prdUnitSelect', 'prd_unit', data.PRD_UNIT); // 수정: data.PRD_SELECTED_UNIT -> data.PRD_UNIT
        await loadCommonCodesToSelect('prdTypeSelect', 'prd_type', data.PRD_TYPE); // 수정: data.PRD_SELECTED_TYPE -> data.PRD_TYPE
		// 이 부분은 loadCommonCodesToSelect가 이미 옵션을 채워주고, 멀티 셀렉트에는 사용되지 않는 것 같으므로 제거하거나 확인 필요
		// await loadCommonCodesToSelect('prdSizeSelect', 'opt_size', data.OPT_SIZE);
	    // await loadCommonCodesToSelect('prdHeightSelect', 'opt_height', data.OPT_HEIGHT);
    }
	const modalEl = document.getElementById('productModal');
    const productModal = new bootstrap.Modal(modalEl);

	
	// ⭐⭐ 공정 순서 로딩 로직 시작 ⭐⭐
    const processTypeChange = async () => { // 이벤트 객체를 직접 받지 않으므로 `event` 파라미터 제거
        const selectedPrdType = prdTypeSelectElement.value; // 직접 요소에서 값을 가져옴
		
        if (!selectedPrdType) {
            prdProcessDiv.innerHTML = '<p>공정순서를 보시려면 제품 유형을 선택해주세요.</p>';
            return;
        }

        try {
            const response = await fetch(`/SOLEX/products/api/processByPrdType?prd_type=${selectedPrdType}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const processData = await response.json();
            console.log('서버에서 받은 공정 데이터:', processData);

            if (processData && processData.length > 0) {
                let htmlContent = '<span><strong>생산 공정 순서</strong></span>';
                htmlContent += '<ol>';
                processData.forEach(process => {
                    htmlContent += `
                        <li>
                            ${process.PRC_NM}(<small>${process.PRC_CODE}</small>)<br>
                            <span style="font-size: 0.9em; color: #666;">${process.PRC_DES || '설명 없음'}</span>
                        </li>
                    `;
                });
                htmlContent += '</ol>';
                prdProcessDiv.innerHTML = htmlContent;
            } else {
                prdProcessDiv.innerHTML = '<p class="empty-process-message">해당 제품 유형에 대한 공정 정보가 없습니다.</p>';
            }

        } catch (error) {
            console.error('공정 정보를 가져오는데 실패했습니다:', error);
            prdProcessDiv.innerHTML = '<p style="color: red;">공정 정보를 불러오는 중 오류가 발생했습니다.</p>';
        }
    };

    // 기존 리스너 제거 (중복 방지) - 이전에 이 리스너를 붙였다면 _changeListener 속성에 저장되어 있을 것입니다.
    if (prdTypeSelectElement._processChangeListener) {
        prdTypeSelectElement.removeEventListener('change', prdTypeSelectElement._processChangeListener);
    }
    // 새로운 리스너 부착
    prdTypeSelectElement.addEventListener('change', processTypeChange);
    // 리스너 함수를 요소에 저장하여 나중에 제거할 수 있도록 함
    prdTypeSelectElement._processChangeListener = processTypeChange;
	
	
    // 해당 select 요소에 'change' 이벤트를 강제로 한번 더 발생시켜야 할 수도 있습니다.
    if (prdTypeSelectElement.value) {
		console.log("초기 공정 순서 로드 시도 (prdTypeSelectElement.value 있음):", prdTypeSelectElement.value);
		processTypeChange();
    } else {
        // 선택된 값이 없으면 초기화 메시지 표시
        prdProcessDiv.innerHTML = '<p>공정순서를 보시려면 제품 유형을 선택해주세요.</p>';
    }
    // ⭐⭐ 공정 순서 로딩 로직 끝 ⭐⭐
	
	
    // "모든 옵션 추가" 탭에 대한 탭 이벤트 리스너
    const allOptionsTabBtn = document.getElementById('all-options-tab');
    if (allOptionsTabBtn) {
        // 탭 콘텐츠가 표시된 후에 실행되도록 Bootstrap의 `shown.bs.tab` 이벤트를 사용합니다.
        allOptionsTabBtn.addEventListener('shown.bs.tab', async () => {
            console.log("모든 옵션 추가 탭이 활성화되었습니다.");
            // 탭이 표시될 때 generateAndDisplayCombinations를 호출합니다.
            // 'new' 모드에서는 초기에 데이터가 null이므로 isAutoLoad는 false가 됩니다.
            // 'edit' 모드에서는 기존 제품 옵션을 미리 선택하기 위한 데이터가 포함될 수 있습니다.
            if (mode === 'new') {
//                await generateAndDisplayCombinations(false, []); // 새 제품의 경우, 미리 선택할 기존 데이터 없음
            } else if (mode === 'edit' && data) {
                // 편집 모드인 경우, 기존 제품 옵션을 가져와 generateAndDisplayCombinations로 전달합니다.
                let productOptions = [];
                try {
                    const response = await fetch(`/SOLEX/products/api/productOptions?prdId=${data.PRD_ID}`);
                    if (!response.ok) {
                        throw new Error('제품 옵션을 불러오는 데 실패했습니다.');
                    }
                    const result = await response.json();
                    if (result.data) {
                        productOptions = result.data;
                    }
                } catch (error) {
                    console.error("제품 옵션 로드 오류 (탭 활성화 시):", error);
                    alert("제품 옵션을 불러오는 중 오류가 발생했습니다.");
                    productOptions = [];
                }
//                await generateAndDisplayCombinations(true, productOptions); // isAutoLoad를 true로 설정하여 기존 옵션 표시
            }
        });
    }

    // 모달이 완전히 표시된 후에만 옵션 그리드를 로드합니다.
    modalEl.addEventListener('shown.bs.modal', async () => {
        // 'my-options-tab'에 초기 로딩이 필요한 경우
        // 'edit' 모드의 경우, 기존 제품 옵션을 'myOptionsContent'에 로드합니다.
        if (mode === 'edit' && data) {
            let productOptions = [];
            try {
				// 1. 제품 옵션 목록 불러오기
                const response = await fetch(`/SOLEX/products/api/productOptions?prdId=${data.PRD_ID}`);
                if (!response.ok) {
                    throw new Error('제품 옵션을 불러오는 데 실패했습니다.');
                }
                const result = await response.json();
                if (result.data) {
                    productOptions = result.data;
                }
				
				// 2. 총 옵션 개수 불러오기 (새로운 fetch 요청 추가)
				console.log('result ? ' + JSON.stringify(result)); // result.opt_count
				console.log('result.opt_count ? ' + JSON.stringify(result.opt_count)); // result.opt_count

                // ⭐ generateCombinationsBtn을 숨기고, '내 옵션' 탭에 건수 표시 ⭐
                const myOptionsTab = document.getElementById('my-options-tab');
                if (myOptionsTab) {
                    // 탭 버튼의 텍스트를 '내 옵션 (XX건)' 형식으로 업데이트합니다.
                    myOptionsTab.textContent = `내 옵션 (${result.opt_count}건)`;
                }
                const generateCombinationsBtn = document.getElementById('generateCombinationsBtn');
                if (generateCombinationsBtn) {
                    generateCombinationsBtn.style.display = 'none'; // 버튼을 숨깁니다.
                    // generateCombinationsBtn.setAttribute('disabled', 'true'); // 이 줄은 이제 필요 없습니다.
                }
            } catch (error) {
                console.error("제품 옵션 로드 오류:", error);
                alert("제품 옵션을 불러오는 중 오류가 발생했습니다.");
                productOptions = []; // 오류 발생 시에도 빈 배열로 진행
            }
            console.log('productOptions for grid:', productOptions);
			// --- TUI Grid 로직 시작 (myOptionsContent용) ---
           	const currentOptionsGridContainer = document.getElementById('currentOptionsGridContainer');
            if (currentOptionsGridContainer) {
                currentOptionsGridContainer.innerHTML = ''; // 이전 콘텐츠 지우기
                const grid = new tui.Grid({
                   el: currentOptionsGridContainer, 
                   data: productOptions,     
                   scrollX: false,
                   scrollY: false,
                   columns: [
                       {
                           header: '색상', 
                           name: 'COLORNAME',
						   align: 'center',
						   sortable: true ,
                           filter: { type: 'text', showApplyBtn: true, showClearBtn: true } 
                       },
                       {
                           header: '사이즈',
                           name: 'SIZENAME',
                           align: 'center',
						   sortable: true ,
                           filter: { type: 'text', showApplyBtn: true, showClearBtn: true } 
                       },
                       {
                           header: '높이',
                           name: 'HEIGHTNAME',
                           align: 'center',
						   sortable: true ,
                           filter: { type: 'number', showApplyBtn: true, showClearBtn: true }
                       }
                       
                   ],
                   summary: { // 요약 정보를 표시하고 싶다면 추가
                   }
               });
            }
        } else if (mode === 'new') {
            // 'new' 모드에서는 'myOptionsContent'가 비어있거나 메시지를 표시해야 합니다.
            const currentOptionsGridContainer = document.getElementById('currentOptionsGridContainer');
            if (currentOptionsGridContainer) {
                currentOptionsGridContainer.innerHTML = '<p class="text-muted">아직 등록된 옵션이 없습니다. "모든 옵션 추가" 탭에서 옵션을 선택해주세요.</p>';
            }
            // 새 제품의 경우, 'allOptionsContent'에 미리 선택할 기존 데이터는 아직 없습니다.
            // 탭 리스너가 'allOptionsContent'에 대해 generateAndDisplayCombinations 호출을 처리할 것입니다.
        }
    }, { once: true }); // 이 이벤트 리스너는 모달 자체를 위한 것으로, 한 번 표시되면 실행됩니다.

    // 모달이 완전히 닫혔을 때 페이지를 새로고침하는 이벤트 리스너를 등록
    modalEl.addEventListener('hidden.bs.modal', function () {
        location.reload(); 
		// 모달 닫힐 때, prdTypeSelectElement에 붙였던 리스너도 제거
	    if (prdTypeSelectElement._processChangeListener) {
	        prdTypeSelectElement.removeEventListener('change', prdTypeSelectElement._processChangeListener);
	        prdTypeSelectElement._processChangeListener = null; // 참조 제거
	    }
    }, { once: true }); // 한 번만 실행 후 리스너 제거

    // 마지막으로 모달을 표시합니다.
    productModal.show();
}

























function getNowForOracle() {
    const now = new Date();

    const yyyy = now.getFullYear();
    const MM = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');

    const hh = String(now.getHours()).padStart(2, '0');
    const mi = String(now.getMinutes()).padStart(2, '0');

    return `${yyyy}-${MM}-${dd} ${hh}:${mi}`;
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

// 옵션 테이블 구성 시작
// 각 드롭다운을 초기화하고 옵션을 채워넣는 함수
async function populateSelectPickers(existingOptions = []) {
	
	console.log('existingOptions : ', existingOptions);
	// 공통 코드 로드 (allColorOptions 등이 채워져야 함)
    // 데이터가 아직 로드되지 않았을 때만 API 호출 (중복 호출 방지)
    if (allColorOptions.length === 0 || allSizeOptions.length === 0 || allHeightOptions.length === 0) {
        try {
            // Promise.all 내에서 각 fetch 응답을 JSON으로 파싱하도록 수정
            const [colorsData, sizesData, heightsData] = await Promise.all([
                fetch(`/SOLEX/products/api/prdUnitTypes?groupCode=opt_color`).then(res => res.json()), // ⭐ .then(res => res.json()) 추가 ⭐
                fetch(`/SOLEX/products/api/prdUnitTypes?groupCode=opt_size`).then(res => res.json()),   // ⭐ .then(res => res.json()) 추가 ⭐
                fetch(`/SOLEX/products/api/prdUnitTypes?groupCode=opt_height`).then(res => res.json())  // ⭐ .then(res => res.json()) 추가 ⭐
            ]);

            // 파싱된 JSON 데이터를 전역 변수에 할당 (const로 새로 선언하지 않음)
            allColorOptions = colorsData;
            allSizeOptions = sizesData;
            allHeightOptions = heightsData;

            console.log('Common codes loaded successfully for select pickers.');
            console.log('allColorOptions:', allColorOptions); // 로드된 데이터 확인용
            console.log('allSizeOptions:', allSizeOptions);
            console.log('allHeightOptions:', allHeightOptions);

        } catch (error) {
            console.error('Failed to load common codes for select pickers:', error);
            alert('옵션 데이터를 불러오는 데 실패했습니다. 페이지를 새로고침하거나 관리자에게 문의하세요.');
            return; // 데이터 로드 실패 시 함수 종료
        }
    }

    const colorSelect = $('#colorMultiSelect');
    const sizeSelect = $('#sizeMultiSelect');
    const heightSelect = $('#heightMultiSelect');
	
	// 1. 각 드롭다운 비우고 옵션 채우기
    colorSelect.empty();
    // ⭐⭐ allColorOptions.data.forEach로 변경 ⭐⭐
    allColorOptions.data.forEach(option => { 
        colorSelect.append(`<option value="${option.DET_ID}">${option.DET_NM}</option>`);
    });

    sizeSelect.empty();
    // ⭐⭐ allSizeOptions.data.forEach로 변경 ⭐⭐
    allSizeOptions.data.forEach(option => {
        sizeSelect.append(`<option value="${option.DET_ID}">${option.DET_NM}</option>`);
    });

    heightSelect.empty();
    // ⭐⭐ allHeightOptions.data.forEach로 변경 ⭐⭐
    allHeightOptions.data.forEach(option => {
        heightSelect.append(`<option value="${option.DET_ID}">${option.DET_NM}</option>`);
    });

    // Bootstrap-select 초기화/갱신
    colorSelect.selectpicker('refresh');
    sizeSelect.selectpicker('refresh');
    heightSelect.selectpicker('refresh');

    // 2. 수정 모드일 때 기존 옵션들을 드롭다운에서 비활성화/숨김 처리 (이전 가이드와 동일)
	if (existingOptions && Array.isArray(existingOptions.data) && existingOptions.data.length > 0) {
        console.log('Applying existing options for disable/hide:', existingOptions);
        const existingColorIds = new Set(existingOptions.map(opt => String(opt.OPT_COLOR)));
        const existingSizeIds = new Set(existingOptions.map(opt => String(opt.OPT_SIZE)));
        const existingHeightIds = new Set(existingOptions.map(opt => String(opt.OPT_HEIGHT)));

        colorSelect.find('option').each(function() {
            if (existingColorIds.has($(this).val())) {
                $(this).prop('disabled', true);
            } else {
                $(this).prop('disabled', false);
            }
        });
        sizeSelect.find('option').each(function() {
            if (existingSizeIds.has($(this).val())) {
                $(this).prop('disabled', true);
            } else {
                $(this).prop('disabled', false);
            }
        });
        heightSelect.find('option').each(function() {
            if (existingHeightIds.has($(this).val())) {
                $(this).prop('disabled', true);
            } else {
                $(this).prop('disabled', false);
            }
        });
        
        colorSelect.selectpicker('refresh');
        sizeSelect.selectpicker('refresh');
        heightSelect.selectpicker('refresh');
    }


}


// 제품코드 중복확인 
const checkDuplicateUrl = '/SOLEX/products/api/checkPrdCode'; 
// 비동기 처리를 위해 async/await 또는 .then().catch() 사용
async function checkPrdCode(code) {
    try {
        const response = await fetch(`/SOLEX/products/api/checkPrdCode?prdCode=${code}`); // GET 요청 예시
		
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json(); // 서버에서 JSON 응답을 기대

		console.log('prd code data???' + JSON.stringify(data))
		
        // 서버 응답 형태에 따라 변경될 수 있음.
        if (data.isDuplicate) { // 또는 data.exists 등 서버 응답에 따라
            alert("이미 존재하는 제품 코드입니다. 다른 코드를 입력해주세요.");
            return true; // 중복됨
        } else {
            return false; // 중복 아님
        }
    } catch (error) {
        console.error("제품 코드 중복 확인 중 오류 발생:", error);
        alert("제품 코드가 중복됩니다. 다시 시도해주세요.");
        return true; // 오류 발생 시 일단 중복으로 처리하여 저장을 막음 (또는 다른 로직)
    }
}

// ⭐ 통합된 제품 등록/수정 처리 함수
async function processProductData(mode) { 
    console.log(`제품 ${mode === 'register' ? '등록' : '수정'} 시작`);

    // 1. 제품 기본 정보 수집 (변경 없음)
    const prdIdHiddenInput = document.getElementById('prd_id_hidden');
    const prdId = mode === 'update' && prdIdHiddenInput ? prdIdHiddenInput.value : null;

    const prdNm = document.getElementById('prd_nm').value;
    const prdPrice = document.getElementById('prd_price').value;
    const prdCode = document.getElementById('prd_code').value;
    const prdUnit = document.getElementById('prdUnitSelect').value;
    const prdType = document.getElementById('prdTypeSelect').value;
    const prdComm = document.getElementById('prd_comm').value;
    const prdRegDate = document.getElementById('prd_reg_date').value; 
    // 수정일은 update 모드에서 현재 시간으로 자동 설정
    const prdUpDate = mode === 'update' ? getNowForOracle() : null;
	
	const selectedColors = $('#colorMultiSelect').val() || []; // 선택된 컬러 ID 배열
   	const selectedSizes = $('#sizeMultiSelect').val() || [];   // 선택된 사이즈 ID 배열
   	const selectedHeights = $('#heightMultiSelect').val() || []; // 선택된 굽 ID 배열
 	

    // 2. 유효성 검사 (변경 없음)
    if (!prdNm) { alert("제품명을 입력해주세요."); return; }
    if (!prdCode) { alert("제품 코드를 입력해주세요."); return; }
	const prdCodePattern = /^[A-Z]{4}$/;
	if (!prdCodePattern.test(prdCode)) {
	    alert("제품 코드는 대문자 4글자로 입력해주세요.");
	    return;
	}
	// DB 중복 확인
	if (mode === 'register') {
        const isDuplicate = await checkPrdCode(prdCode);
        if (isDuplicate) {
            // 경고 메시지는 이미 checkPrdCode 함수 안에서 띄워졌으므로 여기서는 추가 작업 없이 종료
            return;
        }
	}
    if (!prdPrice || isNaN(prdPrice) || Number(prdPrice) <= 0) { alert("제품 가격을 올바르게 입력해주세요."); return; }
    if (!prdType) { alert("제품 유형을 선택해주세요."); return; }
    if (!prdUnit) { alert("제품 단위를 선택해주세요."); return; }
    console.log("기본 필드 유효성 검사 통과.");

    // ⭐ 3. 선택된 옵션 조합 수집
    const selectedOptions = [];
	
	// 등록 모드 또는 수정 모드 모두 Toast UI Grid에서 선택된 옵션을 가져옵니다.
    // generateAndDisplayCombinations에서 이미 그리드가 생성되었고 데이터가 로드된 상태라고 가정합니다.
    if (mode === 'register' || mode === 'update') {
		selectedColors.forEach(colorId => {
	        selectedSizes.forEach(sizeId => {
	            selectedHeights.forEach(heightId => {
	                selectedOptions.push({
	                    OPT_COLOR: colorId,
	                    OPT_SIZE: sizeId,
	                    OPT_HEIGHT: heightId,
	                    OPT_YN: 'Y' // 항상 'Y'로 저장 (선택된 옵션이므로)
	                });
	            });
	        });
	    });

        // 등록 모드에서는 옵션 선택이 필수
        if (mode === 'register' && selectedOptions.length === 0) {
            alert("하나 이상의 제품 옵션 조합을 선택해주세요.");
            return;
        }
    }
	
	// ⭐⭐ 4. 수정 모드에서 옵션 중복 유효성 검사 (새로 추가) ⭐⭐
    if (mode === 'update') {
//        const existingOptions = window.currentProductExistingOptions || [];
		const existingOptions = (window.currentProductExistingOptions && window.currentProductExistingOptions.data) || [];

//        if (selectedOptions.length === 0) {
//            alert("수정할 옵션 조합을 하나 이상 선택해주세요.");
//            return;
//        }

        for (const newOption of selectedOptions) {
            // 현재 선택된 옵션 조합이 기존 옵션들과 정확히 일치하는지 확인
            const isDuplicate = existingOptions.some(existing => {
                return existing.OPT_COLOR === newOption.OPT_COLOR &&
                       existing.OPT_SIZE === newOption.OPT_SIZE &&
                       existing.OPT_HEIGHT === newOption.OPT_HEIGHT;
            });

            if (isDuplicate) {
                alert(`오류: 이미 존재하는 옵션 조합이 있습니다. \n\n색상: ${newOption.OPT_COLOR}\n사이즈: ${newOption.OPT_SIZE}\n굽: ${newOption.OPT_HEIGHT}\n\n이 조합은 다시 추가할 수 없습니다.`);
                return; // 중복 발견 시 함수 실행 중단
            }
        }
        console.log("수정 모드: 선택된 옵션 조합 중복 유효성 검사 통과.");
    }
    // ⭐⭐ 유효성 검사 끝 ⭐⭐
    
    console.log("선택된 옵션:", selectedOptions);
    
    // 4. 서버로 전송할 데이터 객체 구성
    const productData = {
        prd_nm: prdNm,
        prd_price: prdPrice,
        prd_code: prdCode,
        prd_unit: prdUnit,
        prd_type: prdType,
        prd_comm: prdComm,
        prd_reg_date: prdRegDate,
        // 수정 모드일 경우에만 prd_id와 prd_up_date를 포함
        ...(mode === 'update' && { prd_id: prdId, prd_up_date: prdUpDate }),
        options: selectedOptions // 수집된 옵션 데이터
    };
	if (mode === 'edit') {
       productData.PRD_ID = prd_id; // 수정 모드일 때만 PRD_ID 포함
   	}

    // 5. API 호출 (변경 없음)
    const url = mode === 'register' ? '/SOLEX/products/api/productRegist' : '/SOLEX/products/api/productUpdate';
    const method = 'POST'; // 등록/수정 모두 POST 사용

    try {
        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(productData)
        });

        const result = await response.json();

        if (response.ok) {
            alert(result.message);
            // 모달 닫기
            const modalEl = document.getElementById('productModal');
            const productModal = bootstrap.Modal.getInstance(modalEl); // 현재 열린 모달 인스턴스 가져오기
            if (productModal) {
                productModal.hide(); // 모달 숨기기 -> 'hidden.bs.modal' 이벤트가 발동하여 페이지 새로고침
            }
        } else {
            // 서버에서 에러 메시지를 반환하는 경우
            alert(result.message || `제품 ${mode === 'register' ? '등록' : '수정'} 실패`);
            console.error(`Error during product ${mode}:`, result.message || 'Unknown error');
        }
    } catch (error) {
        console.error(`Fetch error during product ${mode}:`, error);
        alert(`네트워크 오류 또는 서버 응답 오류가 발생했습니다: ${error.message}`);
    }
}