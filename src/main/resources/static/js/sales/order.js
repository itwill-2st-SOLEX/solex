// 1. 전역 변수 설정
let currentPage = 0;
const pageSize = 20;
const gridHeight = 600;
let searchKeyword = '';
let isLoading = false;
let hasMoreData = true;
let isSelectClient = false;
let isSelectProduct = false;
let selectProductCd = "";
let selectClientCd = "";
let TUI_GRID_INSTANCE; // 전역 그리드 인스턴스
let INNER_TUI_GRID_INSTANCE;
let uniqueColors, uniqueSizes, uniqueHeights;
let selectProductNm = "";
let clientVirtualSelect; // clientVirtualSelect를 전역으로 이동
let productVirtualSelect;
let originalOptionsData = [];
let lastLoadedProductCd = null; // 마지막으로 로드된 상품 코드를 추적


document.addEventListener('DOMContentLoaded', init);


function init() {
    initializeGrid();
    bindGlobalEventListeners();
    initializeOrderModal();
    fetchGridData();
}


function initializeGrid() {
    TUI_GRID_INSTANCE = new tui.Grid({
        el: document.getElementById('grid'),
        bodyHeight: gridHeight,
        scrollY: true, scrollX: false, data: [],
        columns: [
            { header: '수주 번호', name: 'ORD_ID', width: 100, align: 'center', sortable: true },
            { header: '거래처 명', name: 'CLI_NM', align: 'center', sortable: true },
            { header: '거래처 대표자', name: 'CLI_CEO', align: 'center', sortable: true },
            { header: '배송지', name: 'ORD_ADDRESS', width: 300, align: 'center', sortable: true },
            { header: '납품 요청일', name: 'ORD_END_DATE', align: 'center', sortable: true },
            { header: '상태 변경일', name: 'ORD_MOD_DATE', align: 'center', sortable: true }
        ],
    });
    TUI_GRID_INSTANCE.on('scrollEnd', async () => {
        if (hasMoreData && !isLoading) {
            currentPage++;
            await fetchGridData(currentPage, searchKeyword);
        }
    });
    TUI_GRID_INSTANCE.on('click', async (ev) => {
        if (ev.columnName === 'ORD_ID') {
			const rowData = TUI_GRID_INSTANCE.getRow(ev.rowKey);
			const ordId = rowData.ORD_ID;
			openDetailModal(ordId);
		}
    });
}
async function openDetailModal(ordId) {
    const myModalElement = document.getElementById('myModal');
    const modalInstance = bootstrap.Modal.getOrCreateInstance(myModalElement);
    
    resetOrderForm();
    initializeInnerGrid();

    try {
        const response = await fetch(`/SOLEX/orders/${ordId}`); 
        if (!response.ok) {
            throw new Error(`주문 정보를 불러오는 데 실패했습니다. (상태: ${response.status})`);
        }
        const fullOrderData = await response.json();
        console.log("서버로부터 받은 전체 상세 데이터:", fullOrderData);

        const orderInfo = fullOrderData.orderInfo;
        const orderItems = fullOrderData.orderItems;
        const availableOptions = fullOrderData.availableOptions;

        if (orderInfo && orderInfo.PRODUCT_ID) {
            lastLoadedProductCd = orderInfo.PRODUCT_ID;
        }

        initDate();
        populateMainForm(orderInfo);
        setupModalSelectBoxes(orderInfo);
        loadAllProductOptions(availableOptions); 

        if (orderItems && orderItems.length > 0) {
            INNER_TUI_GRID_INSTANCE.resetData(orderItems);
        }

        modalInstance.show();

    } catch (error) {
        console.error('상세 조회 처리 중 오류 발생:', error);
        alert(error.message);
    }
}

function populateMainForm(orderInfo) {
    if (!orderInfo) return;
    document.getElementById('odd_end_date').value = orderInfo.DELIVERY_DATE;
    document.getElementById('odd_pay_date').value = orderInfo.PAYMENT_DATE;
    document.getElementById('pay_type').value = orderInfo.PAYMENT_TYPE || '';
    document.getElementById('odd_pay').value = orderInfo.PAYMENT_AMOUNT ? formatWithComma(String(orderInfo.PAYMENT_AMOUNT)) : '';
    document.getElementById('cli_pc').value = orderInfo.POSTAL_CODE || '';
    document.getElementById('cli_add').value = orderInfo.BASE_ADDRESS || '';
    document.getElementById('cli_da').value = orderInfo.DETAIL_ADDRESS || '';
}



