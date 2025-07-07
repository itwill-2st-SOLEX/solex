/**
 * ===================================================================
 * order.js - 최종 완성본 (CSS 충돌 방지 및 클릭 기반)
 * ===================================================================
 */

// 1. 전역 변수
let TUI_GRID_INSTANCE;
let INNER_TUI_GRID_INSTANCE;
let currentPage = 0;
const pageSize = 20;
let isLoading = false;
let hasMoreData = true;
let originalOptionsData = [];
let selectClientCd = "";
let selectProductCd = "";
let selectProductNm = "";
let lastLoadedProductCd = null;

// 2. 스크립트 시작점
document.addEventListener('DOMContentLoaded', () => {
    initializeMainPage();
    initializeModalEvents();
});

// ===================================================================
// 초기화 로직
// ===================================================================

function initializeMainPage() {
    const gridEl = document.getElementById('grid');
    if (!gridEl) return;
    TUI_GRID_INSTANCE = new tui.Grid({
        el: gridEl,
        bodyHeight: 600,
        scrollX: false,
        columns: [
            { header: '수주 번호', name: 'ORD_ID', width: 100, align: 'center', sortable: true ,renderer: {
			     styles: {
			       color: '#007BFF',
			       textDecoration: 'underline',
			       cursor: 'pointer'
			     }
			   }},
            { header: '거래처 명', name: 'CLI_NM', align: 'center', sortable: true },
            { header: '거래처 대표자', name: 'CLI_CEO', align: 'center', sortable: true },
            { header: '배송지', name: 'ORD_ADDRESS', width: 300, align: 'center', sortable: true },
            { header: '납품 요청일', name: 'ORD_END_DATE', align: 'center', sortable: true },
            { header: '상태 변경일', name: 'ORD_MOD_DATE', align: 'center', sortable: true }
        ]
       
    });
    TUI_GRID_INSTANCE.on('scrollEnd', () => { if (hasMoreData && !isLoading) { currentPage++; fetchGridData(); } });
    TUI_GRID_INSTANCE.on('click', (ev) => { if (ev.columnName === 'ORD_ID') openDetailModal(TUI_GRID_INSTANCE.getRow(ev.rowKey).ORD_ID); });
    document.getElementById('searchButton')?.addEventListener('click', resetAndFetchGridData);
    document.getElementById('searchInput')?.addEventListener('keypress', (e) => { if (e.key === 'Enter') resetAndFetchGridData(); });
    fetchGridData();
}

function initializeModalEvents() {
    const myModalElement = document.getElementById('myModal');
    if (!myModalElement) return;

    myModalElement.addEventListener('shown.bs.modal', setupModalContents);
    myModalElement.addEventListener('hidden.bs.modal', () => {
        if (INNER_TUI_GRID_INSTANCE) { INNER_TUI_GRID_INSTANCE.destroy(); INNER_TUI_GRID_INSTANCE = null; }
    });
    document.getElementById('openOrderModalBtn')?.addEventListener('click', () => {
        myModalElement.dataset.mode = 'new';
        bootstrap.Modal.getOrCreateInstance(myModalElement).show();
    });
}

// ===================================================================
// 모달 제어 및 컨텐츠 구성
// ===================================================================

async function openDetailModal(ordId) {
    const myModalElement = document.getElementById('myModal');
    try {
        const response = await fetch(`/SOLEX/orders/${ordId}`);
        if (!response.ok) throw new Error(`주문 정보 로딩 실패`);
        const fullOrderData = await response.json();
        myModalElement.dataset.orderData = JSON.stringify(fullOrderData);
        myModalElement.dataset.mode = 'detail';
        bootstrap.Modal.getOrCreateInstance(myModalElement).show();
    } catch (error) {
        alert(error.message);
    }
}

