/**
 * ===================================================================
 * order.js - 수주 관리 페이지 스크립트 (A to Z 최종본 - 병렬 로드 방식)
 * -------------------------------------------------------------------
 * 주요 기능:
 * - 상품 선택 시, 관련된 모든 옵션(색상, 사이즈, 굽높이)을 한 번에 로드
 * - 종속적인(Waterfall) API 호출을 제거하여 사용자 경험 및 성능 개선
 * - ToastUI 그리드, VirtualSelect, 재사용 가능한 커스텀 셀렉트 기능 포함
 * ===================================================================
 */

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
let uniqueColors,uniqueSizes,uniqueHeights;
let selectProductNm = "";
let productVirtualSelect;
let originalOptionsData = []; // <<--- 이 줄을 추가해주세요.

// 2. 스크립트 시작점
document.addEventListener('DOMContentLoaded', init);

/**
 * 페이지의 모든 초기화를 담당하는 메인 함수
 */
function init() {
    initializeGrid();
    bindGlobalEventListeners();
    initializeOrderModal();
    fetchGridData();
}


// ===================================================================
// 초기화 함수 섹션
// ===================================================================

/**
 * ToastUI 그리드를 생성하고 무한 스크롤 이벤트를 설정하는 함수
 */
function initializeGrid() {
    TUI_GRID_INSTANCE = new tui.Grid({
        el: document.getElementById('grid'),
        bodyHeight: gridHeight,
        scrollY: true, scrollX: false, data: [],
        columns: [
            { header: '수주 번호', name: 'ORD_ID', width: 100, align: 'center', sortable: true },
            { header: '상품명', name: 'PRD_NM', width: 200, sortable: true },
            { header: '거래처 명', name: 'CLI_NM', align: 'center', sortable: true },
            { header: '납품 요청일', name: 'ORD_END_DATE', align: 'center', sortable: true },
            { header: '배송지', name: 'ORD_ADDRESS', width: 300, align: 'center', sortable: true },
            { header: '진행 상태', name: 'DET_NM', align: 'center', sortable: true },
            { header: '상태 변경일', name: 'ORD_MOD_DATE', align: 'center', sortable: true }
        ],
    });
    TUI_GRID_INSTANCE.on('scrollEnd', async () => {
        if (hasMoreData && !isLoading) {
            currentPage++;
            await fetchGridData(currentPage, searchKeyword);
        }
    });
}
function initializeInnerGrid() {
  // 이미 그리드가 생성되었다면, 데이터만 비우고 함수를 종료 (중복 생성 방지)
  if (INNER_TUI_GRID_INSTANCE) {
      INNER_TUI_GRID_INSTANCE.clear();
      return;
  }

  INNER_TUI_GRID_INSTANCE = new tui.Grid({
      el: document.getElementById('innerGrid'),
      rowHeaders: ['checkbox'], // 그리드 맨 왼쪽에 체크박스 행을 추가합니다.
      scrollX: false,
      scrollY: true,
      bodyHeight: 200, // 모달 내 그리드이므로 높이를 적절히 조절
      columns: [
          { header: '상품명', name: 'productName', width: 150, align: 'center' },
          { header: '색상', name: 'colorName', align: 'center' },
          { header: '사이즈', name: 'sizeName', align: 'center' },
          { header: '굽높이', name: 'heightName', align: 'center' },
          { header: '수량', name: 'quantity', align: 'right',  editor: 'text'},
          // 필요하다면 여기에 숨겨진 코드 값을 위한 컬럼도 추가할 수 있습니다.
          // { header: '상품코드', name: 'productCode', hidden: true },
      ],
      data: []
  });

  // ▼▼▼ 체크/언체크 이벤트 감지하여 '선택 항목 삭제' 버튼 활성화/비활성화 ▼▼▼
  const deleteBtn = document.getElementById('deleteSelectedRowsBtn');
  if (deleteBtn) {
      INNER_TUI_GRID_INSTANCE.on('check', () => {
          deleteBtn.disabled = false;
      });
      INNER_TUI_GRID_INSTANCE.on('uncheck', () => {
          // 체크된 행이 하나도 없으면 다시 비활성화
          if (INNER_TUI_GRID_INSTANCE.getCheckedRows().length === 0) {
              deleteBtn.disabled = true;
          }
      });
      // 전체선택/해제 시에도 동일하게 적용
      INNER_TUI_GRID_INSTANCE.on('checkAll', () => { deleteBtn.disabled = false; });
      INNER_TUI_GRID_INSTANCE.on('uncheckAll', () => { deleteBtn.disabled = true; });
  }
}