function initializeInnerGrid() {
    if (INNER_TUI_GRID_INSTANCE && document.getElementById('innerGrid')) {
        INNER_TUI_GRID_INSTANCE.clear();
        return;
    }

    INNER_TUI_GRID_INSTANCE = new tui.Grid({
        el: document.getElementById('innerGrid'),
        rowHeaders: ['checkbox'],
        scrollX: false,
        scrollY: true,
        bodyHeight: 200,
        columns: [
            { header: '상품명', name: 'PRODUCT_NAME', width: 150, align: 'center' },
            { header: '색상', name: 'COLOR_NAME', align: 'center' },
            { header: '사이즈', name: 'SIZE_NAME', align: 'center' },
            { header: '굽높이', name: 'HEIGHT_NAME', align: 'center' },
            { header: '수량', name: 'QUANTITY', align: 'right', editor: 'text'},
            // 숨겨진 코드 값 컬럼들
            { header: '상품코드', name: 'PRODUCT_ID', hidden: true },
            { header: '색상코드', name: 'COLOR_ID', hidden: true },
            { header: '사이즈코드', name: 'SIZE_ID', hidden: true },
            { header: '굽높이코드', name: 'HEIGHT_ID', hidden: true },
        ],
        data: []
    });

    const deleteBtn = document.getElementById('deleteSelectedRowsBtn');
    if (deleteBtn) {
        const toggleButtonState = () => {
            deleteBtn.disabled = INNER_TUI_GRID_INSTANCE.getCheckedRows().length === 0;
        };
        INNER_TUI_GRID_INSTANCE.on('check', toggleButtonState);
        INNER_TUI_GRID_INSTANCE.on('uncheck', toggleButtonState);
        INNER_TUI_GRID_INSTANCE.on('checkAll', toggleButtonState);
        INNER_TUI_GRID_INSTANCE.on('uncheckAll', toggleButtonState);
    }
}

function initializeOrderModal() {
    const myModalElement = document.getElementById('myModal');
    if (!myModalElement) return;
    const orderRegisterModalInstance = new bootstrap.Modal(myModalElement);


    // ▼▼▼ 여기에 VirtualSelect 인스턴스 생성 로직을 추가합니다. ▼▼▼
    clientVirtualSelect = VirtualSelect.init({
        ele: '#cli_nm_virtual_select',
        placeholder: "거래처를 검색하세요...",
        search: true,
        clearButton: true,
        onServerSearch: debounce(async (searchValue, virtualSelectInstance) => {
            // fetchAndSetClientOptions 함수가 이제 인스턴스를 직접 받도록 수정될 수 있습니다.
            await fetchAndSetClientOptions(searchValue, clientVirtualSelect); 
        }, 300)
    });

    productVirtualSelect = VirtualSelect.init({
        ele: '#prd_nm_virtual_select',
        placeholder: "제품명을 검색하세요...",
        search: true,
        clearButton: true,
        onServerSearch: debounce(async (searchValue, virtualSelectInstance) => {
            await fetchAndSetProductOptions(searchValue, productVirtualSelect);
        }, 300)
    });

    myModalElement.addEventListener('click', function(event) {
        const selectBox = event.target.closest('.select-box');
        if (selectBox) {
            event.stopPropagation();
            const wrapper = selectBox.closest('.custom-select-wrapper');
            if (!wrapper) return;
            wrapper.classList.toggle('open');
            document.querySelectorAll('.custom-select-wrapper.open').forEach(openWrapper => {
                if (openWrapper !== wrapper) {
                    openWrapper.classList.remove('open');
                }
            });
        }
    });
    
    myModalElement.addEventListener('hidden.bs.modal', () => {
        // 인스턴스를 파괴하는 대신, 선택된 값만 리셋합니다.
        if (clientVirtualSelect) clientVirtualSelect.reset();
        if (productVirtualSelect) productVirtualSelect.reset();
    });

    document.getElementById('openOrderModalBtn')?.addEventListener('click', () => {
        resetOrderForm();
        setupModalSelectBoxes(); // 이제 이 함수는 '리셋' 역할을 합니다.
        initializeInnerGrid();
        initDate();
        orderRegisterModalInstance.show();
    });

    document.getElementById('submitOrderBtn')?.addEventListener('click', submitForm);
}


