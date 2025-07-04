// order.js

let currentPage = 0;
const pageSize = 20;
const gridHeight = 600;
let isLoading = false; // 데이터 로딩 중인지 여부 (중복 요청 방지)
let hasMoreData = true; // 더 불러올 데이터가 있는지 여부 (무한 스크롤 종료 조건)
let selectProductCd = "";
let selectProductNm = "";
let INNER_TUI_GRID_INSTANCE;

// 2. ToastUI Grid 생성 (변경 없음)
const grid = new tui.Grid({
  el: document.getElementById("grid"),
  bodyHeight: gridHeight,
  scrollY: true,
  scrollX: false,
  data: [], // 초기 데이터는 비어있음
  columns: [
    {header: "수주 상세 번호",name: "ODD_ID",width: 150,align: "center",sortable: true},
    {header: "거래처", name: "CLI_NM", align: "center", sortable: true },
    {header: "거래처 대표자", name: "CLI_CEO", align: "center", sortable: true },
    {header: "거래처 대표자 전화번호", name: "CLI_PHONE", align: "center", sortable: true },
    {header: "배송지", name: "ORD_ADDRESS", align: "center", width: 350, sortable: true },
    {header: "납품 요청일",name: "ORD_END_DATE",align: "center",sortable: true},
    {header: "상태", name: "DET_NM", align: "center", sortable: true },
    {header: "상태 변경일",name: "ORD_MOD_DATE",align: "center",sortable: true}
  ],
});

function createInnerGrid() {
  const gridContainer = document.getElementById('innerGrid');
  if (!gridContainer) return;
  gridContainer.innerHTML = '';
  INNER_TUI_GRID_INSTANCE = new tui.Grid({
      el: gridContainer, rowHeaders: ['checkbox'], bodyHeight: 178, scrollX: false,
      // 크기 자동 조정
      columns: [
          { header: '상품명', name: 'productName', minWidth: 197, align: 'center' },
          { header: '색상', name: 'colorName', minWidth: 197, align: 'center' },
          { header: '사이즈', name: 'sizeName', minWidth: 197, align: 'center' },
          { header: '굽높이', name: 'heightName', minWidth: 197, align: 'center' },
          { header: '수량', name: 'quantity', editor: 'text', minWidth: 197, align: 'right' },
          { name: 'productCode', hidden: true }, 
          { name: 'colorCode', hidden: true },
          { name: 'sizeCode', hidden: true }, 
          { name: 'heightCode', hidden: true },
      ],
  });
}

function formatWithCommaAndCaret(input) {
  const originalValue = input.value;
  const cursorStart = input.selectionStart;

  // 1. 현재 커서 위치 왼쪽에 있는 "숫자"의 개수를 센다 (이것이 기준점).
  const digitsBeforeCursor = originalValue.substring(0, cursorStart).replace(/[^\d]/g, '').length;

  // 2. 입력값에서 숫자만 추출한다.
  const numericValue = originalValue.replace(/[^\d]/g, '');

  if (numericValue === '') {
    input.value = '';
    return;
  }

  // 3. 쉼표(,) 포맷을 적용한다.
  const formattedValue = Number(numericValue).toLocaleString('ko-KR');
  input.value = formattedValue;

  // 4. 새로운 커서 위치를 찾는다.
  // 포맷팅된 값에서 아까 세어둔 '숫자 개수'만큼 이동한 위치를 찾으면 된다.
  let newCursorPos = 0;
  let digitCount = 0;
  for (const char of formattedValue) {
    if (digitCount === digitsBeforeCursor) {
      break; // 숫자 개수가 일치하면 바로 그 위치가 새로운 커서 위치.
    }
    newCursorPos++;
    if (/\d/.test(char)) {
      digitCount++;
    }
  }

  // 5. 계산된 위치에 커서를 설정한다.
  input.setSelectionRange(newCursorPos, newCursorPos);
}