async function setupModalContents() {
    const myModalElement = document.getElementById('myModal');
    const mode = myModalElement.dataset.mode || 'new';


    // 모달 제목과 제출 버튼 요소를 가져옵니다.
    const modalTitle = document.getElementById('myModalTitle');
    const submitBtn = document.getElementById('submitOrderBtn');

     // 기존 이벤트 핸들러 제거를 위해 복제
    const newSubmitBtn = submitBtn.cloneNode(true);
    submitBtn.parentNode.replaceChild(newSubmitBtn, submitBtn);

    createInnerGrid();
    attachModalEventListeners();
    initializeSearchableSelect('client-select-box', '/SOLEX/orders/clients', onClientSelect);
    initializeSearchableSelect('product-select-box', '/SOLEX/orders/products', onProductSelect);
    
    setTimeout(() => {
        if (mode === 'detail') {
            // 상세 보기 모드일 때
            modalTitle.textContent = '수주 수정'; // 제목을 '수주 수정'으로 변경
            newSubmitBtn.textContent = '수정';      // 버튼 텍스트를 '수정'으로 변경
            newSubmitBtn.addEventListener('click', submitUpdateForm); // 수정 이벤트 연결

            const orderData = JSON.parse(myModalElement.dataset.orderData);
            console.log("모달에 로드된 주문 데이터:", orderData);
            populateModalWithData(orderData);


        } else {
            // 신규 등록 모드일 때 (원래 상태로 복원)
            modalTitle.textContent = '수주 등록'; // 제목을 '수주 등록'으로 복원
            newSubmitBtn.textContent = '등록';      // 버튼 텍스트를 '등록'으로 복원
            newSubmitBtn.addEventListener('click', submitForm); // 등록 이벤트 연결

            resetOrderForm();
            initDate();
        }

        if (INNER_TUI_GRID_INSTANCE) INNER_TUI_GRID_INSTANCE.refreshLayout();
    }, 150);
}

// ===================================================================
// 커스텀 검색 셀렉트 박스 (Click 기반 최종 로직)
// ===================================================================
function initializeSearchableSelect(wrapperId, apiUrl, onSelectCallback) {
    const wrapper = document.getElementById(wrapperId);
    // 중복으로 이벤트 리스너가 등록되는 것을 방지하는 가드(Guard)
    if (!wrapper || wrapper.dataset.listenerAttached === 'true') return;

    const textInput = wrapper.querySelector('.select-search-input');
    const hiddenInput = wrapper.querySelector('input[type="hidden"]');
    const optionsContainer = wrapper.querySelector('.options-container');
    const ACTIVE_CLASS = 'search-select-is-active'; // 충돌 없는 고유한 클래스 이름

    // 옵션 목록을 HTML로 만드는 함수
    const renderOptions = (data) => {
        // 검색 결과 개수에 따라 스타일을 동적으로 적용
        if (data.length === 1) {
            optionsContainer.classList.add('has-one-item');
        } else {
            optionsContainer.classList.remove('has-one-item');
        }
        
        optionsContainer.innerHTML = data.length 
            ? data.map(item => `<div class="option-item" data-value="${item.value}">${item.label}</div>`).join('')
            : `<div class="no-results">검색 결과가 없습니다.</div>`;
    };

    // 1. 입력창을 '클릭'했을 때의 동작 (focus 대신 click)
    textInput.addEventListener('click', async (e) => {
        e.stopPropagation(); // 이벤트가 문서 전체로 퍼져나가는 것을 막음
        
        const isCurrentlyOpen = wrapper.classList.contains(ACTIVE_CLASS);

        // 다른 모든 드롭다운은 닫음
        document.querySelectorAll('.custom-search-select.' + ACTIVE_CLASS).forEach(sel => {
            if (sel !== wrapper) sel.classList.remove(ACTIVE_CLASS);
        });

        // 현재 클릭한 드롭다운을 열거나 닫음 (토글)
        wrapper.classList.toggle(ACTIVE_CLASS);

        // 만약 드롭다운이 열리고, 내용이 비어있다면 초기 데이터를 불러옴
        if (!isCurrentlyOpen && optionsContainer.innerHTML.trim() === '') {
            const initialData = await fetchSelectData(apiUrl, '');
            renderOptions(initialData);
        }
    });

    // 2. 검색어 입력 시 (keyup)
    const debouncedSearch = debounce(async () => {
        wrapper.classList.add(ACTIVE_CLASS); // 검색 결과가 있으면 목록을 보여줌
        
        optionsContainer.innerHTML = `
        <div style="display: flex; justify-content: center; align-items: center; height: 100%;">
        <div class="loading-spinner"></div>
        </div>
        `;

        const data = await fetchSelectData(apiUrl, textInput.value);
        renderOptions(data);

    }, 300);
    textInput.addEventListener('keyup', debouncedSearch);

    // 3. 옵션 아이템 선택 시 (mousedown 사용으로 안정성 확보)
    optionsContainer.addEventListener('mousedown', (e) => {
        if (e.target.matches('.option-item[data-value]')) {
            e.preventDefault(); // 입력창의 포커스가 사라지는 것을 막음
            
            const { value } = e.target.dataset;
            const label = e.target.textContent;
            
            textInput.value = label;
            hiddenInput.value = value;
            
            wrapper.classList.remove(ACTIVE_CLASS); // 선택 후 드롭다운 닫기
            
            if (onSelectCallback) onSelectCallback({ value, label });
        }
    });

    // 리스너가 등록되었음을 표시하여 중복 등록 방지
    wrapper.dataset.listenerAttached = 'true';
}