async function setupModalSelectBoxes(orderInfo = null) {
    if (orderInfo) {
        // [상세 보기 경우] 받아온 데이터로 값을 설정합니다.
        
        // 1. 거래처 설정
        if (orderInfo.CLIENT_ID && orderInfo.CLIENT_NAME) {
            // setOptions: 드롭다운 목록을 설정합니다. (서버 검색 전 임시로 보여줄 단일 옵션)
            clientVirtualSelect.setOptions([{ label: orderInfo.CLIENT_NAME, value: orderInfo.CLIENT_ID }]);
            // setValue: 해당 값을 선택합니다.
            clientVirtualSelect.setValue(orderInfo.CLIENT_ID);
        } else {
            clientVirtualSelect.reset();
        }

        // 2. 제품명 설정
        if (orderInfo.PRODUCT_ID && orderInfo.PRODUCT_NAME) {
            productVirtualSelect.setOptions([{ label: orderInfo.PRODUCT_NAME, value: orderInfo.PRODUCT_ID }]);
            productVirtualSelect.setValue(orderInfo.PRODUCT_ID);
        } else {
            productVirtualSelect.reset();
        }

    } else {
        // [신규 등록 경우] 모든 값을 리셋하고, 검색을 위한 전체 목록을 불러옵니다.
        clientVirtualSelect.reset();
        productVirtualSelect.reset();
        
        // 최초 검색 목록 로드
        await fetchAndSetClientOptions('', clientVirtualSelect);
        await fetchAndSetProductOptions('', productVirtualSelect);
    }
}
function bindGlobalEventListeners() {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        const triggerSearch = () => {
            searchKeyword = searchInput.value;
            resetAndFetchGridData();
        };
        document.getElementById('searchButton')?.addEventListener('click', triggerSearch);
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') triggerSearch();
        });
    }

    document.getElementById('findPostCodeBtn')?.addEventListener('click', findPostCode);
    document.getElementById('addRowBtn')?.addEventListener('click', addRowToInnerGrid);
    attachNumericFormatter('odd_pay');

    const deleteSelectedRowsBtn = document.getElementById('deleteSelectedRowsBtn');
    if (deleteSelectedRowsBtn) {
        deleteSelectedRowsBtn.addEventListener('click', function() {
            const rowKeys = INNER_TUI_GRID_INSTANCE.getCheckedRowKeys();
            if (rowKeys.length === 0) {
                alert('삭제할 항목을 먼저 선택해주세요.');
                return;
            }
            INNER_TUI_GRID_INSTANCE.removeRows(rowKeys);
            console.log(rowKeys.length + '개의 항목이 삭제되었습니다.');
            // 버튼 비활성화 체크
             if (INNER_TUI_GRID_INSTANCE.getCheckedRows().length === 0) {
                 deleteSelectedRowsBtn.disabled = true;
             }
        });
    }

    const resetItemsBtn = document.getElementById('resetItemsBtn');
    if (resetItemsBtn) {
        resetItemsBtn.addEventListener('click', function() {
            if (INNER_TUI_GRID_INSTANCE) {
                INNER_TUI_GRID_INSTANCE.clear();
            }
        });
    }
}