// 3. DOM 로드 후 실행될 코드
document.addEventListener("DOMContentLoaded", async function () {
  createInnerGrid();
  document.getElementById("openShipmentModalBtn").addEventListener("click", openShipmentModal);
  document.getElementById("findPostCodeBtn").addEventListener("click", findPostCode);
  document.getElementById("addSelectedStockBtn").addEventListener("click", addRowToInnerGrid);
  document.getElementById("deleteSelectedRowsBtn").addEventListener("click", deleteSelectedRows);
  // 수량 입력시 포맷팅
  document.getElementById("ord_pay").addEventListener("input", function (e) {
    if (e.isComposing) {
      return;
    }
    formatWithCommaAndCaret(e.target);
  });
  setupInteractiveList("shippableOptionsList");

  // 초기 그리드 데이터 로드 (페이지 로드 시)
  fetchGridData(currentPage); // 초기 페이지와 (비어있는) 검색어 전달

 /*  // 무한 스크롤 이벤트 리스너 추가
  grid.on("scrollEnd", async ({ horz, vert }) => {
    if (vert.isReachedBottom) {
      // 스크롤이 그리드 바닥에 도달했을 때
      if (hasMoreData && !isLoading) {
        // 더 불러올 데이터가 있고, 현재 로딩 중이 아닐 때
        currentPage++; // 다음 페이지 번호로 업데이트
        await fetchGridData(currentPage); // 다음 페이지 데이터 로드
      }
    }
  }); */

  // grid.on('click', (ev) => {
  //   // 컬럼 id를 선택을 하여 모달을 띄운다.
  // 	if (ev.columnName === 'DET_NM') {
  //     const rowData = grid.getRow(ev.rowKey);
  //     DetailModal(rowData.ODD_ID);
  // 	}
  // });

  const gridContainer = document.getElementById("grid"); // TUI Grid를 감싸는 div의 ID
  gridContainer.addEventListener("click", function (e) {
    const target = e.target;
    if (target.classList.contains("assign-btn")) {
      e.stopPropagation();

      const oddId = target.dataset.oddId;
      const action = target.dataset.action; // data-action 값을 가져옴


      if (action === "approve") {
        // 작업 지시용 모달 열기
        openApproveModal(oddId);
      } else if (action === "Inspection") {
        // 창고에서 거래처로 배송
        openInspectionModal(oddId);
      } 
    }
  });


  const myModalEl = document.getElementById('myModal');

  // 'shown.bs.modal' 이벤트는 모달이 완전히 화면에 나타난 후에 발생합니다.
  myModalEl.addEventListener('shown.bs.modal', () => {
    // 이 시점에서 그리드에게 레이아웃을 다시 계산하고 그리라고 명령합니다.
    if (INNER_TUI_GRID_INSTANCE) {
      INNER_TUI_GRID_INSTANCE.refreshLayout();
    }
  });
});