document.addEventListener('click', (e) => {
    console.log("클릭됨");
    // 1. 검색 가능한 셀렉트 박스(거래처/제품) 닫기
    // 클릭한 위치가 .custom-search-select 내부가 아닐 때만 실행
    if (!e.target.closest('.custom-search-select')) {
        document.querySelectorAll('.custom-search-select.search-select-is-active').forEach(select => {
            select.classList.remove('search-select-is-active');
        });
    }

    // 2. 다중 선택 셀렉트 박스(색상/사이즈/굽) 닫기
    // 클릭한 위치가 .custom-select-wrapper 내부가 아닐 때만 실행
    if (!e.target.closest('.custom-select-wrapper')) {
        document.querySelectorAll('.custom-select-wrapper.open').forEach(select => {
            select.classList.remove('open');
        });
    }
});

// ===================================================================
// 나머지 모든 함수
// ===================================================================

function createInnerGrid() {
    const gridContainer = document.getElementById('innerGrid');
    if (!gridContainer) return;
    gridContainer.innerHTML = '';
    INNER_TUI_GRID_INSTANCE = new tui.Grid({
        el: gridContainer, rowHeaders: ['checkbox'], bodyHeight: 200, scrollX: false,
        columns: [
            { header: '상품명', name: 'productName', minWidth: 150, align: 'center' },
            { header: '색상', name: 'colorName', minWidth: 80, align: 'center' },
            { header: '사이즈', name: 'sizeName', minWidth: 80, align: 'center' },
            { header: '굽높이', name: 'heightName', minWidth: 80, align: 'center' },
            { header: '수량', name: 'quantity', editor: 'text', minWidth: 80, align: 'right' },
            { header: '진행 상태', name: 'oddSts', minWidth: 100, align: 'center' },
            { name: 'productCode', hidden: true }, { name: 'colorCode', hidden: true },
            { name: 'sizeCode', hidden: true }, { name: 'heightCode', hidden: true },
        ],
    });
}

function attachModalEventListeners() {
    const handler = (id, callback) => {
        const element = document.getElementById(id);
        if (element) {
            // 중복 방지를 위해 기존 핸들러 제거 후 새로 할당
            element.onclick = null;
            element.onclick = callback;
        }
    };
    // handler('submitOrderBtn', submitForm);
    // handler('updateOrderBtn', submitUpdateForm);
    handler('findPostCodeBtn', findPostCode);
    handler('addRowBtn', addRowToInnerGrid);
    handler('resetOptionFormsBtn', resetOptionForms);
    handler('deleteSelectedRowsBtn', deleteSelectedRows);
    attachNumericFormatter('odd_pay');

    document.getElementById('myModal').addEventListener('click', function(e){
        const selectBox = e.target.closest('.custom-select-wrapper .select-box');
        if(selectBox) {
            const wrapper = selectBox.closest('.custom-select-wrapper');
            wrapper.classList.toggle('open');
            document.querySelectorAll('.custom-select-wrapper.open').forEach(openWrapper => {
                if (openWrapper !== wrapper) openWrapper.classList.remove('open');
            });
        }
    });
}

async function fetchSelectData(url, keyword = '') {
    try {
        const params = new URLSearchParams();
        if (keyword.trim()) params.append('searchKeyword', keyword.trim());
        const response = await fetch(`${url}?${params.toString()}`);
        if (!response.ok) return [];
        const rawData = await response.json();
        if (url.includes('clients')) return rawData.map(item => ({ value: item.CLI_ID, label: item.CLI_NM }));
        if (url.includes('products')) return rawData.map(item => ({ value: item.PRD_ID, label: item.PRD_NM }));
        return [];
    } catch (error) { return []; }
}

function onClientSelect(selected) { selectClientCd = selected.value; }

async function onProductSelect(selected) {
    selectProductCd = selected.value;
    selectProductNm = selected.label;
    if (selectProductCd === lastLoadedProductCd) return;
    resetOrderStep('color');
    if (selectProductCd) await loadAllProductOptions(selectProductCd);
    lastLoadedProductCd = selectProductCd;
}