function addRowToInnerGrid() {
    const selectedColors = document.getElementById('opt_color')?.value.split(',').filter(Boolean);
    const selectedSizes = document.getElementById('opt_size')?.value.split(',').filter(Boolean);
    const selectedHeights = document.getElementById('opt_height')?.value.split(',').filter(Boolean);
 
    if (!isSelectProduct) {
        alert('먼저 상품을 선택해주세요.');
        return;
    }
    if (selectedColors.length === 0 || selectedSizes.length === 0 || selectedHeights.length === 0) {
        alert('색상, 사이즈, 굽높이를 각각 하나 이상 선택해주세요.');
        return;
    }
 
    const validCombinations = originalOptionsData.filter(option =>
        selectedColors.includes(option.OPT_COLOR) &&
        selectedSizes.includes(option.OPT_SIZE) &&
        selectedHeights.includes(option.OPT_HEIGHT)
    );
 
    if (validCombinations.length === 0) {
        alert("선택하신 옵션에 해당하는 유효한 제품 조합이 없습니다.");
        return;
    }
 
    const existingRows = INNER_TUI_GRID_INSTANCE.getData();
    let addedCount = 0;
    let skippedCount = 0;

    const productName = selectProductNm;
    const productCode = selectProductCd;

    validCombinations.forEach(item => {
        const isDuplicate = existingRows.some(row =>
            row.productCode === productCode &&
            row.colorCode === item.OPT_COLOR &&
            row.sizeCode === item.OPT_SIZE &&
            row.heightCode === item.OPT_HEIGHT
        );

        if (!isDuplicate) {
            const newRowData = {
                productName: productName,
                productCode: productCode,
                colorName: item.OPT_COLOR_NM,
                colorCode: item.OPT_COLOR,
                sizeName: item.OPT_SIZE_NM,
                sizeCode: item.OPT_SIZE,
                heightName: item.OPT_HEIGHT_NM,
                heightCode: item.OPT_HEIGHT,
                quantity: 1
            };
            INNER_TUI_GRID_INSTANCE.appendRow(newRowData);
            addedCount++;
        } else {
            skippedCount++;
        }
    });
 
    if (addedCount > 0) {
        console.log(`${addedCount}개의 새로운 항목이 추가되었습니다.`);
    }
    if (skippedCount > 0) {
        alert(`${skippedCount}개의 항목은 이미 목록에 존재하여 추가되지 않았습니다.`);
    }
 
    resetOptionForms();
}

function resetOptionForms() {
    ['color', 'size', 'height'].forEach(type => {
        const wrapper = document.getElementById(`${type}CustomSelectWrapper`);
        if (wrapper) {
            const visibleInput = wrapper.querySelector('.select-box input');
            if (visibleInput) visibleInput.value = '';
            
            const hiddenInput = document.getElementById(`opt_${type}`);
            if (hiddenInput) hiddenInput.value = '';

            const optionsContainer = wrapper.querySelector('.options-container');
            if (optionsContainer) {
                 // 드롭다운 내부의 옵션들에서 'selected' 클래스 제거
                 optionsContainer.querySelectorAll('.option.selected').forEach(opt => {
                    opt.classList.remove('selected');
                });
            }
        }
    });
    
    console.log("옵션 선택 폼이 초기화되었습니다.");
}


// ===================================================================
// 데이터 로딩 및 그리드 관리 함수 섹션
// ===================================================================