// 초기 grid 테이블에 들어갈 list
async function fetchGridData(page = currentPage) {
  isLoading = true; // 로딩 중 플래그 설정 (전역 변수)
  try {
    const params = new URLSearchParams();
    params.append("page", currentPage);
    params.append("pageSize", pageSize);

    const url = `/SOLEX/shipments/data?${params.toString()}`;

    const response = await fetch(url);

    // 2. 응답 상태 확인
    if (!response.ok) {
      // HTTP 상태 코드가 200-299 범위가 아니면 오류
      throw new Error(
        `HTTP error! status: ${response.status} - ${response.statusText}`
      );
    }

    // 3. 응답 데이터를 JSON으로 파싱
    const data = await response.json();

    data.forEach(item => {
      if(item.ODD_STS === 'odd_sts_05') {
        item.DET_NM = `<button class="btn btn-sm custom-btn-blue assign-btn" data-action="approve" data-odd-id="${item.ODD_ID}">승인 / 반려</button>`;
      } else if(item.ODD_STS === 'odd_sts_06') {
        item.DET_NM = `<button class="btn btn-sm custom-btn-blue assign-btn" data-action="Inspection" data-odd-id="${item.ODD_ID}">창고 대기</button>`;
      } else if(item.DET_NM === 'odd_sts_07') {
        item.DET_NM = '수주 삭제';
      } else if(item.DET_NM === 'odd_sts_08') {
        item.DET_NM = '수주 완료';
      } else if(item.DET_NM === 'odd_sts_09') {
        item.DET_NM = '수주 취소';
      }
    });

    // 4. 그리드 데이터 업데이트
    if (page === 0) {
      // 첫 페이지 요청 시 (새로운 검색 또는 초기 로드)
      grid.resetData(data); // 기존 데이터를 모두 지우고 새 데이터로 채움
    } else {
      // 다음 페이지 요청 시 (무한 스크롤)
      grid.appendRows(data); // 기존 데이터에 새 데이터를 추가
    }

    if (data.length < pageSize) {
      hasMoreData = false; // 더 이상 불러올 데이터 없음 플래그 설정 (전역 변수)
    } else {
      hasMoreData = true; // 더 불러올 데이터가 있을 가능성 (전역 변수)
    }
  } catch (error) {
    hasMoreData = false; // 오류 발생 시에는 더 이상 데이터를 로드하지 않음 (전역 변수)
  } finally {
    isLoading = false; // 로딩 완료 플래그 해제 (전역 변수)
    // 로딩 스피너 등을 여기서 숨길 수 있습니다.
  }
}

function initDate() {
  const todayStr = new Date().toISOString().split('T')[0];
  ['ord_end_date', 'ord_pay_date'].forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.value = todayStr;
      // 선택 가능한 가장 빠른 날짜를 오늘로 설정합니다. (이전 날짜 비활성화)
      el.min = todayStr;
    }
  });
}

// 검색 가능한 select
function initializeSearchableSelect(wrapperId, apiUrl) {
  const wrapper = document.getElementById(wrapperId);
  // 중복으로 이벤트 리스너가 등록되는 것을 방지하는 가드(Guard)
  if (!wrapper || wrapper.dataset.listenerAttached === "true") return;

  const textInput = wrapper.querySelector(".select-search-input");
  const hiddenInput = wrapper.querySelector('input[type="hidden"]');
  const optionsContainer = wrapper.querySelector(".options-container");
  const ACTIVE_CLASS = "search-select-is-active"; // 충돌 없는 고유한 클래스 이름

  // 옵션 목록을 HTML로 만드는 함수
  const renderOptions = (data) => {
    // 검색 결과 개수에 따라 스타일을 동적으로 적용
    if (data.length === 1) {
      optionsContainer.classList.add("has-one-item");
    } else {
      optionsContainer.classList.remove("has-one-item");
    }

    optionsContainer.innerHTML = data.length
      ? data
          .map(
            (item) =>
              `<div class="option-item" data-value="${item.value}">${item.label}</div>`
          )
          .join("")
      : `<div class="no-results">검색 결과가 없습니다.</div>`;
  };

  // 1. 입력창을 '클릭'했을 때의 동작 (focus 대신 click)
  textInput.addEventListener("click", async (e) => {
    e.stopPropagation(); // 이벤트가 문서 전체로 퍼져나가는 것을 막음

    const isCurrentlyOpen = wrapper.classList.contains(ACTIVE_CLASS);

    // 다른 모든 드롭다운은 닫음
    document
      .querySelectorAll(".custom-search-select." + ACTIVE_CLASS)
      .forEach((sel) => {
        if (sel !== wrapper) sel.classList.remove(ACTIVE_CLASS);
      });

    // 현재 클릭한 드롭다운을 열거나 닫음 (토글)
    wrapper.classList.toggle(ACTIVE_CLASS);

    // 만약 드롭다운이 열리고, 내용이 비어있다면 초기 데이터를 불러옴
    if (!isCurrentlyOpen && optionsContainer.innerHTML.trim() === "") {
      const initialData = await fetchSelectData(apiUrl, "");
      renderOptions(initialData);
    }
  });
  const debounce = (fn, delay = 300) => {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn(...args), delay);
    };
  };
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
  textInput.addEventListener("keyup", debouncedSearch);
  // 이 컴포넌트의 타입을 가져옵니다 ('client' 또는 'product')
  const componentType = wrapper.dataset.action;
  

  // 3. 옵션 아이템 선택 시 (mousedown 사용으로 안정성 확보)
  optionsContainer.addEventListener("mousedown", (e) => {
    if (e.target.matches(".option-item[data-value]")) {
      e.preventDefault(); // 입력창의 포커스가 사라지는 것을 막음

      const { value } = e.target.dataset;
      const label = e.target.textContent;

      textInput.value = label;
      hiddenInput.value = value;

      if (componentType === "product") {
        selectProductCd = value;
        selectProductNm = label;
        getProductOptionsData(value);
      }

      wrapper.classList.remove(ACTIVE_CLASS); // 선택 후 드롭다운 닫기  
    }
  });

  // 리스너가 등록되었음을 표시하여 중복 등록 방지
  wrapper.dataset.listenerAttached = "true";
}