function populateModalWithData(data) {
    resetOrderForm();
    const { orderInfo, orderItems, availableOptions } = data;
    if (!orderInfo) return;
    document.getElementById('current_ord_id').value = orderInfo.ORD_ID || '';
    document.getElementById('pay_type').value = orderInfo.PAYMENT_TYPE || '';
    document.getElementById('odd_pay').value = formatWithComma(String(orderInfo.PAYMENT_AMOUNT || ''));
    document.getElementById('odd_end_date').value = orderInfo.DELIVERY_DATE;
    document.getElementById('odd_pay_date').value = orderInfo.PAYMENT_DATE;
    document.getElementById('cli_pc').value = orderInfo.POSTAL_CODE || '';
    document.getElementById('cli_add').value = orderInfo.BASE_ADDRESS || '';
    document.getElementById('cli_da').value = orderInfo.DETAIL_ADDRESS || '';
    if (orderInfo.CLIENT_ID && orderInfo.CLIENT_NAME) {
        document.getElementById('client-search-input').value = orderInfo.CLIENT_NAME;
        document.getElementById('selected_client_id').value = orderInfo.CLIENT_ID;
        onClientSelect({value: orderInfo.CLIENT_ID});
    }
    if (orderInfo.PRODUCT_ID && orderInfo.PRODUCT_NAME) {
        document.getElementById('product-search-input').value = orderInfo.PRODUCT_NAME;
        document.getElementById('selected_product_id').value = orderInfo.PRODUCT_ID;
        onProductSelect({value: orderInfo.PRODUCT_ID, label: orderInfo.PRODUCT_NAME});
    }
    loadAllProductOptions(availableOptions);
    if (orderItems && orderItems.length > 0) {
        const transformedItems = orderItems.map(item => ({
            odd_id: item.ODD_ID, oddSts : item.ODD_STS,ord_id : orderInfo.ORD_ID, opt_id : item.OPT_ID,
            productName: item.PRODUCT_NAME, colorName: item.COLOR_NAME, sizeName: item.SIZE_NAME, 
            heightName: item.HEIGHT_NAME, quantity: item.QUANTITY, productCode: item.PRODUCT_CODE,
            colorCode: item.COLOR_CODE, sizeCode: item.SIZE_CODE, heightCode: item.HEIGHT_CODE
        }));
        INNER_TUI_GRID_INSTANCE.resetData(transformedItems);
    }
    
    // orderItems의 ODD_STS가 하나라도 수주등록이 아니라면 거래처명, 상품명, 수량, 배송지, 납품요청일, 상태, 상태변경일을 disabled
    if(orderItems.some(item => item.ODD_STS !== '수주 등록')) {
        enableForm(false);
    } else {
        enableForm(true);
    }



}

function enableForm(isEnabled) {
    document.getElementById('client-search-input').disabled = !isEnabled;
    document.getElementById('product-search-input').disabled = !isEnabled;
    document.getElementById('odd_end_date').disabled = !isEnabled;
    document.getElementById('odd_pay_date').disabled = !isEnabled;
    document.getElementById('opt_color').disabled = !isEnabled;
    document.getElementById('opt_size').disabled = !isEnabled;
    document.getElementById('opt_height').disabled = !isEnabled;

    document.getElementById('cli_pc').disabled = !isEnabled;
    document.getElementById('cli_add').disabled = !isEnabled;
    document.getElementById('cli_da').disabled = !isEnabled;
    document.getElementById('odd_pay').disabled = !isEnabled;
    document.getElementById('pay_type').disabled = !isEnabled;
}

async function fetchGridData() {
    isLoading = true;
    const searchKeyword = document.getElementById('searchInput')?.value || '';
    const params = new URLSearchParams({ page: currentPage, size: pageSize, searchKeyword });
    try {
        const response = await fetch(`/SOLEX/orders/gridData?${params.toString()}`);
        const data = await response.json();
        if (currentPage === 0) TUI_GRID_INSTANCE.resetData(data); else TUI_GRID_INSTANCE.appendRows(data);
        hasMoreData = data.length === pageSize;
    } catch (error) { console.error('Grid data loading error:', error); }
    finally { isLoading = false; }
}

function resetAndFetchGridData() { currentPage = 0; hasMoreData = true; if (TUI_GRID_INSTANCE) TUI_GRID_INSTANCE.clear(); fetchGridData(); }

