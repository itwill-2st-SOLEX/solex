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
    {header: "수주 상세번호",name: "ODD_ID",width: 100,align: "center",sortable: true},
    {header: "제품 코드",name: "PRD_CODE",width: 100,align: "center",sortable: true},
    {header: "거래처", name: "CLI_NM", align: "center", sortable: true },
    {header: "제품명", name: "PRD_NM", width: 200,align: "center",sortable: true},
    {header: "컬러", name: "OPT_COLOR",width: 80,align: "center",sortable: true},
    {header: "사이즈",name: "OPT_SIZE",width: 80,align: "center",sortable: true},
    {header: "굽",name: "OPT_HEIGHT",width: 80,align: "center",sortable: true},
    {header: "주문 수량", name: "ODD_CNT", align: "center", sortable: true },
    {header: "진행 현황", name: "DET_NM", align: "center", sortable: true },
    {header: "원자재 재고 여부",name: "PRODUCTION_STATUS",align: "center",sortable: true},
    {header: "납품 요청일",name: "ORD_END_DATE",align: "center",sortable: true},
  ],
});

function createInnerGrid() {
  const gridContainer = document.getElementById('innerGrid');
  if (!gridContainer) return;
  gridContainer.innerHTML = '';
  INNER_TUI_GRID_INSTANCE = new tui.Grid({
      el: gridContainer, rowHeaders: ['checkbox'], bodyHeight: 200, scrollX: false,
      columns: [
          { header: '상품명', name: 'productName', minWidth: 207, align: 'center' },
          { header: '색상', name: 'colorName', minWidth: 207, align: 'center' },
          { header: '사이즈', name: 'sizeName', minWidth: 207, align: 'center' },
          { header: '굽높이', name: 'heightName', minWidth: 207, align: 'center' },
          { header: '수량', name: 'quantity', editor: 'text', minWidth: 207, align: 'right' },
          { name: 'productCode', hidden: true }, { name: 'colorCode', hidden: true },
          { name: 'sizeCode', hidden: true }, { name: 'heightCode', hidden: true },
      ],
  });
}