/**
 * '주문 등록' 모달의 기본 설정 및 이벤트 리스너를 담당하는 함수
 */
function initializeOrderModal() {
  const myModalElement = document.getElementById('myModal');
  if (!myModalElement) return;
  const orderRegisterModalInstance = new bootstrap.Modal(myModalElement);

  // ▼▼▼ 이벤트 위임 로직 (핵심 수정사항) ▼▼▼
  // 모달 전체에 클릭 이벤트 리스너를 한 번만 등록
  myModalElement.addEventListener('click', function(event) {
    const selectBox = event.target.closest('.select-box');

    if (selectBox) {

        event.stopPropagation();
        const wrapper = selectBox.closest('.custom-select-wrapper');

        if (!wrapper) {
            return;
        }

        wrapper.classList.toggle('open');

        document.querySelectorAll('.custom-select-wrapper.open').forEach(openWrapper => {
            if (openWrapper !== wrapper) {
                openWrapper.classList.remove('open');
            }
        });
    }
  });

  myModalElement.addEventListener('shown.bs.modal', () => {
      resetOrderForm();
      setupModalSelectBoxes();
      initializeInnerGrid();
      initDate();
  });

  myModalElement.addEventListener('hidden.bs.modal', () => {
      // 거래처 VirtualSelect 인스턴스 완전 파괴
      if (clientVirtualSelect) {
        clientVirtualSelect.destroy();
        clientVirtualSelect = null;
    }
    // DOM 요소에 직접 추가된 참조도 만약을 위해 제거
    const clientEl = document.getElementById('cli_nm_virtual_select');
    if (clientEl?.virtualSelectInstance) {
        clientEl.virtualSelectInstance = null;
    }

    // 제품명 VirtualSelect 인스턴스 완전 파괴
    if (productVirtualSelect) {
        productVirtualSelect.destroy();
        productVirtualSelect = null;
    }
    const productEl = document.getElementById('prd_nm_virtual_select');
    if (productEl?.virtualSelectInstance) {
        productEl.virtualSelectInstance = null;
    }
  });

  document.getElementById('openOrderModalBtn')?.addEventListener('click', () => orderRegisterModalInstance.show());
  document.getElementById('submitOrderBtn')?.addEventListener('click', submitForm);
}
/**
 * 모달 내의 모든 셀렉트 박스들을 초기화하는 함수
 */
function setupModalSelectBoxes() {
    loadClientDataForModal();
    loadProductDataForModal();
}

/**
 * 페이지 전역의 UI 요소에 이벤트 리스너를 바인딩하는 함수
 */
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
    attachNumericFormatter('odd_cnt');
    attachNumericFormatter('odd_pay');

    
    // ▼▼▼ '선택 항목 삭제' 버튼에 대한 이벤트 리스너 추가 ▼▼▼
    const deleteSelectedRowsBtn = document.getElementById('deleteSelectedRowsBtn');
    if (deleteSelectedRowsBtn) {
        deleteSelectedRowsBtn.addEventListener('click', function() {
            // 1. 그리드에서 체크된 행들의 데이터를 모두 가져옵니다.
            const checkedRows = INNER_TUI_GRID_INSTANCE.getCheckedRows();
            
            if (checkedRows.length === 0) {
                alert('삭제할 항목을 먼저 선택해주세요.');
                return;
            }

            // 2. TUI Grid는 각 행을 식별하는 고유한 'rowKey'를 가지고 있습니다.
            //    삭제할 행들의 rowKey 목록을 만듭니다.
            const rowKeys = checkedRows.map(row => row.rowKey);

            console.log(rowKeys);
            console.log(INNER_TUI_GRID_INSTANCE);
            // 3. removeRows() 메소드에 rowKey 목록을 전달하여 한 번에 여러 행을 삭제합니다.
            INNER_TUI_GRID_INSTANCE.removeRow(rowKeys);
            
            console.log(rowKeys.length + '개의 항목이 삭제되었습니다.');

        });
    }

    // '초기화' 버튼에 이벤트 추가
    const resetItemsBtn = document.getElementById('resetItemsBtn');
    if (resetItemsBtn) {
      resetItemsBtn.addEventListener('click', function() {
        if (INNER_TUI_GRID_INSTANCE) {
            INNER_TUI_GRID_INSTANCE.clear(); // 그리드 데이터 비우기
        }
      });
    }
}