async function loadAllProductOptions(data) {
    let optionsData;
    if (typeof data === 'string' || typeof data === 'number') {
        if (!data) { resetOrderStep('color'); return; }
        try { optionsData = await (await fetch(`/SOLEX/orders/product/${data}`)).json(); }
        catch (error) { resetOrderStep('color'); return; }
    } else if (Array.isArray(data)) { optionsData = data; }
    else { resetOrderStep('color'); return; }
    originalOptionsData = optionsData || [];
    const unique = { colors: new Map(), sizes: new Map(), heights: new Map() };
    originalOptionsData.forEach(opt => {
        if (opt.OPT_COLOR && opt.OPT_COLOR_NM) unique.colors.set(opt.OPT_COLOR, opt.OPT_COLOR_NM);
        if (opt.OPT_SIZE && opt.OPT_SIZE_NM) unique.sizes.set(opt.OPT_SIZE, opt.OPT_SIZE_NM);
        if (opt.OPT_HEIGHT && opt.OPT_HEIGHT_NM) unique.heights.set(opt.OPT_HEIGHT, opt.OPT_HEIGHT_NM);
    });
    const optionConfigs = {
        color: { data: Array.from(unique.colors), multi: true },
        size: { data: Array.from(unique.sizes).sort((a,b)=>+a[1]-+b[1]), multi: true },
        height: { data: Array.from(unique.heights).sort((a,b)=>+a[1]-+b[1]), multi: true }
    };
    for (const [type, { data: configData, multi }] of Object.entries(optionConfigs)) {
        const wrapper = document.getElementById(`${type}CustomSelectWrapper`);
        const container = wrapper?.querySelector('.options-container');
        if (container) {
            container.innerHTML = configData.map(([value, label]) => `<div class="option" data-value="${value}">${label}</div>`).join('');
            initializeCustomSelect(wrapper.id, multi);
        }
    }
}

function addRowToInnerGrid() {
    const getSelected = (id) => document.getElementById(id)?.value.split(',').filter(Boolean);
    const selected = { colors: getSelected('opt_color'), sizes: getSelected('opt_size'), heights: getSelected('opt_height') };
    if (!selectProductCd) { 
        alert('먼저 상품을 선택해주세요.'); 
        return; 
    }
    if (selected.colors.length * selected.sizes.length * selected.heights.length === 0) { 
        alert('색상, 사이즈, 굽높이를 각각 하나 이상 선택해주세요.'); 
        return; 
    }
    const validCombinations = originalOptionsData.filter(opt => selected.colors.includes(opt.OPT_COLOR) && selected.sizes.includes(opt.OPT_SIZE) && selected.heights.includes(opt.OPT_HEIGHT));
    if (validCombinations.length === 0) { 
        alert("선택하신 옵션에 해당하는 유효한 제품 조합이 없습니다."); 
        return; 
    }
    const existingRows = INNER_TUI_GRID_INSTANCE.getData(); 
    let addedCount = 0;
    
    console.log(validCombinations);
    console.log("기존 Inner Grid 데이터:", existingRows);
    validCombinations.forEach(item => {
        const isDuplicate = existingRows.some(row => 
            row.opt_id === item.OPT_ID // Inner Grid 데이터에 opt_id가 있어야 합니다.
                                        // 추가 시 Inner Grid row에도 opt_id를 넣어줘야 함!
        );
        
        if (!isDuplicate) {
            INNER_TUI_GRID_INSTANCE.appendRow({
                productName: selectProductNm, productCode: selectProductCd, colorName: item.OPT_COLOR_NM, colorCode: item.OPT_COLOR, 
                sizeName: item.OPT_SIZE_NM, sizeCode: item.OPT_SIZE, heightName: item.OPT_HEIGHT_NM, heightCode: item.OPT_HEIGHT, quantity: 1,opt_id: item.OPT_ID
            });
            addedCount++;
        }
    });
    if (addedCount < validCombinations.length) alert(`${validCombinations.length - addedCount}개의 항목은 이미 목록에 존재하여 추가되지 않았습니다.`);
    resetOptionForms();
}

function resetOptionForms() { ['color', 'size', 'height'].forEach(type => { const wrapper = document.getElementById(`${type}CustomSelectWrapper`); if (wrapper) { wrapper.querySelector('.select-box input').value = ''; wrapper.querySelector('.options-container').innerHTML = ''; document.getElementById(`opt_${type}`).value = ''; }}); }

