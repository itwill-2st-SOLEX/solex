/* 2025 06 25 9:25 - 수정기능 작업전 */




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

// showProductModal 함수 수정 (옵션 그리드 초기화 및 관리 로직 변경)
function showProductModal(mode, data = null) {
    const modalTitle = document.getElementById('exampleModalLabel');
    const saveProductBtn = document.getElementById('saveProductBtn');
    const prdIdHiddenInput = document.getElementById('prd_id_hidden'); 
    const optionGridContainer = document.getElementById('option-grid-container'); // 옵션 테이블/그리드 컨테이너

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
    // 이는 요소가 HTML에 없을 때 발생할 수 있는 'Cannot set properties of null' 오류를 방지합니다.
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
	const optionFields = document.getElementById('optionFields');
	const generateCombinationsBtn = document.getElementById('generateCombinationsBtn');
	if (generateCombinationsBtn) { // 버튼 요소가 존재하는지 먼저 확인
       	generateCombinationsBtn.onclick = generateAndDisplayCombinations;
	}
	const combinationsContainer = document.getElementById('optionCombinationsContainer');
	// 옵션 요소 버튼 로직 --- 끝

    if (mode === 'new') {
        modalTitle.textContent = '새 제품 등록';
        saveProductBtn.textContent = '등록 완료';
        saveProductBtn.onclick = () => processProductData('register'); 
		generateCombinationsBtn.textContent = '옵션 등록';
        document.getElementById('prd_reg_date').value = getNowForOracle(); 
		
		loadCommonCodesToSelect('prdUnitSelect', 'prd_unit');
		loadCommonCodesToSelect('prdTypeSelect', 'prd_type');
		
    } else if (mode === 'edit' && data) {
        modalTitle.textContent = '제품 정보 수정';
        saveProductBtn.textContent = '수정 완료';
		generateCombinationsBtn.textContent = '옵션 수정';
        saveProductBtn.onclick = () => processProductData('update'); 
		
        // 모달 필드에 기존 데이터 채우기
        if (prdIdHiddenInput) prdIdHiddenInput.value = data.PRD_ID;
		
        document.getElementById('prd_nm').value = data.PRD_NM || '';
        document.getElementById('prd_price').value = data.PRD_PRICE || '';
        document.getElementById('prd_code').value = data.PRD_CODE || '';
        document.getElementById('prd_comm').value = data.PRD_COMM || '';
        document.getElementById('prd_reg_date').value = formatter(data.PRD_REG_DATE, true);
		
		loadCommonCodesToSelect('prdUnitSelect', 'prd_unit', data.PRD_SELECTED_UNIT)
		loadCommonCodesToSelect('prdTypeSelect', 'prd_type', data.PRD_SELECTED_TYPE);  
		loadCommonCodesToSelect('prdColorSelect', 'opt_color', data.OPT_COLOR);
	    loadCommonCodesToSelect('prdSizeSelect', 'opt_size', data.OPT_SIZE);
	    loadCommonCodesToSelect('prdHeightSelect', 'opt_height', data.OPT_HEIGHT);
    }

    const modalEl = document.getElementById('exampleModal');
    const productModal = new bootstrap.Modal(modalEl);
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

// 옵션 조합 생성 및 테이블에 표시 (그룹핑 포함)
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

    // 응답 에러 처리
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

    // 데이터 형식 유효성 검사
    if (!Array.isArray(allColors) || !Array.isArray(allSizes) || !Array.isArray(allHeights)) {
        alert("서버에서 받은 옵션 데이터 형식이 올바르지 않습니다.");
        console.error("잘못된 옵션 데이터 형식:", allColors, allSizes, allHeights);
        return;
    }

    // ⭐⭐ 메인 컨테이너 가져오기: 이 ID가 HTML에 정확히 있어야 합니다! ⭐⭐
    const optionGroupsContainer = document.getElementById('optionGroupsContainer');
    if (!optionGroupsContainer) {
        console.error("Error: '#optionGroupsContainer' element not found in the DOM.");
        // 사용자에게 오류 메시지를 표시하거나 다른 처리를 할 수 있습니다.
        alert("옵션 그룹을 표시할 공간을 찾을 수 없습니다. 개발자에게 문의하세요.");
        return;
    }
    optionGroupsContainer.innerHTML = ''; // 기존 옵션 그룹 초기화

    // 색상별로 옵션 조합을 그룹핑할 Map 생성
    // Map<String, List<{color, size, height}>> 형태
    const groupedCombinations = new Map();

    // 모든 가능한 조합 생성 및 색상별로 그룹핑
    allColors.forEach(color => {
        const colorCode = color.code || color.DET_ID; // 실제 DB 코드
        const colorName = color.name || color.DET_NM; // 사용자에게 보여줄 이름 (예: White)

        allSizes.forEach(size => {
            const sizeCode = size.code || size.DET_ID;
            const sizeName = size.name || size.DET_NM;

            allHeights.forEach(height => {
                const heightCode = height.code || height.DET_ID;
                const heightName = height.name || height.DET_NM;

                // 해당 색상 그룹이 없으면 새로 생성
                if (!groupedCombinations.has(colorCode)) {
                    groupedCombinations.set(colorCode, {
                        name: colorName, // 색상 이름 저장
                        combinations: []
                    });
                }
                // 현재 조합 추가
                groupedCombinations.get(colorCode).combinations.push({
                    colorCode, colorName, sizeCode, sizeName, heightCode, heightName,					
					// 기본 선택 여부도 데이터에 포함시킵니다.
					isSelected: (colorCode === selectedColorCode 
							  && sizeCode === selectedSizeCode 
							  && heightCode === selectedHeightCode 
							  && selectedColorCode !== "" 
							  && selectedSizeCode !== "" 
							  && selectedHeightCode !== "")
                });
            });
        });
    });
    // --- ⭐ 여기서부터 Toast UI Grid 관련 로직으로 변경됩니다. ⭐ ---
    toastGridInstances.clear(); // 기존 그리드 인스턴스 참조를 초기화

    groupedCombinations.forEach((colorGroup, colorCode) => {
        const optionGroupDiv = document.createElement('div');
        optionGroupDiv.classList.add('option-group', 'mb-4'); // 간격을 위해 mb-4 추가

        const groupHeader = document.createElement('h4');
        groupHeader.classList.add('mb-2'); // 제목 아래 간격 추가
        groupHeader.textContent = `색상: ${colorGroup.name} (${colorCode})`;
        optionGroupDiv.appendChild(groupHeader);

        // Toast UI Grid를 렌더링할 컨테이너 (각 색상 그룹마다 하나씩)
        const gridContainer = document.createElement('div');
        gridContainer.id = `grid-color-${colorCode}`; // 각 그리드에 고유 ID 부여
        optionGroupDiv.appendChild(gridContainer);
        optionGroupsContainer.appendChild(optionGroupDiv);

        // Toast UI Grid 인스턴스 생성
        const grid = new tui.Grid({
            el: gridContainer, // 그리드를 렌더링할 DOM 요소
            data: colorGroup.combinations, // 그룹화된 조합 데이터를 바로 사용
            rowHeaders: ['checkbox'], // 체크박스 행 헤더 추가
            columns: [
                {
                    header: '색상',
                    name: 'colorName',
					sortable: true,
					align: 'center'
                },
                {
                    header: '사이즈',
                    name: 'sizeName',
					sortable: true,
					align: 'center',
					filter: 
					{
			            type: 'text', 
			            showApplyBtn: true,
			            showClearBtn: true 
			        }
                },
                {
                    header: '높이',
                    name: 'heightName',
					sortable: true, 
					align: 'center',
					filter: 
					{
			            type: 'text', 
			            showApplyBtn: true,
			            showClearBtn: true 
			        }
                },
                 {
                    header: '관리', // 삭제 버튼 등을 넣을 셀
                    name: 'actions',
                    align: 'center',
					
                    formatter: () => {
                        return '<button class="btn btn-danger btn-sm delete-option-btn">삭제</button>';
                    }
                }
            ],
        });

        // 각 그리드 인스턴스를 Map에 저장하여 나중에 참조할 수 있도록 합니다.
        toastGridInstances.set(colorCode, grid);

        // 초기 선택된 행이 있다면 체크박스 상태 업데이트
        colorGroup.combinations.forEach((combo, index) => {
            if (combo.isSelected) {
                grid.check(index); // 해당 인덱스의 행 체크
            }
        });

        grid.on('checkAll', () => {
            updateOverallSelectAllCheckbox();
        });
        grid.on('uncheckAll', () => {
            updateOverallSelectAllCheckbox();
        });
		// 개별 체크박스 변경 시
		grid.on('check', (ev) => {
		    // 행에 'selected-row' 클래스 추가 (선택된 행 시각화)
		    // ⭐ getRowElement 대신 querySelector 사용
		    const rowElement = grid.el.querySelector(`.tui-grid-row[data-row-key="${ev.rowKey}"]`);
		    if (rowElement) {
		        rowElement.classList.add('selected-row');
		    }
		    updateColorGroupSelectAllCheckbox(grid);
		    updateOverallSelectAllCheckbox();
		});
		grid.on('uncheck', (ev) => {
		    // 행에 'selected-row' 클래스 제거
		    // ⭐ getRowElement 대신 querySelector 사용
		    const rowElement = grid.el.querySelector(`.tui-grid-row[data-row-key="${ev.rowKey}"]`);
		    if (rowElement) {
		        rowElement.classList.remove('selected-row');
		    }
		    updateColorGroupSelectAllCheckbox(grid);
		    updateOverallSelectAllCheckbox();
		});

        // 삭제 버튼 이벤트 리스너 (위에서 정의한 'actions' 컬럼의 버튼)
        grid.on('click', (ev) => {
            if (ev.columnName === 'actions' && ev.target.classList.contains('delete-option-btn')) {
                const rowKey = ev.rowKey;
                grid.removeRow(rowKey); // 행 삭제
                updateColorGroupSelectAllCheckbox(grid);
                updateOverallSelectAllCheckbox();
            }
        });
    });

    // --- ⭐ 체크박스 상태 동기화 함수 ⭐ ---

    // 최상위 '모두 선택' 체크박스 (#selectAllOptions)
    const overallSelectAllOptions = document.getElementById('selectAllOptions');
    if (overallSelectAllOptions) {
        // 초기 상태 업데이트
        updateOverallSelectAllCheckbox();

        // 최상위 '모두 선택' 체크박스 클릭 이벤트 리스너
        overallSelectAllOptions.onclick = (event) => { // addEventListener 대신 onclick으로 단순화
            const isChecked = event.target.checked;
            toastGridInstances.forEach(grid => {
                if (isChecked) {
                    grid.checkAll(); // 모든 그리드의 모든 행 선택
                } else {
                    grid.uncheckAll(); // 모든 그리드의 모든 행 선택 해제
                }
            });
        };
    }

    // 모든 색상 그룹의 '모두 선택' 체크박스 상태를 기반으로 전체 체크박스 상태를 업데이트하는 함수
    function updateOverallSelectAllCheckbox() {
        if (!overallSelectAllOptions) return;

        let allGridsAllChecked = true;
        if (toastGridInstances.size === 0) { // 생성된 그리드가 없으면 체크 해제
            allGridsAllChecked = false;
        } else {
            toastGridInstances.forEach(grid => {
                // Toast UI Grid의 checkAll / uncheckAll 상태는 `grid.getCheckedRows().length === grid.getRowCount()` 로 확인 가능
                if (grid.getCheckedRows().length !== grid.getRowCount()) {
                    allGridsAllChecked = false;
                }
            });
        }
        overallSelectAllOptions.checked = allGridsAllChecked;
    }

    // 특정 색상 그룹의 '모두 선택' 체크박스 상태를 업데이트하는 함수 (Toast UI Grid는 내부적으로 처리)
    // 이 함수는 사실상 필요 없을 수 있습니다. 각 그리드의 `rowHeaders: ['checkbox']`가 자동으로 헤더 체크박스를 관리하기 때문입니다.
    // 다만, 개별 행이 변경될 때 상위 헤더 체크박스를 강제로 업데이트해야 하는 경우에만 사용합니다.
    function updateColorGroupSelectAllCheckbox(grid) {
        // grid.checkAll() / grid.uncheckAll() 이벤트를 통해 자연스럽게 처리됩니다.
        // 명시적으로 업데이트하려면 `grid.getCheckedRows().length === grid.getRowCount()` 와 같은 방식으로 로직을 구현해야 합니다.
        // Toast UI Grid의 기본 동작을 신뢰하는 것이 좋습니다.
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
        alert("수정 모드에서 옵션 수집 로직은 아직 정의되지 않았습니다. 옵션이 전송되지 않을 수 있습니다.");
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