function addRowToInnerGrid() {
    // 1. 사용자가 선택한 옵션 값들을 배열로 가져옵니다.
    const selectedColors = document.getElementById('opt_color')?.value.split(',').filter(Boolean);
    const selectedSizes = document.getElementById('opt_size')?.value.split(',').filter(Boolean);
    const selectedHeights = document.getElementById('opt_height')?.value.split(',').filter(Boolean);
 
    // 2. 유효성 검사: 상품 및 각 옵션 그룹이 최소 하나 이상 선택되었는지 확인
    if (!isSelectProduct) {
        alert('먼저 상품을 선택해주세요.');
        return;
    }
    if (selectedColors.length === 0 || selectedSizes.length === 0 || selectedHeights.length === 0) {
        alert('색상, 사이즈, 굽높이를 각각 하나 이상 선택해주세요.');
        return;
    }
 
    // 3. 서버에서 받은 원본 데이터에서, 사용자가 선택한 조건과 일치하는 "실존하는 조합"만 필터링합니다.
    const validCombinations = originalOptionsData.filter(option =>
        selectedColors.includes(option.OPT_COLOR) &&
        selectedSizes.includes(option.OPT_SIZE) &&
        selectedHeights.includes(option.OPT_HEIGHT)
    );
 
    if (validCombinations.length === 0) {
        alert("선택하신 옵션에 해당하는 유효한 제품 조합이 없습니다.");
        return;
    }
 
    // 4. 그리드에 추가하기 전, 현재 그리드에 있는 데이터와 비교하여 중복을 방지합니다.
    const existingRows = INNER_TUI_GRID_INSTANCE.getData(); // 현재 그리드의 모든 데이터를 가져옵니다.
    let addedCount = 0;
    let skippedCount = 0;

    const productName = selectProductNm;
    const productCode = selectProductCd;

    validCombinations.forEach(item => {
        // "이미 그리드에 동일한 조합이 있는지" 확인합니다.
        const isDuplicate = existingRows.some(row =>
            row.productCode === productCode &&
            row.colorCode === item.OPT_COLOR &&
            row.sizeCode === item.OPT_SIZE &&
            row.heightCode === item.OPT_HEIGHT
        );

        if (!isDuplicate) {
            // 중복이 아닐 때만 행을 추가합니다.
            const newRowData = {
                // 공통 정보 (루프 바깥에서 미리 정의)
                productName: productName,
                productCode: productCode,

                // 현재 조합(item)에서 가져온 정보
                colorName: item.OPT_COLOR_NM,   // '색상' 컬럼에 표시될 이름
                colorCode: item.OPT_COLOR,      // 실제 색상 코드 값

                sizeName: item.OPT_SIZE_NM,     // '사이즈' 컬럼에 표시될 이름
                sizeCode: item.OPT_SIZE,        // 실제 사이즈 코드 값

                heightName: item.OPT_HEIGHT_NM, // '굽높이' 컬럼에 표시될 이름
                heightCode: item.OPT_HEIGHT,    // 실제 굽높이 코드 값
                
                // 기본값으로 설정하는 정보
                quantity: 1 // 그리드에서 직접 수정하도록 기본값 1로 설정
            };
            INNER_TUI_GRID_INSTANCE.appendRow(newRowData);
            addedCount++;
        } else {
            skippedCount++;
        }
    });
 
    // 6. 사용자에게 처리 결과를 알려줍니다.
    if (addedCount > 0) {
        // 너무 많은 알림을 피하기 위해 console.log로 변경하거나, 다른 UI 피드백 방식으로 변경 가능
        console.log(`${addedCount}개의 새로운 항목이 추가되었습니다.`);
    }
    if (skippedCount > 0) {
        alert(`${skippedCount}개의 항목은 이미 목록에 존재하여 추가되지 않았습니다.`);
    }
 
    // 7. 모든 조합을 추가한 후, 옵션 선택 폼을 초기화합니다.
    resetOptionForms();
}