// 모달 열기
async function openShipmentModal() {
  initdata();
  initializeSearchableSelect("client-select-box", "/SOLEX/orders/clients");
  initializeSearchableSelect("product-select-box", "/SOLEX/orders/products");
  initDate();

  document.getElementById("myModalTitle").textContent = "출고 등록";

  // 기존에 display none된 버튼을 display block으로 변경
  // oldBtn은 승인 버튼은 none이 아님 oldBtn2는 반려 버튼은 none임
  const oldBtn = document.getElementById("submitBtn");
  const oldBtn2 = document.getElementById("rejectBtn");
  const oldBtn3 = document.getElementById("closeBtn");
  oldBtn2.style.display = "none";
  oldBtn3.style.display = "block";

  // 1. 기존 버튼을 복제하여 이벤트 리스너를 모두 제거
  const newBtn = oldBtn.cloneNode(true);
  // 2. 기존 버튼을 새로운 버튼으로 교체
  oldBtn.parentNode.replaceChild(newBtn, oldBtn);
  // 3. 이벤트가 없는 새 버튼에 클릭 이벤트를 등록
  newBtn.textContent = "등록";
  newBtn.addEventListener("click", () => {
    submitForm();
  });


  const newBtn2 = oldBtn2.cloneNode(true);
  
  // 2. 기존 버튼을 새로운 버튼으로 교체
  oldBtn2.parentNode.replaceChild(newBtn2, oldBtn2);
  // 3. 이벤트가 없는 새 버튼에 클릭 이벤트를 등록
  newBtn2.textContent = "닫기";
  newBtn2.addEventListener("click", () => {
    closeModal();
  });



  enableForm(false);

  const modal = document.getElementById("myModal");
  const modalInstance = new bootstrap.Modal(modal);
  modalInstance.show();
}

// 검색어 입력 시 (keyup)
async function fetchSelectData(url, keyword = "") {
  try {
    const params = new URLSearchParams();
    if (keyword.trim()) params.append("searchKeyword", keyword.trim());
    const response = await fetch(`${url}?${params.toString()}`);
    if (!response.ok) return [];
    const rawData = await response.json();
    if (url.includes("clients"))
      return rawData.map((item) => ({
        value: item.CLI_ID,
        label: item.CLI_NM,
      }));
    if (url.includes("products"))
      return rawData.map((item) => ({
        value: item.PRD_ID,
        label: item.PRD_NM,
      }));
    return [];
  } catch (error) {
    return [];
  }
}