// 3. DOM 로드 후 실행될 코드
document.addEventListener("DOMContentLoaded", async function () {
  createInnerGrid();
  document.getElementById("openPurchaseModalBtn").addEventListener("click", openPurchaseModal);
  document.getElementById("addRowBtn").addEventListener("click", addRowBtn);
  document.getElementById("findPostCodeBtn").addEventListener("click", findPostCode);

  document.addEventListener("click", (e) => {
    // 2. 다중 선택 셀렉트 박스(색상/사이즈/굽) 닫기
    const selectBox = e.target.closest(".custom-select-wrapper .select-box");
    if (selectBox) {
      const wrapper = selectBox.closest(".custom-select-wrapper");
      wrapper.classList.toggle("open");
      document
        .querySelectorAll(".custom-select-wrapper.open")
        .forEach((openWrapper) => {
          if (openWrapper !== wrapper) openWrapper.classList.remove("open");
        });
    }
    // 클릭한 위치가 .custom-select-wrapper 내부가 아닐 때만 실행
    if (!e.target.closest(".custom-select-wrapper")) {
      document
        .querySelectorAll(".custom-select-wrapper.open")
        .forEach((select) => {
          select.classList.remove("open");
        });
    }
  });

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

      const oddId = target.dataset.ordId;
      const action = target.dataset.action; // data-action 값을 가져옴

      console.log(`[버튼 클릭] 주문 ID: ${oddId}, 액션: ${action}`);

      if (action === "create") {
        // 작업 지시용 모달 열기
        console.log("openPurchaseModal");
        openPurchaseModal();
      }
      //  else if (action === 'request') {
      //     // 자재 요청용 모달 열기
      //     openMaterialRequestModal(oddId);
      // }
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

    const url = `/SOLEX/order-requests/data?${params.toString()}`;

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
    console.log(data);

    data.map((item) => {
      if (item.PRODUCTION_STATUS == "생산 가능") {
        // data-action="instruct" 추가
        item.PRODUCTION_STATUS = `<button class="btn btn-sm custom-btn-blue assign-btn" data-action="instruct" data-ord-id="${item.ODD_ID}">작업 지시</button>`;
      } else {
        // data-action="request" 추가
        item.PRODUCTION_STATUS = `<button class="btn btn-sm custom-btn-blue assign-btn" data-action="request" data-ord-id="${item.ODD_ID}">자재 요청</button>`;
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
    console.error("그리드 데이터 로딩 중 오류 발생:", error);
    hasMoreData = false; // 오류 발생 시에는 더 이상 데이터를 로드하지 않음 (전역 변수)
  } finally {
    isLoading = false; // 로딩 완료 플래그 해제 (전역 변수)
    // 로딩 스피너 등을 여기서 숨길 수 있습니다.
  }
}

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
  const componentType = wrapper.dataset.type;

  // 3. 옵션 아이템 선택 시 (mousedown 사용으로 안정성 확보)
  optionsContainer.addEventListener("mousedown", (e) => {
    if (e.target.matches(".option-item[data-value]")) {
      e.preventDefault(); // 입력창의 포커스가 사라지는 것을 막음

      const { value } = e.target.dataset;
      const label = e.target.textContent;

      textInput.value = label;
      hiddenInput.value = value;

      if (componentType === "client") {
      } else if (componentType === "product") {
        console.log(value, label);
        selectProductCd = value;
        selectProductNm = label;
        console.log(selectProductCd, selectProductNm);
        getOptionsData(value);  
      }

      wrapper.classList.remove(ACTIVE_CLASS); // 선택 후 드롭다운 닫기
    }
  });

  // 리스너가 등록되었음을 표시하여 중복 등록 방지
  wrapper.dataset.listenerAttached = "true";
}

// 모달 열기
async function openPurchaseModal() {
  initializeSearchableSelect("client-select-box", "/SOLEX/orders/clients");
  initializeSearchableSelect("product-select-box", "/SOLEX/orders/products");

  const oldBtn = document.getElementById("submitBtn");
  // 1. 기존 버튼을 복제하여 이벤트 리스너를 모두 제거
  const newBtn = oldBtn.cloneNode(true);
  // 2. 기존 버튼을 새로운 버튼으로 교체
  oldBtn.parentNode.replaceChild(newBtn, oldBtn);
  // 3. 이벤트가 없는 새 버튼에 클릭 이벤트를 등록
  newBtn.textContent = "등록";
  newBtn.addEventListener("click", () => {
    submitForm();
  });

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
async function getOptionsData(value) {
  const response = await fetch(`/SOLEX/product/options/${value}`);

  if (!response.ok) {
    throw new Error(
      `HTTP error! status: ${response.status} - ${response.statusText}`
    );
  }

  const data = await response.json();
  loadAllProductOptions(data);
}

// 모든 옵션 데이터 로드
async function loadAllProductOptions(data) {
  let optionsData;
  if (typeof data === "string" || typeof data === "number") {
    if (!data) {
      resetOrderStep("color");
      return;
    }
    try {
      optionsData = await (await fetch(`/SOLEX/orders/product/${data}`)).json();
    } catch (error) {
      resetOrderStep("color");
      return;
    }
  } else if (Array.isArray(data)) {
    optionsData = data;
  } else {
    resetOrderStep("color");
    return;
  }
  originalOptionsData = optionsData || [];
  const unique = { colors: new Map(), sizes: new Map(), heights: new Map() };
  originalOptionsData.forEach((opt) => {
    if (opt.OPT_COLOR && opt.OPT_COLOR_NM)
      unique.colors.set(opt.OPT_COLOR, opt.OPT_COLOR_NM);
    if (opt.OPT_SIZE && opt.OPT_SIZE_NM)
      unique.sizes.set(opt.OPT_SIZE, opt.OPT_SIZE_NM);
    if (opt.OPT_HEIGHT && opt.OPT_HEIGHT_NM)
      unique.heights.set(opt.OPT_HEIGHT, opt.OPT_HEIGHT_NM);
  });
  const optionConfigs = {
    color: { data: Array.from(unique.colors), multi: true },
    size: {
      data: Array.from(unique.sizes).sort((a, b) => +a[1] - +b[1]),
      multi: true,
    },
    height: {
      data: Array.from(unique.heights).sort((a, b) => +a[1] - +b[1]),
      multi: true,
    },
  };
  for (const [type, { data: configData, multi }] of Object.entries(
    optionConfigs
  )) {
    const wrapper = document.getElementById(`${type}CustomSelectWrapper`);
    const container = wrapper?.querySelector(".options-container");
    if (container) {
      container.innerHTML = configData
        .map(
          ([value, label]) =>
            `<div class="option" data-value="${value}">${label}</div>`
        )
        .join("");
      initializeCustomSelect(wrapper.id, multi);
    }
  }
}

// 다중 선택 셀렉트 박스 초기화
function initializeCustomSelect(wrapperId, isMultiSelect) {
  const wrapper = document.getElementById(wrapperId);
  if (!wrapper) return;
  const optionsContainer = wrapper.querySelector(".options-container");
  const input = wrapper.querySelector(".select-box input");
  const hiddenInput = document.getElementById(
    `opt_${wrapperId.replace("CustomSelectWrapper", "")}`
  );
  const selectedValues = new Set(hiddenInput.value.split(",").filter(Boolean));
  optionsContainer.querySelectorAll(".option").forEach((option) => {
    option.onclick = (e) => {
      e.stopPropagation();
      const value = option.getAttribute("data-value");
      if (isMultiSelect) {
        option.classList.toggle("selected");
        if (selectedValues.has(value)) selectedValues.delete(value);
        else selectedValues.add(value);
      }
      updateDisplayValue(input, hiddenInput, selectedValues, optionsContainer);
    };
    if (selectedValues.has(option.dataset.value))
      option.classList.add("selected");
  });
  updateDisplayValue(input, hiddenInput, selectedValues, optionsContainer);
}

// 다중 선택 셀렉트 박스의 선택된 값을 화면에 표시하는 함수
function updateDisplayValue(input,hiddenInput,selectedValues,optionsContainer) {
  const labels = Array.from(selectedValues)
    .map(
      (val) =>
        optionsContainer.querySelector(`.option[data-value="${val}"]`)
          ?.textContent || ""
    )
    .filter(Boolean);
  let displayText = "";
  if (labels.length === 1) displayText = labels[0];
  else if (labels.length > 1)
    displayText = `${labels[0]} 외 ${labels.length - 1}개`;
  input.value = displayText;
  if (hiddenInput) hiddenInput.value = Array.from(selectedValues).join(",");
}

function addRowBtn() {
  addRowToInnerGrid();
}

function addRowToInnerGrid() {
  const getSelected = (id) =>
    document.getElementById(id)?.value.split(",").filter(Boolean);
  const selected = {
    colors: getSelected("opt_color"),
    sizes: getSelected("opt_size"),
    heights: getSelected("opt_height"),
  };

  if (!selectProductCd) {
    alert("먼저 상품을 선택해주세요.");
    return;
  }
  if ( selected.colors.length * selected.sizes.length * selected.heights.length === 0 ) {
    alert("색상, 사이즈, 굽높이를 각각 하나 이상 선택해주세요.");
    return;
  }
  const validCombinations = originalOptionsData.filter(
    (opt) =>
      selected.colors.includes(opt.OPT_COLOR) &&
      selected.sizes.includes(opt.OPT_SIZE) &&
      selected.heights.includes(opt.OPT_HEIGHT)
  );
  if (validCombinations.length === 0) {
    alert("선택하신 옵션에 해당하는 유효한 제품 조합이 없습니다.");
    return;
  }
  const existingRows = INNER_TUI_GRID_INSTANCE.getData();
  let addedCount = 0;
  validCombinations.forEach((item) => {
    const isDuplicate = existingRows.some((row) =>
      row.productCode === selectProductCd && row.colorCode === item.OPT_COLOR && row.sizeCode === item.OPT_SIZE && row.heightCode === item.OPT_HEIGHT);
    if (!isDuplicate) {
      INNER_TUI_GRID_INSTANCE.appendRow({
        productName: selectProductNm,
        productCode: selectProductCd,
        colorName: item.OPT_COLOR_NM,
        colorCode: item.OPT_COLOR,
        sizeName: item.OPT_SIZE_NM,
        sizeCode: item.OPT_SIZE,
        heightName: item.OPT_HEIGHT_NM,
        heightCode: item.OPT_HEIGHT,
        quantity: 1,
      });
      console.log(INNER_TUI_GRID_INSTANCE.getData());
      addedCount++;
      INNER_TUI_GRID_INSTANCE.refreshLayout();
    }
  });
  if (addedCount < validCombinations.length)
    alert(`${validCombinations.length - addedCount}개의 항목은 이미 목록에 존재하여 추가되지 않았습니다.`);
  resetOptionForms();
}

// 옵션 폼 초기화
function resetOptionForms() {
  document.getElementById("product-search-input").value = "";

  ["color", "size", "height"].forEach((type) => {
    const wrapper = document.getElementById(`${type}CustomSelectWrapper`);
    if (wrapper) {
      wrapper.querySelector(".select-box input").value = "";
      wrapper.querySelector(".options-container").innerHTML = "";
      document.getElementById(`opt_${type}`).value = "";
    }
  });
}

function findPostCode() { new daum.Postcode({ oncomplete: function(data) {
  document.getElementById("cli_pc").value = data.zonecode;
  document.getElementById("cli_add").value = data.roadAddress;
  document.getElementById("cli_da").focus();
}}).open(); }



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
    const response = await fetch('/SOLEX/purchase-orders', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(finalPayload) });
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || `서버 오류`);
    alert(result.message || '성공적으로 처리되었습니다.');
    location.reload();
  } catch (error) {
    alert(`오류: ${error.message}`);
  }
}