function resetOptionForms() {
    
    // 1. 색상, 사이즈, 굽높이 커스텀 셀렉트 박스 초기화
    ['color', 'size', 'height'].forEach(type => {
        const wrapper = document.getElementById(`${type}CustomSelectWrapper`);
        if (wrapper) {
            // 화면에 보이는 입력창 텍스트 비우기
            const visibleInput = wrapper.querySelector('.select-box input');
            if (visibleInput) {
                visibleInput.value = '';
            }
            
            // 실제 값을 저장하는 숨겨진 input 값 비우기
            const hiddenInput = document.getElementById(`opt_${type}`);
            if (hiddenInput) {
                hiddenInput.value = '';
            }
            const optionsContainer = wrapper.querySelector('.options-container');
            if (optionsContainer) {
                optionsContainer.innerHTML = '';
            }
            
            // 드롭다운 내부의 옵션들에서 'selected' 클래스 제거하여 시각적으로도 초기화
            wrapper.querySelectorAll('.option.selected').forEach(opt => {
                opt.classList.remove('selected');
            });
        }
    });
    
    // 2. 수량 입력 필드 초기화 (만약 사용하고 있다면)
    // 저희가 마지막에 만든 로직에서는 이 필드를 그리드에서 직접 입력하도록 변경했습니다.
    // 만약 상단에 수량 입력 필드(id="odd_cnt")를 여전히 사용 중이시라면, 이 코드가 해당 필드를 비워줍니다.
    const quantityInput = document.getElementById('odd_cnt');
    if (quantityInput) {
        quantityInput.value = '';
    }
    
    resetOrderForm();
    console.log("옵션 선택 폼이 초기화되었습니다.");
}

// ===================================================================
// 데이터 로딩 및 그리드 관리 함수 섹션
// ===================================================================