function initializeCustomSelect(wrapperId, isMultiSelect) {
    const wrapper = document.getElementById(wrapperId); if (!wrapper) return;
    const optionsContainer = wrapper.querySelector('.options-container');
    const input = wrapper.querySelector('.select-box input');
    const hiddenInput = document.getElementById(`opt_${wrapperId.replace('CustomSelectWrapper', '')}`);
    const selectedValues = new Set(hiddenInput.value.split(',').filter(Boolean));
    optionsContainer.querySelectorAll('.option').forEach(option => {
        option.onclick = (e) => {
            e.stopPropagation(); const value = option.getAttribute('data-value');
            if (isMultiSelect) {
                option.classList.toggle('selected');
                if (selectedValues.has(value)) selectedValues.delete(value); else selectedValues.add(value);
            }
            updateDisplayValue(input, hiddenInput, selectedValues, optionsContainer);
        };
        if(selectedValues.has(option.dataset.value)) option.classList.add('selected');
    });
    updateDisplayValue(input, hiddenInput, selectedValues, optionsContainer);
}

function updateDisplayValue(input, hiddenInput, selectedValues, optionsContainer) {
    const labels = Array.from(selectedValues).map(val => (optionsContainer.querySelector(`.option[data-value="${val}"]`)?.textContent || '')).filter(Boolean);
    let displayText = '';
    if (labels.length === 1) displayText = labels[0]; else if (labels.length > 1) displayText = `${labels[0]} 외 ${labels.length - 1}개`;
    input.value = displayText;
    if (hiddenInput) hiddenInput.value = Array.from(selectedValues).join(',');
}

function resetOrderForm() {
    document.getElementById('orderRegisterForm')?.reset();
    if(INNER_TUI_GRID_INSTANCE) INNER_TUI_GRID_INSTANCE.clear();
    resetOrderStep('color');
    selectClientCd = ""; selectProductCd = ""; selectProductNm = "";
    lastLoadedProductCd = null; originalOptionsData = [];
    const clientInput = document.getElementById('client-search-input');
    if(clientInput) clientInput.value = '';
    const productInput = document.getElementById('product-search-input');
    if(productInput) productInput.value = '';
    const selectedClientId = document.getElementById('selected_client_id');
    if(selectedClientId) selectedClientId.value = '';
    const selectedProductId = document.getElementById('selected_product_id');
    if(selectedProductId) selectedProductId.value = '';
}

function resetOrderStep(step) {
    const steps = ['color', 'size', 'height'];
    const startIndex = steps.indexOf(step);
    if (startIndex === -1) return;
    for (let i = startIndex; i < steps.length; i++) {
        const wrapper = document.getElementById(`${steps[i]}CustomSelectWrapper`);
        if (wrapper) {
            wrapper.querySelector('.options-container').innerHTML = '';
            wrapper.querySelector('.select-box input').value = '';
            document.getElementById(`opt_${steps[i]}`).value = '';
        }
    }
}

function initDate() {
  const todayStr = new Date().toISOString().split('T')[0];
  ['odd_end_date', 'odd_pay_date'].forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.value = todayStr;
      // 선택 가능한 가장 빠른 날짜를 오늘로 설정합니다. (이전 날짜 비활성화)
      el.min = todayStr;
    }
  });
}

const debounce = (fn, delay = 300) => { let timer; return (...args) => { clearTimeout(timer); timer = setTimeout(() => fn(...args), delay); }; };
function formatWithComma(str) { return String(str || '').replace(/\B(?=(\d{3})+(?!\d))/g, ","); }
function unformatWithComma(str) { return String(str || '').replace(/,/g, ''); }

function attachNumericFormatter(id) {
    const el = document.getElementById(id);
    if (!el || el.dataset.formatterAttached) return;
    const handlers = {
        focus: e => { e.target.value = unformatWithComma(e.target.value); },
        input: e => { e.target.value = e.target.value.replace(/[^0-9]/g, ''); },
        blur: e => { const num = parseInt(e.target.value, 10); e.target.value = isNaN(num) || num <= 0 ? '' : formatWithComma(num); }
    };
    el.addEventListener('focus', handlers.focus);
    el.addEventListener('input', handlers.input);
    el.addEventListener('blur', handlers.blur);
    el.dataset.formatterAttached = 'true';
}

function findPostCode() { new daum.Postcode({ oncomplete: function(data) {
    document.getElementById("cli_pc").value = data.zonecode;
    document.getElementById("cli_add").value = data.roadAddress;
    document.getElementById("cli_da").focus();
}}).open(); }

function validateFinalForm() {
    if (!document.getElementById('selected_client_id').value) { alert('거래처를 선택해주세요.'); return false; }
    if (INNER_TUI_GRID_INSTANCE.getData().length === 0) { alert('등록할 수주 항목이 없습니다.'); return false; }
    for (const row of INNER_TUI_GRID_INSTANCE.getData()) {
        const quantity = parseInt(unformatWithComma(String(row.quantity)), 10);
        if (isNaN(quantity) || quantity < 1) {
            alert(`'${row.productName}' 상품의 수량이 올바르지 않습니다.`);
            INNER_TUI_GRID_INSTANCE.startEditing(row.rowKey, 'quantity');
            return false;
        }
    }
    return true;
}