// 옵션 데이터 가져오기
async function getProductOptionsData(value) {
  const response = await fetch(`/SOLEX/product/options/${value}`);

  if (!response.ok) {
    throw new Error(
      `HTTP error! status: ${response.status} - ${response.statusText}`
    );
  }

  const data = await response.json();
  loadAllProductOptions(data);
}

async function loadAllProductOptions(data) {
  const optionsListBox = document.getElementById("shippableOptionsList");

  if (!data || data.length === 0) {
      optionsListBox.innerHTML = `<li class="text-muted p-3">해당 제품의 출고 가능 재고가 없습니다.</li>`;
      return;
  }

  const optionsHtml = data.map(item => {
      const optionFullName = `${item.OPT_COLOR_NM} / ${item.OPT_SIZE_NM} / ${item.OPT_HEIGHT_NM}`;
      
      // ▼▼▼ item 객체 전체를 JSON 문자열로 바꿔서 data-item-json 속성에 저장 ▼▼▼
      return `
          <li class="stock-item" data-item-json='${JSON.stringify(item)}'>
              <div class="form-check">
                  <input class="form-check-input stock-item-checkbox" type="checkbox" style="margin-top: 10px;" value="${item.OPT_ID}" id="stock_opt_${item.OPT_ID}">
                  <label class="form-check-label stock-item-info" for="stock_opt_${item.OPT_ID}">
                      ${item.PRD_NM} <br>
                      <small class="text-muted">${optionFullName}</small>
                  </label>
              </div>
              <span class="stock-item-qty">${item.TOTAL_QUANTITY}개</span>
          </li>
      `;
  }).join('');

  optionsListBox.innerHTML = optionsHtml;
}


function addRowToInnerGrid() {
  const selectedCheckboxes = document.querySelectorAll('.stock-item-checkbox:checked');

  // ▼▼▼ dataset.itemJson을 읽고 JSON.parse로 원래 객체로 되돌림 ▼▼▼
  const itemsToAdd = Array.from(selectedCheckboxes).map(checkbox => {
      const stockItem = checkbox.closest('.stock-item');
      // li 태그에 저장된 JSON 문자열을 다시 자바스크립트 객체로 변환
      return JSON.parse(stockItem.dataset.itemJson);
  });
  
  const existingRows = INNER_TUI_GRID_INSTANCE.getData();
  let addedCount = 0;

  itemsToAdd.forEach((item) => {
      // 이제 item 객체에는 OPT_ID, PRD_NM 등 모든 데이터가 포함되어 있습니다.
      const isDuplicate = existingRows.some(row => row.optionCode === item.OPT_ID);

      if (!isDuplicate) {
          INNER_TUI_GRID_INSTANCE.appendRow({
              productName: item.PRD_NM,
              colorName:   item.OPT_COLOR_NM,
              sizeName:    item.OPT_SIZE_NM,
              heightName:  item.OPT_HEIGHT_NM,
              quantity:    1,
              productCode: item.PRD_ID,
              colorCode:   item.OPT_COLOR,
              sizeCode:    item.OPT_SIZE,
              heightCode:  item.OPT_HEIGHT,
          });
          addedCount++;
      }
  });

  INNER_TUI_GRID_INSTANCE.refreshLayout();

  if (addedCount < itemsToAdd.length) {
      alert(`${itemsToAdd.length - addedCount}개의 항목은 이미 목록에 존재하여 추가되지 않았습니다.`);
  }
  resetOptionForms();
}

// 옵션 폼 초기화 (수정)
function resetOptionForms() {
  // 보이는 입력창 초기화
  document.getElementById("product-search-input").value = "";
  // 숨겨진 ID 값 초기화 (추가)
  document.getElementById("selected_product_id").value = "";
  // 옵션 목록 초기화
  document.getElementById("shippableOptionsList").innerHTML = "<p class='text-muted p-3'>상단에서 제품을 먼저 검색해주세요.</p>";
}