async function fetchGridData(page = 0, currentSearchKw = '') {
    if (isLoading) return;
    isLoading = true;
    try {
        const params = new URLSearchParams({ page, pageSize });
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
    TUI_GRID_INSTANCE.resetData([]);
    fetchGridData(0, searchKeyword);
}


// ===================================================================
// 모달 내부 데이터 로딩 (Virtual Select & Custom Select)
// ===================================================================

// --- VirtualSelect 관련 함수들 ---
async function loadClientDataForModal() {
    const el = document.getElementById('cli_nm_virtual_select');
    if (!el || el.virtualSelectInstance) return;
    const vsInst = VirtualSelect.init({
        ele: el, placeholder: "거래처를 검색하세요...", search: true, clearButton: true,
        onServerSearch: debounce(async (searchValue, virtualSelectInstance) => {
            await fetchAndSetClientOptions(searchValue, virtualSelectInstance);
        }, 300)
    });
    vsInst.$ele.addEventListener('change', async () => {
        selectClientCd = vsInst.getValue();
        isSelectClient = !!selectClientCd;
        await getClientInfo(selectClientCd);
    });
    clientVirtualSelect = vsInst
    el.virtualSelectInstance = vsInst;
    await fetchAndSetClientOptions("", vsInst);
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

async function loadProductDataForModal() {
    const el = document.getElementById('prd_nm_virtual_select');
    if (!el || el.virtualSelectInstance) return;
    const vsInst = VirtualSelect.init({
        ele: el, placeholder: "제품명을 검색하세요...", search: true, clearButton: true,
        onServerSearch: debounce(async (searchValue, virtualSelectInstance) => {
            await fetchAndSetProductOptions(searchValue, virtualSelectInstance);
        }, 300)
    });
    vsInst.$ele.addEventListener('change', async () => {
        const selectedOption = vsInst.getSelectedOptions();
        if (selectedOption) {
            selectProductCd = selectedOption.value;
            selectProductNm = selectedOption.label;
            
        } else {
            selectProductCd = "";
            selectProductNm = "";
        }
        isSelectProduct = !!selectProductCd;
        resetOrderStep('color');
        if (isSelectProduct) {
            await loadAllProductOptions(selectProductCd);
        }
    });
    productVirtualSelect = vsInst;
    el.virtualSelectInstance = vsInst;
    await fetchAndSetProductOptions("", vsInst);
}

async function fetchAndSetProductOptions(searchValue, virtualSelectInstance) {
    const params = new URLSearchParams();
    if (searchValue) params.append('searchKeyword', searchValue.trim());
    try {
        const resp = await fetch(`/SOLEX/orders/products?${params.toString()}`);
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
        const json = await resp.json();
        const options = json.map(item => ({ label: item.PRD_NM, value: item.PRD_CD }));
        virtualSelectInstance.setServerOptions(options);
    } catch (err) { console.error('상품 검색 오류:', err); }
}

/**
 * (신규 핵심 함수) 상품의 모든 옵션(색상, 사이즈, 굽높이)을 한번에 불러와서 채우는 함수
 * @param {string} productCd - 선택된 상품 코드
 */

async function loadAllProductOptions(productCd) {
    console.log(productCd);
    if (!productCd) return;
    try {
        const response = await fetch(`/SOLEX/orders/product/${productCd}`);
        if (!response.ok) throw new Error('상품 옵션 로딩 실패');
        const optionsData = await response.json();
        originalOptionsData = optionsData;
        // 1. Map을 사용해 각 옵션의 고유한 값들을 추출합니다.
         uniqueColors = new Map();
         uniqueSizes = new Map();
         uniqueHeights = new Map();

        optionsData.forEach(option => {
          // .set(key, value)를 사용합니다. key(실제 값)가 중복되면, value(표시될 이름)는 마지막 것으로 갱신됩니다.
          if (option.OPT_COLOR && option.OPT_COLOR_NM) {
              uniqueColors.set(option.OPT_COLOR, option.OPT_COLOR_NM);
          }
          if (option.OPT_SIZE && option.OPT_SIZE_NM) {
              uniqueSizes.set(option.OPT_SIZE, option.OPT_SIZE_NM);
          }
          if (option.OPT_HEIGHT && option.OPT_HEIGHT_NM) {
              uniqueHeights.set(option.OPT_HEIGHT, option.OPT_HEIGHT_NM);
          }
      });

        // 2. Map을 배열로 변환 후, 화면에 표시될 이름(label) 기준으로 정렬합니다.
        const colorOptions = Array.from(uniqueColors); // 색상은 이름순 정렬이 필요하면 .sort() 추가
        const sizeOptions = Array.from(uniqueSizes).sort((a, b) => Number(a[1]) - Number(b[1])); // 사이즈는 숫자 오름차순 정렬
        const heightOptions = Array.from(uniqueHeights).sort((a, b) => Number(a[1]) - Number(b[1])); // 굽높이도 숫자 오름차순 정렬

        // 3. 추출된 고유한 값들로 드롭다운 메뉴를 생성합니다.
        const optionConfigs = {
            color: { data: colorOptions, multi: true },
            size: { data: sizeOptions, multi: true }, // 사이즈는 단일 선택으로 변경
            height: { data: heightOptions, multi: true }  // 굽높이도 단일 선택으로 변경
        };

        for (const [type, { data, multi }] of Object.entries(optionConfigs)) {
          const container = document.querySelector(`#${type}CustomSelectWrapper .options-container`);
          if (container) {
              container.innerHTML = ''; // 기존 옵션 비우기
              
              // data는 이제 [실제값, 표시이름] 형태의 배열입니다.
              data.forEach(([value, label]) => {
                  container.innerHTML += `<div class="option" data-value="${value}">${label}</div>`;
              });

              initializeCustomSelect(`${type}CustomSelectWrapper`, multi);
          }
      }
    } catch (error) { 
        console.error("All product options loading failed:", error); 
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

    // ▼▼▼ 핵심 수정 부분 ▼▼▼
    // wrapperId에서 'CustomSelectWrapper'를 제거하여 'type'을 추출 (예: 'color')
    const type = wrapperId.replace('CustomSelectWrapper', '');
    // 올바른 hidden input의 ID를 조립합니다. (예: 'opt_color')
    const hiddenInput = document.getElementById(`opt_${type}`);
    // ▲▲▲ 핵심 수정 부분 ▲▲▲

    const selectedValues = new Set();

    // 새로 생성된 옵션들에 이벤트 리스너 등록
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
            } else { // 단일 선택
                const currentSelected = optionsContainer.querySelector('.option.selected');
                if (currentSelected) currentSelected.classList.remove('selected');
                option.classList.add('selected');
                selectedValues.clear();
                if (value) selectedValues.add(value);
                wrapper.classList.remove('open');
            }
            // 이제 올바른 hiddenInput을 넘겨주게 됩니다.
            updateDisplayValue(optionsContainer, input, hiddenInput, selectedValues);
        });
    });
    
    // 초기 값 표시
    updateDisplayValue(optionsContainer, input, hiddenInput, selectedValues);
}