async function submitForm() {
    if (!validateFinalForm()) return;
    const gridData = INNER_TUI_GRID_INSTANCE.getData();
    const finalPayload = {
        cli_id: document.getElementById('selected_client_id').value,
        prd_id: document.getElementById('selected_product_id').value,
        pay_type: document.getElementById('pay_type')?.value,
        ord_pay: unformatWithComma(document.getElementById('odd_pay')?.value),
        ord_end_date: document.getElementById('odd_end_date')?.value,
        ord_pay_date: document.getElementById('odd_pay_date')?.value,
        ord_pc: document.getElementById('cli_pc')?.value,
        ord_add: document.getElementById('cli_add')?.value,
        ord_da: document.getElementById('cli_da')?.value,
        items: gridData.map(row => ({...row, quantity: unformatWithComma(row.quantity)}))
    };
    try {
        const response = await fetch('/SOLEX/orders', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(finalPayload) });
        const result = await response.json();
        if (!response.ok) throw new Error(result.message || `서버 오류`);
        alert(result.message || '성공적으로 처리되었습니다.');
        location.reload();
    } catch (error) {
        alert(`오류: ${error.message}`);
    }
}

// 백엔드 API 호출을 담당하는 함수 (이전과 동일)
async function callDeleteOrdersApi(oddIdsToDelete) {
    try {
        const response = await fetch('/SOLEX/orders', { // 실제 삭제 API 엔드포인트로 변경
            method: 'DELETE', // 또는 POST
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(oddIdsToDelete), // 삭제할 odd_id 리스트를 배열로 전송
        });

        // 백엔드에서 반환하는 JSON 형태를 예상합니다.
        // 예: { "status": "SUCCESS", "deletedIds": [1, 2], "skippedIds": [3], "message": "..." }
        // 또는 오류 시: { "status": "ERROR", "message": "상태 3인 주문은 삭제 불가능" }
        const result = await response.json(); // 서버 응답이 항상 JSON이라고 가정 (오류 시에도)

        if (!response.ok) {
            // 서버에서 4xx, 5xx 응답을 보낼 경우
            const errorMessage = result.message || `API 호출 실패: ${response.status}`;
            throw new Error(errorMessage);
        }
        return result; // 성공 시 결과 객체 반환
    } catch (error) {
        console.error('주문 삭제 API 호출 중 오류 발생:', error);
        throw error; // 오류를 다시 던져 상위 호출자가 처리하도록 함
    }
}