function findPostCode() { new daum.Postcode({ oncomplete: function(data) {
  document.getElementById("cli_pc").value = data.zonecode;
  document.getElementById("cli_add").value = data.roadAddress;
  document.getElementById("cli_da").focus();
}}).open(); }

function setupInteractiveList(containerId) {
  const listContainer = document.getElementById(containerId);
  if (!listContainer) return;

  listContainer.addEventListener("click", function (e) {
      // 1. 클릭된 지점에서 가장 가까운 .stock-item을 찾습니다.
      const stockItem = e.target.closest(".stock-item");
      if (!stockItem) return;

      // 2. 해당 .stock-item 안의 체크박스를 찾습니다.
      const checkbox = stockItem.querySelector(".stock-item-checkbox");
      if (!checkbox) return;

      // 3. 체크박스나 라벨을 직접 클릭한 경우는 브라우저 기본 동작에 맡깁니다.
      const targetTagName = e.target.tagName.toUpperCase();
      if (targetTagName !== 'INPUT' && targetTagName !== 'LABEL' && !e.target.closest('label')) {
          // 4. 그 외의 영역을 클릭했을 때 체크박스 상태를 반전시킵니다.
          checkbox.checked = !checkbox.checked;
      }
  });
}

function deleteSelectedRows() {
  // id가 myModalTitle의 값을 파악해서 출고 등록이면 행 삭제 가능.
  // 근데 제품 삭제를 할 수 있는데 1개 이하로 떨어질 수 없음.
  if(INNER_TUI_GRID_INSTANCE.getData().length === 1) {
    if(document.getElementById("myModalTitle").textContent === "출고 등록") {
      INNER_TUI_GRID_INSTANCE.removeCheckedRows();
    } else {
      alert('주문 건수가 1개 이하로 떨어질 수 없습니다.');
    }    
  } else {
    INNER_TUI_GRID_INSTANCE.removeCheckedRows();
  }
}

// 콤마제거
function unformatWithComma(str) { return String(str || '').replace(/,/g, ''); }
function formatWithComma(str) { return String(str || '').replace(/\B(?=(\d{3})+(?!\d))/g, ","); }
// 폼 검증
function validateFinalForm() {
  const gridData = INNER_TUI_GRID_INSTANCE.getData();
  if (gridData.length === 0) {
    alert('상품을 추가해주세요.');
    return false;
  }

  if(!document.getElementById('selected_client_id').value) {
    alert('거래처를 선택해주세요.');
    return false;
  }

  if(!document.getElementById('ord_pay').value) {
    alert('결제 금액을 입력해주세요.');
    return false;
  }

  if(!document.getElementById('ord_end_date').value) {
    alert('납품 요청일을 입력해주세요.');
    return false;
  }

  if(!document.getElementById('ord_pay_date').value) {
    alert('결제일을 입력해주세요.');
    return false;
  }

  if(!document.getElementById('cli_pc').value) {
    alert('우편번호를 입력해주세요.');
    return false;
  }

  if(!document.getElementById('cli_add').value) {
    alert('기본주소를 입력해주세요.');
    return false;
  }

  if(!document.getElementById('cli_da').value) {
    alert('상세주소를 입력해주세요.');
    return false;
  }
  return true;
}