// updateDisplayValue 함수를 initializeCustomSelect 밖으로 빼내어 재사용성을 높입니다.
function updateDisplayValue(optionsContainer, input, hiddenInput, selectedValues) {
  const labels = Array.from(selectedValues).map(val => {
      const opt = optionsContainer.querySelector(`.option[data-value="${val}"]`);
      return opt ? opt.textContent : '';
  }).filter(Boolean);

  // 2. ▼▼▼ 표시될 텍스트를 결정하는 로직 수정 ▼▼▼
  let displayText = '';
  if (labels.length === 1) {
      // 선택된 항목이 1개일 경우, 해당 항목의 이름만 표시
      displayText = labels[0];
  } else if (labels.length > 1) {
      // 선택된 항목이 2개 이상일 경우, '첫 항목 외 N개' 형식으로 표시
      // Set은 입력 순서를 기억하므로 labels[0]은 가장 먼저 선택한 항목이 됩니다.
      const otherCount = labels.length - 1;
      displayText = `${labels[0]} 외 ${otherCount}개`;
  }
  // (선택된 항목이 0개일 경우, displayText는 초기값인 빈 문자열 ''이 됩니다)

  input.value = displayText;

  // 3. 숨겨진 input에 실제 값(value)을 저장하는 로직은 그대로 유지합니다.
  // 이 부분 덕분에 화면 표시와 관계없이 모든 데이터는 정상적으로 처리됩니다.
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
   
    if (productVirtualSelect) {
        productVirtualSelect.reset();
    }

    document.getElementById('orderRegisterForm')?.reset(); // form 태그가 있다면 reset 사용
    // VirtualSelect 리셋
    resetOrderStep('color');
    isSelectClient = false;
    isSelectProduct = false;
    lastLoadedProductCd = null;
    
}

function resetOrderStep(step) {
    const steps = ['color', 'size', 'height', 'stock'];
    const startIndex = steps.indexOf(step);
    for (let i = startIndex; i < steps.length; i++) {
        const currentStep = steps[i];
        if (currentStep !== 'stock') {
            const wrapper = document.getElementById(`${currentStep}CustomSelectWrapper`);
            if (wrapper) {
                wrapper.querySelector('.options-container').innerHTML = '';
                wrapper.querySelector('.select-box input').value = '';
                const hiddenInput = document.getElementById(`opt_${currentStep}`);
                if(hiddenInput) hiddenInput.value = '';
            }
        } 
    }
}

function initDate() {
    const todayStr = new Date().toISOString().split('T')[0];
    ['odd_end_date', 'odd_pay_date'].forEach(id => {
        const el = document.getElementById(id);
        if(el) { el.min = todayStr; el.value = todayStr; }
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
        }
    }).open();
}

const debounce = (fn, delay = 300) => {
    let timer;
    return (...args) => { clearTimeout(timer); timer = setTimeout(() => fn(...args), delay); };
};

function formatWithComma(str) { return String(str).replace(/\B(?=(\d{3})+(?!\d))/g, ","); }

function attachNumericFormatter(id) {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener('focus', e => { e.target.value = e.target.value.replace(/,/g, ''); });
    el.addEventListener('input', e => { e.target.value = e.target.value.replace(/[^0-9]/g, ''); });
    el.addEventListener('blur', e => {
        const num = parseInt(e.target.value, 10);
        e.target.value = isNaN(num) || num <= 0 ? '' : formatWithComma(num);
    });
}