function deleteSelectedRows() {
    const totalRows = INNER_TUI_GRID_INSTANCE.getData().length;
    console.log("총 행 수:", totalRows); // 디버깅용
    
    const checkedRows = INNER_TUI_GRID_INSTANCE.getCheckedRows(); // 체크된 행들의 데이터를 가져옴
    console.log("체크된 행 데이터:", checkedRows); // 디버깅용
    
    const checkedRowCount = checkedRows.length; // 체크된 행의 개수
    console.log("체크된 행 개수:", checkedRowCount); // 디버깅용

    const modalTitle = document.getElementById("myModalTitle").textContent;

    // --- 1차 유효성 검사: 삭제할 행이 없는 경우 ---
    if (checkedRowCount === 0) {
        alert('삭제할 행을 선택해주세요.');
        return; // 함수 실행 중단
    }

    // --- 1차 유효성 검사: 최소 행 개수 유지 체크 (프론트엔드에서 유지할지 말지 선택) ---
    // 이 부분은 여전히 프론트에서 먼저 막을지, 백엔드에 위임할지 결정해야 합니다.
    // 만약 백엔드에서 "최소 1개 유지" 규칙을 최종적으로 검사한다면 이 로직도 제거 가능합니다.
    // 여기서는 일단 남겨두는 것으로 가정합니다.
    if (modalTitle !== "출고 등록" && (totalRows - checkedRowCount < 1)) {
        alert('주문 건수가 1개 이하로 떨어질 수 없습니다.');
        return; // 함수 실행 중단
    }


    // --- 모든 1차 유효성 검사를 통과한 경우: 백엔드 API 호출 준비 ---
    // 체크된 모든 odd_id를 백엔드로 보냅니다. 백엔드에서 검증 및 부분 삭제를 수행할 것입니다.
    const oddIdsToProcess = checkedRows.map(row => row.odd_id);
    console.log("삭제 요청할 odd_id 목록 (프론트엔드에서 보냄):", oddIdsToProcess);

    // 사용자에게 최종 확인
    if (!confirm(`${checkedRowCount}개의 주문을 정말로 삭제하시겠습니까?`)) {
        return; // 사용자가 취소한 경우 함수 종료
    }

    // 백엔드 API 호출 (async/await 사용)
    (async () => { // 비동기 함수 즉시 실행
        try {
            // 백엔드 호출: 모든 체크된 odd_id를 보냄
            const apiResponse = await callDeleteOrdersApi(oddIdsToProcess);
            
            // 백엔드 응답 분석
            const deletedIds = apiResponse.deletedIds || [];
            const skippedIds = apiResponse.skippedIds || [];
            const message = apiResponse.message || "작업이 완료되었습니다.";

            if (deletedIds.length > 0 && skippedIds.length === 0) {
                alert('선택된 주문이 모두 성공적으로 삭제되었습니다.');
            } else if (deletedIds.length > 0 && skippedIds.length > 0) {
                alert(`일부 주문(${skippedIds.join(', ')})은 삭제할 수 없습니다. 나머지 항목은 삭제되었습니다.`);
            } else if (deletedIds.length === 0 && skippedIds.length > 0) {
                alert(`선택된 주문(${skippedIds.join(', ')})은 삭제할 수 없습니다.`);
            // 백엔드가 비어있는 deletedIds와 채워진 skippedIds를 보낼 때
            } else {
                alert(message);
            }
            
            // UI 업데이트: 가장 안전하게 그리드 전체를 새로 로드하는 방법 (권장)
            await loadGridData(checkedRows[0].ord_id); // 그리드 데이터를 새로 불러오는 함수 호출

        } catch (error) {
            console.error('주문 삭제 실패:', error);
            alert('주문 삭제 중 오류가 발생했습니다: ' + error.message);
        }
    })();
}

async function loadGridData(ord_id) {
    const response = await fetch(`/SOLEX/orders/${ord_id}`);
    const fullOrderData = await response.json();
    const orderInfo = fullOrderData.orderInfo || {};
    const orderItems = fullOrderData.orderItems || [];
    if (orderItems && orderItems.length > 0) {
        const transformedItems = orderItems.map(item => ({
            odd_id: item.ODD_ID, oddSts : item.ODD_STS,ord_id : orderInfo.ORD_ID,opt_id : item.OPT_ID,
            productName: item.PRODUCT_NAME, colorName: item.COLOR_NAME, sizeName: item.SIZE_NAME, 
            heightName: item.HEIGHT_NAME, quantity: item.QUANTITY, productCode: item.PRODUCT_CODE,
            colorCode: item.COLOR_CODE, sizeCode: item.SIZE_CODE, heightCode: item.HEIGHT_CODE
        }));
        INNER_TUI_GRID_INSTANCE.resetData(transformedItems);
    }
    INNER_TUI_GRID_INSTANCE.refreshLayout();

}   


async function submitUpdateForm() {
    if (!validateFinalForm()) return;
    const gridData = INNER_TUI_GRID_INSTANCE.getData();
    const ordIdToUpdate = document.getElementById('current_ord_id')?.value; // 예시: 숨겨진 입력 필드에서 가져옴
    const finalPayload = {
        ord_id: ordIdToUpdate,
        cli_id: document.getElementById('selected_client_id').value,
        prd_id: document.getElementById('selected_product_id').value,
        pay_type: document.getElementById('pay_type')?.value,
        ord_pay: unformatWithComma(document.getElementById('odd_pay')?.value),
        ord_end_date: document.getElementById('odd_end_date')?.value,
        ord_pay_date: document.getElementById('odd_pay_date')?.value,
        ord_pc: document.getElementById('cli_pc')?.value,
        ord_add: document.getElementById('cli_add')?.value,
        ord_da: document.getElementById('cli_da')?.value,
        items: gridData.map(row => ({...row, quantity: unformatWithComma(row.quantity)}))
    };

    console.log("최종 제출 데이터:", finalPayload); // 디버깅용
    try {
        const response = await fetch('/SOLEX/orders', 
            { 
                method: 'PUT',
                headers: {
                     'Content-Type': 'application/json' 
                }, 
                body: JSON.stringify(finalPayload) 
            });
        const result = await response.json();
        if (!response.ok) throw new Error(result.message || `서버 오류`);
        alert(result.message || '성공적으로 처리되었습니다.');
        location.reload();
    } catch (error) {
        alert(`오류: ${error.message}`);
    }
}