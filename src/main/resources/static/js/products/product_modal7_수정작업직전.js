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


async function showProductModal(mode, data = null) {
    const modalTitle = document.getElementById('exampleModalLabel');
    const saveProductBtn = document.getElementById('saveProductBtn');
    const prdIdHiddenInput = document.getElementById('prd_id_hidden');

    // 모달 필드 초기화 (모든 입력 필드를 비움)
    const prdNmElement = document.getElementById('prd_nm');
    const prdPriceElement = document.getElementById('prd_price');
    const prdCodeElement = document.getElementById('prd_code');
    const prdUnitSelectElement = document.getElementById('prdUnitSelect');
    const prdTypeSelectElement = document.getElementById('prdTypeSelect');
    const prdCommElement = document.getElementById('prd_comm');
    const prdRegDateElement = document.getElementById('prd_reg_date');
    const prdUpDateElement = document.getElementById('prd_up_date');

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
    if (generateCombinationsBtn) { // 버튼 요소가 존재하는지 먼저 확인
        generateCombinationsBtn.onclick = generateAndDisplayCombinations;
    }
    // const combinationsContainer = document.getElementById('optionCombinationsContainer'); // 이 변수는 현재 사용되지 않습니다.
    // 옵션 요소 버튼 로직 --- 끝

    // 공통 필드 설정 및 로드 (모달이 열리기 전 미리 처리)
    if (mode === 'new') {
        modalTitle.textContent = '새 제품 등록';
        saveProductBtn.textContent = '등록 완료';
        saveProductBtn.onclick = () => processProductData('register'); 
        if (generateCombinationsBtn) generateCombinationsBtn.textContent = '옵션 등록';
        if (prdRegDateElement) prdRegDateElement.value = getNowForOracle(); 
        
        loadCommonCodesToSelect('prdUnitSelect', 'prd_unit');
        loadCommonCodesToSelect('prdTypeSelect', 'prd_type');
        
    } else if (mode === 'edit' && data) {
        modalTitle.textContent = '제품 정보 수정';
        saveProductBtn.textContent = '수정 완료';
        if (generateCombinationsBtn) generateCombinationsBtn.textContent = '옵션 수정';
        saveProductBtn.onclick = () => processProductData('update'); 
        
        // 모달 필드에 기존 데이터 채우기 (옵션 데이터를 가져오기 전에 미리 채움)
        if (prdIdHiddenInput) prdIdHiddenInput.value = data.PRD_ID;
        if (prdNmElement) prdNmElement.value = data.PRD_NM || '';
        if (prdPriceElement) prdPriceElement.value = data.PRD_PRICE || '';
        if (prdCodeElement) prdCodeElement.value = data.PRD_CODE || '';
        if (prdCommElement) prdCommElement.value = data.PRD_COMM || '';
        if (prdRegDateElement) prdRegDateElement.value = formatter(data.PRD_REG_DATE, true);
        
        loadCommonCodesToSelect('prdUnitSelect', 'prd_unit', data.PRD_SELECTED_UNIT);
        loadCommonCodesToSelect('prdTypeSelect', 'prd_type', data.PRD_SELECTED_TYPE);
    }

    const modalEl = document.getElementById('exampleModal');
    const productModal = new bootstrap.Modal(modalEl);

    // --- 여기부터 중요한 수정 ---
    // 모달이 완전히 표시된 후에만 옵션 그리드를 로드합니다.
    modalEl.addEventListener('shown.bs.modal', async () => { // await을 이 이벤트 리스너 안으로 옮깁니다.
        if (mode === 'edit' && data) {
            let productOptions = [];
            try {
                // await을 사용하여 productOptions를 동기적으로 기다립니다.
                const response = await fetch(`/SOLEX/products/api/productOptions?prdId=${data.PRD_ID}`);
                if (!response.ok) {
                    throw new Error('제품 옵션을 불러오는 데 실패했습니다.');
                }
                const result = await response.json();
                if (result.data) {
                    productOptions = result.data;
                }
            } catch (error) {
                console.error("제품 옵션 로드 오류:", error);
                alert("제품 옵션을 불러오는 중 오류가 발생했습니다.");
                productOptions = []; // 오류 발생 시에도 빈 배열로 진행
            }
            console.log('productOptions for grid:', productOptions);
            // 이제 모달이 완전히 표시되었으니 그리드를 안전하게 생성합니다.
            generateAndDisplayCombinations(true, productOptions);
        } else if (mode === 'new') {
            // 'new' 모드에서도 옵션 그리드를 초기화해야 한다면 여기에 호출
            // 예를 들어, 빈 상태의 그리드를 보여주고 싶을 때
            generateAndDisplayCombinations(false, []); // isAutoLoad는 false, 빈 데이터 전달
        }
    }, { once: true }); // 이 이벤트 리스너는 모달이 보여질 때 한 번만 실행되도록 설정

    // 모달이 완전히 닫혔을 때 페이지를 새로고침하는 이벤트 리스너를 등록
    modalEl.addEventListener('hidden.bs.modal', function () {
        location.reload(); 
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

// 각 색상 그룹별 Toast UI Grid 인스턴스를 저장할 Map
const toastGridInstances = new Map();
async function generateAndDisplayCombinations(isAutoLoad = false, data = null) {
    console.log(`옵션 그리드 ${isAutoLoad ? '자동 로드' : '수동 생성'} 시작`);
    console.log('data:', data);

    const [allColorsResponse, allSizesResponse, allHeightsResponse] = await Promise.all([
        fetch(`/SOLEX/products/api/prdUnitTypes?groupCode=opt_color`),
        fetch(`/SOLEX/products/api/prdUnitTypes?groupCode=opt_size`),
        fetch(`/SOLEX/products/api/prdUnitTypes?groupCode=opt_height`)
    ]);

    if (!allColorsResponse.ok || !allSizesResponse.ok || !allHeightsResponse.ok) {
        alert("옵션 데이터를 불러오는 데 실패했습니다.");
        return;
    }

    const allColors = (await allColorsResponse.json()).data;
    const allSizes = (await allSizesResponse.json()).data;
    const allHeights = (await allHeightsResponse.json()).data;

    const optionGroupsContainer = document.getElementById('optionGroupsContainer');
    if (!optionGroupsContainer) {
        alert("옵션 그룹 영역이 없습니다.");
        return;
    }
    optionGroupsContainer.innerHTML = '';

    const groupedCombinations = new Map();

    allColors.forEach(color => {
        const colorCode = color.code || color.DET_ID;
        const colorName = color.name || color.DET_NM;

        allSizes.forEach(size => {
            const sizeCode = size.code || size.DET_ID;
            const sizeName = size.name || size.DET_NM;

            allHeights.forEach(height => {
                const heightCode = height.code || height.DET_ID;
                const heightName = height.name || height.DET_NM;

                if (!groupedCombinations.has(colorCode)) {
                    groupedCombinations.set(colorCode, {
                        name: colorName,
                        combinations: []
                    });
                }

                let isSelected = false;
                if (isAutoLoad && data && Array.isArray(data)) {
                    isSelected = data.some(opt =>
                        opt.OPT_COLOR === colorCode &&
                        opt.OPT_SIZE === sizeCode &&
                        opt.OPT_HEIGHT === heightCode
                    );
                } else if (isAutoLoad && data) {
                    isSelected = (
                        data.OPT_COLOR === colorCode &&
                        data.OPT_SIZE === sizeCode &&
                        data.OPT_HEIGHT === heightCode
                    );
                }

                groupedCombinations.get(colorCode).combinations.push({
                    colorCode, colorName, sizeCode, sizeName, heightCode, heightName,
                    isSelected
                });
            });
        });
    });

    toastGridInstances.clear();

    groupedCombinations.forEach((colorGroup, colorCode) => {
        const optionGroupDiv = document.createElement('div');
        optionGroupDiv.classList.add('option-group', 'mb-4');

        const groupHeader = document.createElement('h4');
        groupHeader.classList.add('mb-2');
        groupHeader.textContent = `색상: ${colorGroup.name} (${colorCode})`;
        optionGroupDiv.appendChild(groupHeader);

        const gridContainer = document.createElement('div');
        gridContainer.id = `grid-color-${colorCode}`;
        optionGroupDiv.appendChild(gridContainer);
        optionGroupsContainer.appendChild(optionGroupDiv);

        const grid = new tui.Grid({
            el: gridContainer,
            data: colorGroup.combinations,
            rowHeaders: ['checkbox'],
            rowKey: (row) => `${row.colorCode}-${row.sizeCode}-${row.heightCode}`,
            rowClass: (row) => {
                return row.isSelected ? 'selected-row highlighted-row' : '';
            },
            columns: [
                { header: '색상', name: 'colorName', sortable: true, align: 'center' },
                { header: '사이즈', name: 'sizeName', sortable: true, align: 'center', filter: { type: 'text', showApplyBtn: true, showClearBtn: true } },
                { header: '높이', name: 'heightName', sortable: true, align: 'center', filter: { type: 'text', showApplyBtn: true, showClearBtn: true } },
                {
                    header: '관리',
                    name: 'actions',
                    align: 'center',
                    formatter: () => '<button class="btn btn-danger btn-sm delete-option-btn">삭제</button>'
                }
            ]
        });

        colorGroup.combinations.forEach((combo, index) => {
            if (combo.isSelected) {
                grid.check(index); // checkbox도 체크
            }
        });

        toastGridInstances.set(colorCode, grid);

        // 이벤트 처리
        grid.on('check', ev => {
            updateOverallSelectAllCheckbox();
        });
        grid.on('uncheck', ev => {
            updateOverallSelectAllCheckbox();
        });
        grid.on('click', ev => {
            if (ev.columnName === 'actions' && ev.target.classList.contains('delete-option-btn')) {
                grid.removeRow(ev.rowKey);
                updateOverallSelectAllCheckbox();
            }
        });
    });

    // 상단 전체 선택 체크박스
    const overallSelectAllOptions = document.getElementById('selectAllOptions');
    if (overallSelectAllOptions) {
        updateOverallSelectAllCheckbox();
        overallSelectAllOptions.onclick = (e) => {
            const isChecked = e.target.checked;
            toastGridInstances.forEach(grid => {
                isChecked ? grid.checkAll() : grid.uncheckAll();
            });
        };
    }

    function updateOverallSelectAllCheckbox() {
        if (!overallSelectAllOptions) return;
        let allChecked = true;
        toastGridInstances.forEach(grid => {
            if (grid.getCheckedRows().length !== grid.getRowCount()) {
                allChecked = false;
            }
        });
        overallSelectAllOptions.checked = allChecked;
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

    // 2. 유효성 검사 (변경 없음)
    if (!prdNm) { alert("제품명을 입력해주세요."); return; }
    if (!prdPrice || isNaN(prdPrice) || Number(prdPrice) <= 0) { alert("제품 가격을 올바르게 입력해주세요."); return; }
    if (!prdCode) { alert("제품 코드를 입력해주세요."); return; }
    if (!prdUnit) { alert("제품 단위를 선택해주세요."); return; }
    if (!prdType) { alert("제품 유형을 선택해주세요."); return; }
    if (!prdComm) { alert("제품 설명을 입력해주세요."); return; }
    console.log("기본 필드 유효성 검사 통과.");

    // ⭐ 3. 선택된 옵션 조합 수집 (mode에 따라 분기)
    const selectedOptions = [];
	
	if (mode === 'register') { // 등록 모드이고 옵션 그리드가 존재할 때
		toastGridInstances.forEach(gridInstance => {
	        const checkedRowsFromGrid = gridInstance.getCheckedRows();
	        checkedRowsFromGrid.forEach(row => {
	            selectedOptions.push({
	                opt_color: row.colorCode, // 예시: grid columns name이 'colorCode'인 경우
	                opt_size: row.sizeCode,
	                opt_height: row.heightCode,
	                opt_stock: Number(row.stock),
	                // opt_price: Number(row.price) // 필요한 경우 추가
	            });
	        });
		});
		if (selectedOptions.length === 0) {
            alert("하나 이상의 제품 옵션 조합을 선택해주세요.");
            return;
        }
    } else if (mode === 'update') { // 수정 모드일 때 (이전 HTML 테이블 방식 가정)
		
    }
    
    if (selectedOptions.length === 0 && mode === 'register') { // 등록 시 옵션 필수
        alert("하나 이상의 제품 옵션 조합을 선택해주세요.");
        return;
    }
    console.log("선택된 옵션:", selectedOptions);

    // 4. 서버로 보낼 전체 데이터 객체 생성 (변경 없음)
    const productData = {
        prd_nm: prdNm,
        prd_price: Number(prdPrice),
        prd_code: prdCode,
        prd_unit: prdUnit,
        prd_type: prdType,
        prd_comm: prdComm,
        prd_reg_date: prdRegDate, 
        options: selectedOptions // 옵션 데이터 포함
    };

    if (mode === 'update') {
        productData.prd_id = prdId; // 수정 시에만 ID 추가
    }

    console.log(`전송할 제품 데이터 (${mode === 'register' ? '등록' : '수정'}):`, JSON.stringify(productData));

    // 5. Fetch API를 이용한 서버 전송 (변경 없음)
    const apiUrl = mode === 'register' ? `/SOLEX/products/api/productRegist` : `/SOLEX/products/api/productUpdate`;
    const successMessage = mode === 'register' ? "등록" : "수정";
    const failMessage = mode === 'register' ? "등록" : "수정";

    try {
        const response = await fetch(apiUrl, {
            method: 'POST', 
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(productData),
        });

        if (response.ok) {
            const result = await response.json();
			alert(`제품이 성공적으로 ${mode === 'register' ? '등록' : '수정'}되었습니다: ` + (result.message || ''));

            // ⭐⭐⭐ 제품 등록/수정 성공 후 모달 필드 초기화 - 조건문 제거 ⭐⭐⭐
            // 입력 필드 초기화
            document.getElementById('prd_nm').value = '';
            document.getElementById('prd_price').value = '';
            document.getElementById('prd_code').value = '';
            document.getElementById('prd_comm').value = '';
            
            // 드롭다운 기본값으로 재설정 (첫 번째 옵션 선택 또는 빈 문자열)
            // 실제 드롭다운에 `--선택--` 등의 옵션이 있다면 그 value 값으로 설정하는 것이 좋습니다.
            // 없으면 빈 문자열로 설정하여 선택되지 않은 상태로 만듭니다.
            document.getElementById('prdUnitSelect').value = ''; 
            document.getElementById('prdTypeSelect').value = ''; 
            document.getElementById('prdColorSelect').value = ''; 
            document.getElementById('prdSizeSelect').value = '';
            document.getElementById('prdHeightSelect').value = '';

            // prd_id_hidden 필드도 초기화 (수정 완료 후 다시 등록 모드로 전환될 경우 대비)
            if (prdIdHiddenInput) {
                prdIdHiddenInput.value = '';
            }

            // 현재 날짜로 재설정
            const today = new Date();
            const year = today.getFullYear();
            const month = String(today.getMonth() + 1).padStart(2, '0');
            const day = String(today.getDate()).padStart(2, '0');
            document.getElementById('prd_reg_date').value = `${year}-${month}-${day}`;

            // Toast UI Grid 및 옵션 그룹 초기화
            const optionGroupsContainer = document.getElementById('optionGroupsContainer');
            if (optionGroupsContainer) {
                optionGroupsContainer.innerHTML = ''; // 생성된 그리드들을 모두 제거
            }
            // 전역 Toast UI Grid 인스턴스 맵 비우기
            if (window.toastGridInstances) {
                window.toastGridInstances.clear();
            }
            // 최상위 '모두 선택' 체크박스도 초기화
            const overallSelectAllOptions = document.getElementById('selectAllOptions');
            if (overallSelectAllOptions) {
                overallSelectAllOptions.checked = false;
            }
            // --- 초기화 로직 끝 ---

            // 모달 닫기
            const productModalInstance = bootstrap.Modal.getInstance(document.getElementById('exampleModal'));
            if (productModalInstance) {
                productModalInstance.hide();
            }
            // 제품 목록 새로고침
            if (window.grid && typeof window.grid.readData === 'function') {
                window.grid.readData();
            } else if (typeof loadProductList === 'function') {
//                loadProductList();
            }
			         
        } else {
            const errorData = await response.json().catch(() => response.text());
            const errorMessage = typeof errorData === 'object' ? (errorData.message || JSON.stringify(errorData)) : errorData;
            alert(`제품 ${failMessage}에 실패했습니다: ${response.status} - ${errorMessage}`);
            console.error(`제품 ${failMessage} 실패 응답:`, errorData);
        }
    } catch (error) {
        console.error(`제품 ${failMessage} 중 네트워크 오류 또는 예외 발생:`, error);
        alert(`제품 ${failMessage} 중 예상치 못한 오류가 발생했습니다. 네트워크 연결을 확인해주세요.`);
    }
}

// ⭐ 중요: 초기 로드 시 이미 체크되어 있는 체크박스에 대한 색상 적용 ⭐
// 이 부분은 generateAndDisplayCombinations 함수 끝에 추가하거나,
// 체크박스를 생성하는 루프 내에서 isSelectedCombination이 true일 때 바로 클래스를 추가해도 됩니다.
// 아래 코드를 generateAndDisplayCombinations 함수 가장 마지막에 추가하는 것을 권장합니다.
document.querySelectorAll('.option-checkbox:checked').forEach(checkedCb => {
    checkedCb.closest('tr').classList.add('selected-row');
});