function validateFinalForm() {
    // 1. 공통 정보 유효성 검사
    if (!selectClientCd) {
        alert('거래처를 선택해주세요.');
        return false;
    }
    
    if (document.getElementById('pay_type')?.value === '') {
        alert('결제 방식을 선택해주세요.');
        document.getElementById('pay_type').focus();
        return false;
    }
    if (document.getElementById('odd_pay')?.value === '') {
        alert('결제 금액을 입력해주세요.');
        document.getElementById('odd_pay').focus();
        return false;
    }

    if (document.getElementById('odd_end_date')?.value === '') {
        alert('납품 요청일을 입력해주세요.');
        document.getElementById('odd_end_date').focus();
        return false;
    }
    if (document.getElementById('odd_end_date')?.value < new Date().toISOString().split('T')[0]) {
        alert('납품 요청일은 오늘 이전일 수주할 수 없습니다.');
        document.getElementById('odd_end_date').focus();
        return false;
    }

    if (document.getElementById('odd_pay_date')?.value === '') {
        alert('결제 예정일을 입력해주세요.');
        document.getElementById('odd_pay_date').focus();
        return false;
    }
    if (document.getElementById('odd_pay_date')?.value > document.getElementById('odd_end_date')?.value) {
        alert('결제 예정일은 납품 요청일과 같거나 그 이전 날짜여야 합니다.');
        document.getElementById('odd_pay_date').focus();
        return false;
    }
    if (document.getElementById('cli_pc')?.value === '') {
        alert('배송지 주소를 입력해주세요.');
        document.getElementById('findPostCodeBtn').focus();
        return false;
    }
    if (document.getElementById('cli_da')?.value === '') {
        alert('상세 주소를 입력해주세요.');
        document.getElementById('cli_da').focus();
        return false;
    }

    // 3. 그리드 데이터 유효성 검사
    const gridData = INNER_TUI_GRID_INSTANCE.getData();

    if (gridData.length === 0) {
        alert('등록할 수주 항목이 없습니다. 먼저 항목을 추가해주세요.');
        return false;
    }

    // 그리드의 모든 행을 순회하며 수량 검사
    for (const row of gridData) {
        // TUI Grid에서 숫자는 콤마(,)가 포함된 문자열일 수 있으므로, 콤마를 제거하고 숫자로 변환
        const quantity = parseInt(String(row.quantity).replace(/,/g, ''), 10);

        // 숫자가 아니거나, 1보다 작으면 유효성 검사 실패
        if (isNaN(quantity) || quantity < 1) {
            alert(`'${row.productName}' 상품의 수량이 올바르지 않습니다. 1 이상의 숫자를 입력해주세요.`);
            // (선택사항) 해당 행을 포커스하거나 편집 모드로 만들 수 있습니다.
            // INNER_TUI_GRID_INSTANCE.startEditing(row.rowKey, 'quantity');
            return false;
        }
    }

    // 모든 유효성 검사를 통과했을 경우
    return true;
}


// async function checkStock(formData) {
//     try {
//         const response = await fetch('/SOLEX/orders/check-stock', {
//             method: 'POST', headers: { 'Content-Type': 'application/json' },
//             body: JSON.stringify(formData)
//         });
//         if (!response.ok) throw new Error('재고 확인 서버 오류');
//         return await response.json();
//     } catch (error) { alert(`재고 확인 중 오류: ${error.message}`); return []; }
// }

// function showLackingMaterialsModal(lackingMaterials) {
//     const htmlContent = lackingMaterials.map(item => `...`).join(''); // 내용은 이전과 동일
//     if (typeof Swal === 'undefined') {
//         alert('자재가 부족합니다.');
//         return Promise.resolve({ isConfirmed: true });
//     }
//     return Swal.fire({
//         title: '📦 자재 부족 경고',
//         html: `<div style="max-height:300px; overflow-y:auto;">${htmlContent}</div>`,
//         icon: 'warning',
//         showCancelButton: true,
//         confirmButtonText: '계속 진행',
//         cancelButtonText: '취소',
//         confirmButtonColor: '#3085d6',
//         cancelButtonColor: '#d33'
//     }); 
// }