async function fetchGridData(page = 0, currentSearchKw = '') {
    if (isLoading) return;
    isLoading = true;
    try {
        const params = new URLSearchParams({ page, size: pageSize }); // API 파라미터명 size로 통일
        if (currentSearchKw) params.append('searchKeyword', currentSearchKw);
        const response = await fetch(`/SOLEX/orders/gridData?${params.toString()}`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        if (page === 0) TUI_GRID_INSTANCE.resetData(data);
        else TUI_GRID_INSTANCE.appendRows(data);
        hasMoreData = data.length === pageSize;
    } catch (error) {
        console.error('그리드 데이터 로딩 중 오류 발생:', error);
        hasMoreData = false;
    } finally {
        isLoading = false;
    }
}

function resetAndFetchGridData() {
    currentPage = 0;
    hasMoreData = true;
    TUI_GRID_INSTANCE.clear(); // resetData 대신 clear 사용
    fetchGridData(0, searchKeyword);
}


// ===================================================================
// 모달 내부 데이터 로딩 (Virtual Select & Custom Select)
// ===================================================================
async function loadClientDataForModal(orderData = null) {
    const el = document.getElementById('cli_nm_virtual_select');
    if (!el || el.virtualSelectInstance) return;

    const initialOptions = [];
    let initialValue = null;

    if (orderData && orderData.CLIENT_ID && orderData.CLIENT_NAME) {
        initialOptions.push({ label: orderData.CLIENT_NAME, value: orderData.CLIENT_ID });
        initialValue = orderData.CLIENT_ID;
    }

    const vsInst = VirtualSelect.init({
        ele: el,
        options: initialOptions,
        selectedValue: initialValue,
        placeholder: "거래처를 검색하세요...",
        search: true,
        clearButton: true,
        onServerSearch: debounce(async (searchValue, virtualSelectInstance) => {
            await fetchAndSetClientOptions(searchValue, virtualSelectInstance);
        }, 300)
    });

    vsInst.$ele.addEventListener('change', async () => {
        selectClientCd = vsInst.getValue();
        isSelectClient = !!selectClientCd;
        await getClientInfo(selectClientCd);
    });
    
    clientVirtualSelect = vsInst;
    el.virtualSelectInstance = vsInst;

    if (!initialValue) {
        await fetchAndSetClientOptions("", vsInst);
    }
}

async function fetchAndSetClientOptions(searchValue, virtualSelectInstance) {
    const params = new URLSearchParams({ page: 0, pageSize: 50 });
    if (searchValue) params.append('searchKeyword', searchValue.trim());
    try {
        const resp = await fetch(`/SOLEX/orders/clients?${params.toString()}`);
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
        const json = await resp.json();
        const options = json.map(item => ({ label: item.CLI_NM, value: item.CLI_ID }));
        virtualSelectInstance.setServerOptions(options);
    } catch (err) { console.error('거래처 검색 오류:', err); }
}
async function loadProductDataForModal(orderData = null) {
    const el = document.getElementById('prd_nm_virtual_select');
    if (!el || el.virtualSelectInstance) return;

    const initialOptions = [];
    let initialValue = null;

    if (orderData && orderData.PRODUCT_ID && orderData.PRODUCT_NAME) {
        initialOptions.push({ label: orderData.PRODUCT_NAME, value: orderData.PRODUCT_ID });
        initialValue = orderData.PRODUCT_ID;
    }

    const vsInst = VirtualSelect.init({
        ele: el,
        options: initialOptions,
        selectedValue: initialValue,
        placeholder: "제품명을 검색하세요...",
        search: true,
        clearButton: true,
        onServerSearch: debounce(async (s, v) => { await fetchAndSetProductOptions(s, v); }, 300)
    });

    vsInst.$ele.addEventListener('change', async () => {
        const selected = vsInst.getSelectedOptions();
        selectProductCd = selected ? selected.value : '';
        selectProductNm = selected ? selected.label : '';
        isSelectProduct = !!selectProductCd;

        if (selectProductCd === lastLoadedProductCd) return; // 이미 로드된 상품이면 중복 실행 방지
        
        resetOrderStep('color');
        if (isSelectProduct) {
            await loadAllProductOptions(selectProductCd); // 제품코드로 옵션 로드
            lastLoadedProductCd = selectProductCd; // 마지막 로드된 상품코드 기록
        } else {
            lastLoadedProductCd = null;
        }
    });

    productVirtualSelect = vsInst;
    el.virtualSelectInstance = vsInst;
    if (!initialValue) {
        await fetchAndSetProductOptions("", vsInst);
    }
}
async function fetchAndSetProductOptions(searchValue, virtualSelectInstance) {
    const params = new URLSearchParams();
    if (searchValue) params.append('searchKeyword', searchValue.trim());
    try {
        const resp = await fetch(`/SOLEX/orders/products?${params.toString()}`);
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
        const json = await resp.json();
        const options = json.map(item => ({ label: item.PRD_NM, value: item.PRD_ID }));
        virtualSelectInstance.setServerOptions(options);
    } catch (err) { console.error('상품 검색 오류:', err); }
}

async function loadAllProductOptions(data) {
    console.log("loadAllProductOptions 함수가 받은 데이터:", data);

    let optionsData;

    if (typeof data === 'string' || typeof data === 'number') {
        if (!data) return;
        try {
            const response = await fetch(`/SOLEX/orders/product/${data}`);
            if (!response.ok) throw new Error(`상품 옵션 로딩 실패 (HTTP ${response.status})`);
            optionsData = await response.json();
        } catch (error) {
            console.error("제품 코드로 옵션 로딩 중 오류 발생:", error);
            return;
        }
    } else if (Array.isArray(data)) {
        optionsData = data;
    } else {
        console.log("loadAllProductOptions: 처리할 데이터 없음. 옵션 폼 초기화.");
        resetOrderStep('color');
        return;
    }

    if (!optionsData || optionsData.length === 0) {
        console.log("처리할 옵션 데이터가 없습니다.");
        resetOrderStep('color');
        return;
    }

    originalOptionsData = optionsData;
    
    uniqueColors = new Map();
    uniqueSizes = new Map();
    uniqueHeights = new Map();

    optionsData.forEach(option => {
        if (option.OPT_COLOR && option.OPT_COLOR_NM) uniqueColors.set(option.OPT_COLOR, option.OPT_COLOR_NM);
        if (option.OPT_SIZE && option.OPT_SIZE_NM) uniqueSizes.set(option.OPT_SIZE, option.OPT_SIZE_NM);
        if (option.OPT_HEIGHT && option.OPT_HEIGHT_NM) uniqueHeights.set(option.OPT_HEIGHT, option.OPT_HEIGHT_NM);
    });

    const colorOptions = Array.from(uniqueColors);
    const sizeOptions = Array.from(uniqueSizes).sort((a, b) => Number(a[1]) - Number(b[1]));
    const heightOptions = Array.from(uniqueHeights).sort((a, b) => Number(a[1]) - Number(b[1]));

    const optionConfigs = {
        color: { data: colorOptions, multi: true },
        size: { data: sizeOptions, multi: true },
        height: { data: heightOptions, multi: true }
    };

    for (const [type, { data: configData, multi }] of Object.entries(optionConfigs)) {
        const container = document.querySelector(`#${type}CustomSelectWrapper .options-container`);
        if (container) {
            container.innerHTML = '';
            configData.forEach(([value, label]) => {
                container.innerHTML += `<div class="option" data-value="${value}">${label}</div>`;
            });
            initializeCustomSelect(`${type}CustomSelectWrapper`, multi);
        }
    }
}
async function getClientInfo(clientCode) {
    const fields = { cli_phone: '', cli_mgr_name: '', cli_mgr_phone: '' };
    if (clientCode) {
        try {
            const resp = await fetch(`/SOLEX/clients/${clientCode}`);
            if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
            const json = await resp.json();
            fields.cli_phone = json.data.CLI_PHONE || '';
            fields.cli_mgr_name = json.data.CLI_MGR_NAME || '';
            fields.cli_mgr_phone = json.data.CLI_MGR_PHONE || '';
        } catch (err) { console.error('거래처 정보 조회 오류:', err); }
    }
    Object.entries(fields).forEach(([id, value]) => {
        const el = document.getElementById(id);
        if (el) el.value = value;
    });
}

// ===================================================================
// 커스텀 셀렉트 박스 핵심 로직
// ===================================================================
function initializeCustomSelect(wrapperId, isMultiSelect = false) {
    const wrapper = document.getElementById(wrapperId);
    if (!wrapper) return;

    const optionsContainer = wrapper.querySelector('.options-container');
    const input = wrapper.querySelector('.select-box input');
    const type = wrapperId.replace('CustomSelectWrapper', '');
    const hiddenInput = document.getElementById(`opt_${type}`);
    
    const selectedValues = new Set(hiddenInput.value.split(',').filter(Boolean));

    optionsContainer.querySelectorAll('.option').forEach(option => {
        option.addEventListener('click', (e) => {
            e.stopPropagation();
            const value = option.getAttribute('data-value');

            if (isMultiSelect) {
                option.classList.toggle('selected');
                if (selectedValues.has(value)) {
                    selectedValues.delete(value);
                } else {
                    selectedValues.add(value);
                }
            } else {
                optionsContainer.querySelector('.option.selected')?.classList.remove('selected');
                option.classList.add('selected');
                selectedValues.clear();
                if (value) selectedValues.add(value);
                wrapper.classList.remove('open');
            }
            updateDisplayValue(optionsContainer, input, hiddenInput, selectedValues);
        });
         // 초기 상태 반영
        if (selectedValues.has(option.getAttribute('data-value'))) {
            option.classList.add('selected');
        }
    });
    
    updateDisplayValue(optionsContainer, input, hiddenInput, selectedValues);
}

function updateDisplayValue(optionsContainer, input, hiddenInput, selectedValues) {
    const labels = Array.from(selectedValues).map(val => {
        const opt = optionsContainer.querySelector(`.option[data-value="${val}"]`);
        return opt ? opt.textContent : '';
    }).filter(Boolean);

    let displayText = '';
    if (labels.length === 1) {
        displayText = labels[0];
    } else if (labels.length > 1) {
        const firstLabel = labels[0];
        const otherCount = labels.length - 1;
        displayText = `${firstLabel} 외 ${otherCount}개`;
    }

    input.value = displayText;

    if (hiddenInput) {
        const newValue = Array.from(selectedValues).join(',');
        if (hiddenInput.value !== newValue) {
            hiddenInput.value = newValue;
            hiddenInput.dispatchEvent(new Event('change', { bubbles: true }));
        }
    }
}

window.addEventListener('click', (e) => {
    document.querySelectorAll('.custom-select-wrapper.open').forEach(wrapper => {
        if (!wrapper.contains(e.target)) wrapper.classList.remove('open');
    });
});

// ===================================================================
// 이벤트 핸들러 및 상태/폼 관리 함수 섹션
// ===================================================================

function resetOrderForm() {
    document.getElementById('orderRegisterForm')?.reset();
    
    // VirtualSelect는 destroy 후 재생성되므로 reset()은 불필요할 수 있음
    // if (clientVirtualSelect) clientVirtualSelect.reset();
    // if (productVirtualSelect) productVirtualSelect.reset();

    resetOrderStep('color');
    isSelectClient = false;
    isSelectProduct = false;
    lastLoadedProductCd = null;
    selectProductCd = "";
    selectClientCd = "";
    originalOptionsData = [];

    // inner 그리드 클리어
    if(INNER_TUI_GRID_INSTANCE) {
        INNER_TUI_GRID_INSTANCE.clear();
    }
}

function resetOrderStep(step) {
    const steps = ['color', 'size', 'height'];
    const startIndex = steps.indexOf(step);

    if (startIndex === -1) return;

    for (let i = startIndex; i < steps.length; i++) {
        const currentStep = steps[i];
        const wrapper = document.getElementById(`${currentStep}CustomSelectWrapper`);
        if (wrapper) {
            wrapper.querySelector('.options-container').innerHTML = '';
            wrapper.querySelector('.select-box input').value = '';
            const hiddenInput = document.getElementById(`opt_${currentStep}`);
            if (hiddenInput) hiddenInput.value = '';
        }
    }
}

function initDate() {
    const todayStr = new Date().toISOString().split('T')[0];
    ['odd_end_date', 'odd_pay_date'].forEach(id => {
        const el = document.getElementById(id);
        if (el && !el.value) { // 값이 없을 때만 오늘 날짜로 설정
            el.min = todayStr;
            el.value = todayStr;
        }
    });
}

// ===================================================================
// 유틸리티 및 폼 제출/유효성 검사 함수 섹션
// ===================================================================

function findPostCode() {
    new daum.Postcode({
        oncomplete: function(data) {
            document.getElementById("cli_pc").value = data.zonecode;
            document.getElementById("cli_add").value = data.roadAddress;
            document.getElementById("cli_da").focus();
        }
    }).open();
}

const debounce = (fn, delay = 300) => {
    let timer;
    return (...args) => { clearTimeout(timer); timer = setTimeout(() => fn(...args), delay); };
};

function formatWithComma(str) {
    if (!str) return '';
    return String(str).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
function unformatWithComma(str) {
    if (!str) return '';
    return String(str).replace(/,/g, '');
}

function attachNumericFormatter(id) {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener('focus', e => { e.target.value = unformatWithComma(e.target.value); });
    el.addEventListener('input', e => { e.target.value = e.target.value.replace(/[^0-9]/g, ''); });
    el.addEventListener('blur', e => {
        const num = parseInt(e.target.value, 10);
        e.target.value = isNaN(num) || num <= 0 ? '' : formatWithComma(num);
    });
}

function validateFinalForm() {
    if (!selectClientCd) {
        alert('거래처를 선택해주세요.');
        return false;
    }
    
    if (!document.getElementById('pay_type')?.value) {
        alert('결제 방식을 선택해주세요.');
        document.getElementById('pay_type').focus();
        return false;
    }
    if (!document.getElementById('odd_pay')?.value) {
        alert('결제 금액을 입력해주세요.');
        document.getElementById('odd_pay').focus();
        return false;
    }
    if (!document.getElementById('odd_end_date')?.value) {
        alert('납품 요청일을 입력해주세요.');
        document.getElementById('odd_end_date').focus();
        return false;
    }
    const today = new Date().toISOString().split('T')[0];
    if (document.getElementById('odd_end_date')?.value < today) {
        alert('납품 요청일은 오늘 이전일 수 없습니다.');
        document.getElementById('odd_end_date').focus();
        return false;
    }
    if (!document.getElementById('odd_pay_date')?.value) {
        alert('결제 예정일을 입력해주세요.');
        document.getElementById('odd_pay_date').focus();
        return false;
    }
    if (document.getElementById('odd_pay_date')?.value > document.getElementById('odd_end_date')?.value) {
        alert('결제 예정일은 납품 요청일과 같거나 그 이전 날짜여야 합니다.');
        document.getElementById('odd_pay_date').focus();
        return false;
    }
    if (!document.getElementById('cli_pc')?.value) {
        alert('배송지 주소를 입력해주세요.');
        document.getElementById('findPostCodeBtn').focus();
        return false;
    }
    if (!document.getElementById('cli_da')?.value) {
        alert('상세 주소를 입력해주세요.');
        document.getElementById('cli_da').focus();
        return false;
    }

    const gridData = INNER_TUI_GRID_INSTANCE.getData();

    if (gridData.length === 0) {
        alert('등록할 수주 항목이 없습니다. 먼저 항목을 추가해주세요.');
        return false;
    }

    for (const row of gridData) {
        const quantity = parseInt(unformatWithComma(String(row.quantity)), 10);
        if (isNaN(quantity) || quantity < 1) {
            alert(`'${row.productName}' 상품의 수량이 올바르지 않습니다. 1 이상의 숫자를 입력해주세요.`);
            INNER_TUI_GRID_INSTANCE.startEditing(row.rowKey, 'quantity');
            return false;
        }
    }
    return true;
}

async function submitForm() {
    if (!validateFinalForm()) return;

    const gridData = INNER_TUI_GRID_INSTANCE.getData();

    const uniqueCheck = new Set();
    const duplicates = [];
    gridData.forEach(row => {
        const rowKeyString = `${row.productCode}-${row.colorCode}-${row.sizeCode}-${row.heightCode}`;
        if (uniqueCheck.has(rowKeyString)) {
            duplicates.push(row);
        } else {
            uniqueCheck.add(rowKeyString);
        }
    });

    if (duplicates.length > 0) {
        console.error("❌ 중복된 항목이 발견되었습니다:", duplicates);
        alert("오류: 그리드에 중복된 항목이 포함되어 있습니다. F12 개발자 도구의 콘솔을 확인해주세요.");
        return;
    }

    const finalPayload = {
        cli_id: selectClientCd,
        pay_type: document.getElementById('pay_type')?.value,
        ord_pay: unformatWithComma(document.getElementById('odd_pay')?.value || '0'),
        ord_end_date: document.getElementById('odd_end_date')?.value,
        ord_pay_date: document.getElementById('odd_pay_date')?.value,
        ord_pc: document.getElementById('cli_pc')?.value,
        ord_add: document.getElementById('cli_add')?.value,
        ord_da: document.getElementById('cli_da')?.value,
        items: gridData.map(row => ({
            ...row,
            quantity: unformatWithComma(row.quantity)
        }))
    };

    console.log("--- 최종 등록을 위해 서버로 전송될 전체 데이터 ---", finalPayload);

    try {
        const response = await fetch('/SOLEX/orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(finalPayload)
        });

        const result = await response.json(); // 응답을 먼저 json으로 파싱

        if (!response.ok) {
            // 서버가 에러 메시지를 보냈을 경우, 그 메시지를 사용
            throw new Error(result.message || `서버 오류 (HTTP ${response.status})`);
        }

        alert(result.message || '성공적으로 처리되었습니다.');
        if (result.status === 'OK') {
            location.reload();
        }
    } catch (error) {
        console.error('폼 제출 오류:', error);
        alert(`오류: ${error.message}`);
    }
}