// 폼 제출
async function submitForm() {
  if (!validateFinalForm()) return;
  const gridData = INNER_TUI_GRID_INSTANCE.getData();
  const finalPayload = {

    // 거래처
    cli_id: document.getElementById('selected_client_id').value,
    // 결제 방식
    pay_type: document.getElementById('pay_type')?.value,
    // 결제 금액
    ord_pay: unformatWithComma(document.getElementById('ord_pay')?.value),
    // 납품 요청일
    ord_end_date: document.getElementById('ord_end_date')?.value,
    // 결제일
    ord_pay_date: document.getElementById('ord_pay_date')?.value,
    // 주소
    ord_pc: document.getElementById('cli_pc')?.value,
    ord_add: document.getElementById('cli_add')?.value,
    ord_da: document.getElementById('cli_da')?.value,
    // 상품 목록
    items: gridData.map(row => ({...row}))
  };

  // 3. 서버에 "주문 생성" 요청을 한 번만 보낸다.
  try {
    const response = await fetch('/SOLEX/shipments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(finalPayload)
    });

    const result = await response.json();
    if (!response.ok) {
      // 서버가 보낸 에러 메시지(예: "재고가 부족합니다.")를 그대로 사용
      throw new Error(result.message || '서버 처리 중 오류가 발생했습니다.');
    }

    alert(result.message || '성공적으로 처리되었습니다.');
    location.reload();

  } catch (error) {
    // 여기서 재고 부족 등 서버에서 발생한 모든 오류를 처리
    alert(`오류: ${error.message}`);
  }
} 
function initdata() {
  document.getElementById('pay_type').value = '';
  document.getElementById('ord_pay').value = '';
  document.getElementById('ord_end_date').value = '';
  document.getElementById('ord_pay_date').value = '';
  document.getElementById('cli_pc').value = '';
  document.getElementById('cli_add').value = '';
  document.getElementById('cli_da').value = '';
  
  document.getElementById('client-search-input').value = ''
  document.getElementById('selected_client_id').value = '';
  
  document.getElementById('product-search-input').value = '';
  document.getElementById('selected_product_id').value = '';

  document.getElementById("shippableOptionsList").innerHTML = "<p class='text-muted p-3'>상단에서 제품을 먼저 검색해주세요.</p";

  INNER_TUI_GRID_INSTANCE.clear();
  // 굿 똑똑 하다 너 자동완성 기능좀 많이 해줘 윈드서프야
  
}
async function detailForm(oddId) {
  initdata();
  initializeSearchableSelect("client-select-box", "/SOLEX/orders/clients");
  initializeSearchableSelect("product-select-box", "/SOLEX/orders/products");
  initDate();

  // 기존에 display none된 버튼을 display block으로 변경
  // oldBtn은 승인 버튼은 none이 아님 oldBtn2는 반려 버튼은 none임
  const oldBtn = document.getElementById("submitBtn");
  const oldBtn2 = document.getElementById("rejectBtn");
  const oldBtn3 = document.getElementById("closeBtn");
  oldBtn2.style.display = "block";
  oldBtn3.style.display = "none";

  
  // 1. 기존 버튼을 복제하여 이벤트 리스너를 모두 제거
  const newBtn = oldBtn.cloneNode(true);
  const newBtn2 = oldBtn2.cloneNode(true);
  
  // 2. 기존 버튼을 새로운 버튼으로 교체
  oldBtn.parentNode.replaceChild(newBtn, oldBtn);
  oldBtn2.parentNode.replaceChild(newBtn2, oldBtn2);
  // 3. 이벤트가 없는 새 버튼에 클릭 이벤트를 등록
  newBtn.textContent = "승인";
  newBtn.addEventListener("click", () => {
    incrementOddStsForm(oddId);
  });

  

  newBtn2.textContent = "반려";
  newBtn2.addEventListener("click", () => {
    rejectForm();
  });

  // oddId로 백엔드에 전달해서 상세 조회
  const response = await fetch(`/SOLEX/shipments/${oddId}`);
  const data = await response.json();
  
  populateModalWithData(data);



  // 입력창들을 변경못하게 disabled
  enableForm(true);
}