/**
 * (수정) 최종 '등록' 버튼 클릭 시, 모달 내 그리드의 모든 데이터를 가져오는 함수
 */
async function submitForm() {
    // 1. 모달 내 그리드 인스턴스가 있는지 확인
    if (!validateFinalForm()) return;
    if (!INNER_TUI_GRID_INSTANCE) {
        alert('수주 항목 그리드가 초기화되지 않았습니다.');
        return;
    }

    // 2. 그리드의 모든 데이터를 배열로 가져옵니다. (가장 중요!)
    const gridData = INNER_TUI_GRID_INSTANCE.getData();
    // ▼▼▼ 여기에 중복 데이터 검사 로그를 추가합니다 ▼▼▼
    console.log("--- 서버 전송 직전 데이터 검사 ---");
    console.log("전체 그리드 데이터:", gridData);

    const uniqueCheck = new Set();
    const duplicates = [];

    gridData.forEach(row => {
        // 각 행을 식별할 고유한 키를 만듭니다. (예: "21-opt_color_03-opt_size_07-opt_height_03")
        const rowKeyString = `${row.productCode}-${row.colorCode}-${row.sizeCode}-${row.heightCode}`;
        
        if (uniqueCheck.has(rowKeyString)) {
            // Set에 이미 이 키가 있다면, 중복된 항목입니다.
            duplicates.push(row);
        } else {
            // Set에 없다면, 새로 추가합니다.
            uniqueCheck.add(rowKeyString);
        }
    });

    if (duplicates.length > 0) {
        console.error("❌ 중복된 항목이 발견되었습니다! 아래는 중복된 항목들입니다:", duplicates);
        alert("오류: 그리드에 중복된 항목이 포함되어 있습니다. F12 개발자 도구의 콘솔을 확인해주세요.");
        return; // 중복이 있으면 전송을 중단
    } else {
        console.log("✅ 중복된 항목이 없습니다. 정상입니다.");
    }
    // ▲▲▲ 중복 데이터 검사 로그 끝 ▲▲▲

    // 3. 유효성 검사: 그리드에 항목이 하나 이상 있는지 확인
    if (gridData.length === 0) {
        alert('등록할 수주 항목이 없습니다. 먼저 항목을 추가해주세요.');
        return;
    }
    
    // 4. (선택사항) 배송지 등 다른 폼 필드의 유효성 검사
    // 필요하다면 이전에 만든 validateOrderForm() 같은 함수를 여기서 호출할 수 있습니다.
    // 예: if (!validateDeliveryAddress()) return;


    // 5. 서버에 전송할 최종 데이터 객체(payload) 구성
    const finalPayload = {
        // 상단 폼에서 가져온 공통 정보
        cli_id: selectClientCd,
        pay_type: document.getElementById('pay_type')?.value,
        ord_pay: (document.getElementById('odd_pay')?.value || '0').replace(/,/g, ''),
        ord_end_date: document.getElementById('odd_end_date')?.value,
        ord_pay_date: document.getElementById('odd_pay_date')?.value,
        ord_pc: document.getElementById('cli_pc')?.value,
        ord_add: document.getElementById('cli_add')?.value,
        ord_da: document.getElementById('cli_da')?.value,
        // ... 기타 필요한 공통 정보 ...

        // 그리드에서 가져온 항목 목록 (배열)
        items: gridData
    };


    // 6. 콘솔에 최종 데이터 확인
    console.log("--- 최종 등록을 위해 서버로 전송될 전체 데이터 ---");
    console.log(finalPayload);

    alert('F12 개발자 도구를 확인하여 최종 전송될 데이터를 보세요.');

   
    
    try {
        const response = await fetch('/SOLEX/orders', { // 실제 서버 API 주소
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(finalPayload)
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: '서버 오류' }));
            throw new Error(errorData.message);
        }

        const result = await response.json();
        alert(result.message);
        if (result.status === 'OK') {
            location.reload();
        }

    } catch (error) {
        alert(`오류: ${error.message}`);
    }
}