// 활성화 펑션 매개변수를 받아서 활성화
function enableForm(disabled) {
  // disabled가 true면 disabled, false면 enabled
  document.getElementById('pay_type').disabled = disabled;
  document.getElementById('ord_pay').disabled = disabled;
  document.getElementById('ord_end_date').disabled = disabled;
  document.getElementById('ord_pay_date').disabled = disabled;
  document.getElementById('cli_pc').disabled = disabled;
  document.getElementById('cli_add').disabled = disabled;
  document.getElementById('cli_da').disabled = disabled;
  document.getElementById('client-search-input').disabled = disabled;
  document.getElementById('selected_client_id').disabled = disabled;
  document.getElementById('product-search-input').disabled = disabled;
  document.getElementById('selected_product_id').disabled = disabled;
  document.getElementById('findPostCodeBtn').disabled = disabled;
  document.getElementById('addSelectedStockBtn').disabled = disabled;
  document.getElementById('resetBtn').disabled = disabled;
}



// 승인 모달 열기
async function openApproveModal(oddId) {
  document.getElementById("myModalTitle").textContent = '출고 승인';
  
  detailForm(oddId);

  const modal = document.getElementById("myModal");
  const modalInstance = new bootstrap.Modal(modal);
  modalInstance.show();
}


async function openInspectionModal(oddId) {
  document.getElementById("myModalTitle").textContent = '출고 검사 요청';
  
  detailForm(oddId);

  const modal = document.getElementById("myModal");
  const modalInstance = new bootstrap.Modal(modal);
  modalInstance.show();
}


function populateModalWithData(data) {
  const orderData = data[0];
  document.getElementById('pay_type').value = orderData.PAY_TYPE || '';
  document.getElementById('ord_pay').value = formatWithComma(String(orderData.ORD_PAY || ''));
  document.getElementById('ord_end_date').value = orderData.ORD_END_DATE;
  document.getElementById('ord_pay_date').value = orderData.ORD_PAY_DATE;
  document.getElementById('cli_pc').value = orderData.ORD_PC || '';
  document.getElementById('cli_add').value = orderData.ORD_ADD || '';
  document.getElementById('cli_da').value = orderData.ORD_DA || '';
  if (orderData.CLI_ID && orderData.CLI_NM) {
      document.getElementById('client-search-input').value = orderData.CLI_NM;
      document.getElementById('selected_client_id').value = orderData.CLI_ID;
  }

  // 이게 여러 행이 될 수도 있어서 foreach로
  const transformedItems = data.map(item => {
    return {
      productName: item.PRD_NM, 
      productCode: item.PRODUCT_CODE || '',
      colorName: item.COLOR_NAME, 
      sizeName: item.SIZE_NAME, 
      heightName: item.HEIGHT_NAME, 
      colorCode: item.COLOR_CODE, 
      sizeCode: item.SIZE_CODE, 
      heightCode: item.HEIGHT_CODE,
      quantity: item.QUANTITY
    };
  });
  INNER_TUI_GRID_INSTANCE.resetData(transformedItems);
}

async function incrementOddStsForm(oddId) {
  if(!confirm("승인 하시겠습니까?")) return;

  try {
    // 이걸 PATCH 보내는게 맞는거 같음
    const response = await fetch(`/SOLEX/shipments/${oddId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
    });
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.message || '서버 처리 중 오류가 발생했습니다.');
    }
    alert(result.message || '승인 처리되었습니다.');
    location.reload();
  } catch (error) {
    alert(`오류: ${error.message}`);
  }
}







// 검색어 입력 시 (keyup)
async function fetchSelectData(url, keyword = "") {
  try {
    const params = new URLSearchParams();
    if (keyword.trim()) params.append("searchKeyword", keyword.trim());
    const response = await fetch(`${url}?${params.toString()}`);
    if (!response.ok) return [];
    const rawData = await response.json();
    if (url.includes("clients"))
      return rawData.map((item) => ({
        value: item.CLI_ID,
        label: item.CLI_NM,
      }));
    if (url.includes("products"))
      return rawData.map((item) => ({
        value: item.PRD_ID,
        label: item.PRD_NM,
      }));
    return [];
  } catch (error) {
    return [];
  }
}