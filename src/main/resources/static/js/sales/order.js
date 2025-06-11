// order.js

// 1. 전역 변수 설정
let currentPage = 0;
const pageSize = 20;
const gridHeight = 700;

let searchKeyword = ''; // 단일 통합 검색 키워드를 저장할 전역 변수
let isLoading = false; // 데이터 로딩 중인지 여부 (중복 요청 방지)
let hasMoreData = true; // 더 불러올 데이터가 있는지 여부 (무한 스크롤 종료 조건)


let VirtualSelectClientInput = "";
let VirtualSelectProductInput = "";

let isSelectClient = false;
let isSelectProduct = false;

let selectProductCd = "";
let selectClientCd = "";


// 2. ToastUI Grid 생성 (변경 없음)
const grid = new tui.Grid({
    el: document.getElementById('grid'),
    bodyHeight: gridHeight,
    scrollY: true,
    scrollX: false,
    data: [], // 초기 데이터는 비어있음
    columns: [
        { header: '상품 코드', name: 'PRD_CD', width: 100,align: 'center', sortable: true },
        { header: '상품명', name: 'PRD_NM', width: 200, sortable: true },
        { header: '거래처 명', name: 'CLI_NM', align: 'center', sortable: true },
        { header: '주문 수량', name: 'ODD_CNT', align: 'center', sortable: true },
        { header: '배송지', name: 'ODD_ADDRESS', align: 'center', sortable: true },
        { header: '진행 상태', name: 'DET_NM', align: 'center', sortable: true },
        { header: '상태 변경일', name: 'ORD_REG_DATE', align: 'center', sortable: true }
    ],
});

// 3. DOM 로드 후 실행될 코드
document.addEventListener('DOMContentLoaded', async function() { // async 키워드 추가
	const endDateEl = document.getElementById('odd_end_date');
    const payDateEl = document.getElementById('odd_pay_date');
    if (endDateEl) endDateEl.addEventListener('change', onEndDateChange);
    if (payDateEl) payDateEl.addEventListener('change', onPayDateChange);
	
	// DOM 로드 후 검색 입력 필드와 버튼 요소를 가져옴
	const searchInput = document.getElementById('searchInput'); // 검색 입력 필드 (이미지에 보이는 큰 검색창)
	// 검색 입력 필드에서 Enter 키 눌렀을 때 검색 트리거
    if (searchInput) {
        searchInput.addEventListener('keypress', function(event) {
            if (event.key === 'Enter') {
                searchButton.click(); // Enter 키 누르면 검색 버튼 클릭 효과
            }
        });
    }
	
	// 초기 그리드 데이터 로드 (페이지 로드 시)
	fetchGridData(currentPage, searchKeyword); // 초기 페이지와 (비어있는) 검색어 전달
	
	// 무한 스크롤 이벤트 리스너 추가
	grid.on('scrollEnd', async ({ horz, vert }) => {
	    if (vert.isReachedBottom) { // 스크롤이 그리드 바닥에 도달했을 때
	        console.log('그리드 스크롤 바닥 도달!');
	        if (hasMoreData && !isLoading) { // 더 불러올 데이터가 있고, 현재 로딩 중이 아닐 때
	            currentPage++; // 다음 페이지 번호로 업데이트
	            await fetchGridData(currentPage, searchKeyword); // 다음 페이지 데이터 로드
	        }
	    }
	});
	attachNumericFormatter('odd_cnt');
	attachNumericFormatter('odd_pay');
	
	// --- 주문 등록 모달 관련 요소 및 이벤트 리스너 ---
    const openOrderModalBtn = document.getElementById('openOrderModalBtn'); // '주문 등록' 버튼
    const myModalElement = document.getElementById('myModal'); // Bootstrap 모달 컨테이너 ID

	// Bootstrap 모달 인스턴스 초기화
    let orderRegisterModalInstance = null; // 전역 변수로 선언하여 다른 함수에서도 사용 가능하게 함
    if (myModalElement) {
        orderRegisterModalInstance = new bootstrap.Modal(myModalElement);
		
		
		// ← 여기 추가: shown.bs.modal 이벤트 바인딩
	    myModalElement.addEventListener('shown.bs.modal', () => {
	      initOddEndDate();     // 오늘 날짜 세팅 + min 속성 세팅 + change 콘솔 로그
	      // 선택 플래그 초기화
	      isSelectClient  = false;
	      isSelectProduct = false;
	      updateInputState();   // odd_* 필드 비활성화
	    });
		  
    }
	// 모달이 닫힐 때: 폼 전체 초기화 (선택값, 입력값, 플래그, 재고표시 등)
    myModalElement.addEventListener('hidden.bs.modal', () => {
      // 플래그 & 입력 상태 리셋
      isSelectClient  = false;
      isSelectProduct = false;
      updateInputState();

	  document
	      .querySelectorAll('#cli_nm_virtual_select .vscomp-clear-button.toggle-button-child')
	      .forEach(btn => btn.click());
	    // 상품 clear 버튼
	    document
	      .querySelectorAll('#prd_nm_virtual_select .vscomp-clear-button.toggle-button-child')
	      .forEach(btn => btn.click());

      // 일반 input 비우기
      [
        'cli_phone','cli_mgr_name','cli_mgr_phone',
        'odd_cnt','odd_end_date','odd_pay','odd_pay_date'
      ].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = '';
      });

      // 재고 표시 숨기기
      const stockEl = document.getElementById('stockCount');
      if (stockEl) {
        stockEl.textContent = '';
        stockEl.style.display = 'none';
      }

      // 날짜 피커 다시 오늘 날짜로 초기화
      initOddEndDate();
    });

    if (openOrderModalBtn) {
        openOrderModalBtn.addEventListener('click', async function() {
            if (orderRegisterModalInstance) {
                orderRegisterModalInstance.show(); // Bootstrap 모달 열기
            }
            await loadClientDataForModal(); // 모달 데이터 로드
            await loadProductDataForModal(); // 모달 데이터 로드
        });
    }


}); // DOMContentLoaded 끝

// 초기 grid 테이블에 들어갈 list
async function fetchGridData(page = currentPage, currentSearchKw = searchKeyword) {
    if (isLoading) return;
    isLoading = true; // 로딩 시작 플래그 설정 (전역 변수)


    try {
        const params = new URLSearchParams();
        params.append('page', currentPage);
        params.append('pageSize', pageSize);

        if (currentSearchKw) { // 검색어가 비어있지 않다면 (null, '', undefined, ' ') 포함
            params.append('searchKeyword', currentSearchKw); 
        }
        
        const url = `/solex/orders/gridData?${params.toString()}`; 
		
        
        const response = await fetch(url);

        // 2. 응답 상태 확인
        if (!response.ok) { // HTTP 상태 코드가 200-299 범위가 아니면 오류
            throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`);
        }
        
        // 3. 응답 데이터를 JSON으로 파싱
        const data = await response.json();
        
        // 4. 그리드 데이터 업데이트
        if (page === 0) { // 첫 페이지 요청 시 (새로운 검색 또는 초기 로드)
            grid.resetData(data); // 기존 데이터를 모두 지우고 새 데이터로 채움
        } else { // 다음 페이지 요청 시 (무한 스크롤)
            grid.appendRows(data); // 기존 데이터에 새 데이터를 추가
        }

        // 5. 더 불러올 데이터가 있는지 판단 (무한 스크롤 종료 조건)
        // 서버에서 받아온 데이터의 개수가 요청한 pageSize보다 적으면 더 이상 데이터가 없다고 판단
        if (data.length < pageSize) {
            hasMoreData = false; // 더 이상 불러올 데이터 없음 플래그 설정 (전역 변수)
        } else {
            hasMoreData = true; // 더 불러올 데이터가 있을 가능성 (전역 변수)
        }

    } catch (error) {
        console.error('그리드 데이터 로딩 중 오류 발생:', error);
        hasMoreData = false; // 오류 발생 시에는 더 이상 데이터를 로드하지 않음 (전역 변수)
    } finally {
        isLoading = false; // 로딩 완료 플래그 해제 (전역 변수)
        // 로딩 스피너 등을 여기서 숨길 수 있습니다.
    }
}

function resetAndFetchGridData() {
    currentPage = 0; // 페이지 번호 초기화
    hasMoreData = true; // 새로운 검색이므로 더 불러올 데이터 있다고 가정
    grid.resetData([]); // 그리드 데이터 초기화 (화면 비우기)
    // searchKeyword는 이미 검색 버튼 클릭 시 업데이트되었으므로 파라미터로 직접 전달
    fetchGridData(currentPage, searchKeyword);
}



async function loadClientDataForModal() {
  const el = document.getElementById('cli_nm_virtual_select');
  if (!el || el.virtualSelectInstance) return;

  const debounce = (fn, delay = 300) => {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn(...args), delay);
    };
  };

  // 1) VirtualSelect 초기화 (서버 검색 콜백만 설정)
  const vsInst = VirtualSelect.init({
    ele: el,
    placeholder: "거래처명을 검색하세요...",
    search: true,
    clearButton: true,
    autoSelectFirstOption: false,
    value: "",
    onServerSearch: debounce(async (searchValue, virtualSelectInstance) => {
      await fetchAndSetClientOptions(searchValue, virtualSelectInstance);
    }, 300)
  });

  vsInst.$ele.addEventListener('change',async  (e) => {
	
	  const cliNm = vsInst.getValue();
	  
	  selectClientCd = cliNm;
	
	  if (cliNm && cliNm.trim()) {
	    // 실제 코드가 있을 때만 재고 조회
	    isSelectClient = true;
	  } else {
	    // clear(빈값)이면 false 세팅
	    isSelectClient = false;
	  }
	  await getClientInfo(cliNm);  
	
	
      updateInputState();
  });
  
  

  // 3) DOM에 인스턴스 저장
  el.virtualSelectInstance = vsInst;
  
  // 4) input 이벤트 (전역 변수 갱신)
  const inputEl = document.getElementById(vsInst.$searchInput.id);
  inputEl.addEventListener('input', e => {
    VirtualSelectClientInput = e.target.value;
  });

  // 5) ▶️ 초기 데이터 한 번 로드
  await fetchAndSetClientOptions("", vsInst);


}


// 서버 호출 + 옵션 세팅을 분리한 헬퍼 함수
async function fetchAndSetClientOptions(searchValue, virtualSelectInstance) {
  const params = new URLSearchParams();
  params.append('page', currentPage);
  params.append('pageSize', pageSize);
  if (searchValue && searchValue.trim()) {
    params.append('searchKeyword', searchValue.trim());
  }
  
  const url = `/solex/orders/clients?${params.toString()}`;

  try {
    const resp = await fetch(url, { headers: { 'Accept': 'application/json' } });
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const json = await resp.json();

    // json이 배열이라 가정
    const options = json.map(item => ({
      label: item.CLI_NM,
      value: item.CLI_ID
    }));
    // hasMore 정보가 들어있지 않다면, (json.length === pageSize) 등으로 대체하세요
    const hasMore = Array.isArray(json) && json.length === pageSize;

    virtualSelectInstance.setServerOptions(options, hasMore);
  } catch (err) {
    console.error('거래처 초기/검색 오류:', err);
    virtualSelectInstance.setServerOptions([], false);
  }
}


async function loadProductDataForModal() {
  const el = document.getElementById('prd_nm_virtual_select');
  if (!el || el.virtualSelectInstance) return;

  const debounce = (fn, delay = 300) => {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn(...args), delay);
    };
  };

  // 1) VirtualSelect 초기화 (서버 검색 콜백만 설정)
  const vsInst = VirtualSelect.init({
    ele: el,
    placeholder: "거래처명을 검색하세요...",
    search: true,
    clearButton: true,
    autoSelectFirstOption: false,
    value: "",
    onServerSearch: debounce(async (searchValue, virtualSelectInstance) => {
      await fetchAndSetProductOptions(searchValue, virtualSelectInstance);
    }, 300)
  });


  vsInst.$ele.addEventListener('change', async (e) => {
	
	
	 const prdCd = vsInst.getValue();
	 
	 selectProductCd = prdCd;

	 if (prdCd && prdCd.trim()) {
	   // 실제 코드가 있을 때만 재고 조회
	   isSelectProduct = true;
	 } else {
	   // clear(빈값)이면 false 세팅
	   isSelectProduct = false;
	 }
	 await getStockCount(prdCd);  
	 updateInputState();
	  
    });
	
	
	
  // 3) DOM에 인스턴스 저장
  el.virtualSelectInstance = vsInst;

  // 4) input 이벤트 (전역 변수 갱신)
  const inputEl = document.getElementById(vsInst.$searchInput.id);
  inputEl.addEventListener('input', e => {
    VirtualSelectClientInput = e.target.value;
    console.log('현재 입력값:', VirtualSelectClientInput);
  });

  // 5) ▶️ 초기 데이터 한 번 로드
  await fetchAndSetProductOptions("", vsInst);

}


// 서버 호출 + 옵션 세팅을 분리한 헬퍼 함수
async function fetchAndSetProductOptions(searchValue, virtualSelectInstance) {
  const params = new URLSearchParams();
  params.append('page', currentPage);
  params.append('pageSize', pageSize);
  if (searchValue && searchValue.trim()) {
    params.append('searchKeyword', searchValue.trim());
  }
  
  const url = `/solex/orders/products?${params.toString()}`; // 상품 데이터를 가져오는 URL로 변경

  try {
    const resp = await fetch(url, { headers: { 'Accept': 'application/json' } });
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const json = await resp.json();

    // json이 배열이라 가정
    const options = json.map(item => ({
		label: item.PRD_NM, // 상품명으로 변경
        value: item.PRD_CD // 상품 코드로 변경 (또는 상품명)
    }));
    // hasMore 정보가 들어있지 않다면, (json.length === pageSize) 등으로 대체하세요
    const hasMore = Array.isArray(json) && json.length === pageSize;

    virtualSelectInstance.setServerOptions(options, hasMore);
  } catch (err) {
    console.error('거래처 초기/검색 오류:', err);
    virtualSelectInstance.setServerOptions([], false);
  }
}

// 서버 호출
async function getStockCount(productCode) {
	const stockEl = document.getElementById("stockCount");
	const isEmpty = !productCode || !productCode.trim();

	// 1) 상품 선택 여부 플래그
	isSelectProduct = !isEmpty;
	updateInputState();

	// 2) 빈값이면 재고 표시 초기화하고 끝
	if (isEmpty) {
	  if (stockEl) stockEl.textContent = "";
	  return;
	}
	 
	 
	 
    // 2) URLSearchParams 로 안전하게 쿼리 생성
    const params = new URLSearchParams({ productCode: productCode.trim() });
    const url = `/solex/orders/stock?${params.toString()}`;

	try {
	   const resp = await fetch(url, { headers: { 'Accept': 'application/json' } });
	   if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
	   const json = await resp.json();
       if (stockEl) {
         stockEl.textContent = `(재고 ${json.stockCount}개)`;
		 stockEl.style.display =  "flex";
       }
	   
	 } catch (err) {
	   console.error('getStockCount 오류:', err);
	   throw err;    // 상위 로직에서 처리하려면 다시 throw
	 }
}


// 서버 호출
async function getClientInfo(clientCode) {
	if (!clientCode || !clientCode.trim()) {
	    const elPhone     = document.getElementById('cli_phone');
	    const elMgrName   = document.getElementById('cli_mgr_name');
	    const elMgrPhone  = document.getElementById('cli_mgr_phone');

	    if (elPhone)    elPhone.value     = '';
	    if (elMgrName)  elMgrName.value   = '';
	    if (elMgrPhone) elMgrPhone.value  = '';
		
		isSelectClient = false;
	    
	    return;
	}
	  
    
    const url = `/solex/clients/${clientCode}`;

	try {
	   const resp = await fetch(url, { headers: { 'Accept': 'application/json' } });
	   if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
	   const json = await resp.json();
	   
	   // 입력값 세팅
       const elPhone     = document.getElementById('cli_phone');
       const elMgrName   = document.getElementById('cli_mgr_name');
       const elMgrPhone  = document.getElementById('cli_mgr_phone');

       if (elPhone)    elPhone.value     = json.data.CLI_PHONE     || '';
       if (elMgrName)  elMgrName.value   = json.data.CLI_MGR_NAME  || '';
       if (elMgrPhone) elMgrPhone.value  = json.data.CLI_MGR_PHONE || '';
	   
	 } catch (err) {
	   console.error('getStockCount 오류:', err);
	   throw err;    // 상위 로직에서 처리하려면 다시 throw
	 }
}

// 우편번호 찾기 (Daum Postcode API)
function findPostCode() {
	new daum.Postcode({
        oncomplete: function(data) {
        	// 우편번호
            $("#cli_pc").val(data.zonecode);
            // 도로명 및 지번주소
            $("#cli_add").val(data.roadAddress);
        }
    }).open();
}

function updateInputState() {
  const shouldEnable = isSelectProduct && isSelectClient;
  ['odd_cnt','odd_end_date','odd_pay','odd_pay_date'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.disabled = !shouldEnable;
  });
}
// 3) initOddEndDate: 오직 min/value 세팅만
function initOddEndDate() {
  const endDateEl = document.getElementById('odd_end_date');
  const payDateEl = document.getElementById('odd_pay_date');
  if (!endDateEl || !payDateEl) return;

  const today    = new Date();
  const yyyy     = today.getFullYear();
  const mm       = String(today.getMonth()+1).padStart(2,'0');
  const dd       = String(today.getDate()).padStart(2,'0');
  const todayStr = `${yyyy}-${mm}-${dd}`;

  [endDateEl, payDateEl].forEach(el => {
    el.min   = todayStr;
    el.value = todayStr;
  });
}



function formatWithComma(str) {
  return str.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// 2) 숫자 전용 입력 + 0 이하 차단 + 콤마 포맷터
function attachNumericFormatter(id) {
  const el = document.getElementById(id);
  if (!el) return;

  el.addEventListener('focus', e => {
    e.target.value = e.target.value.replace(/,/g, '');
  });

  el.addEventListener('input', e => {
    let v = e.target.value.replace(/[^0-9]/g, '');
    e.target.value = v;
  });

  el.addEventListener('blur', e => {
    let v = e.target.value.replace(/,/g, '');
    let n = parseInt(v, 10);
    if (isNaN(n) || n < 0) n = 0;
    e.target.value = formatWithComma(String(n));    // ← formatWithComma 호출
  });
}

function onEndDateChange(e) {
  console.log('선택한 납품 요청일:', e.target.value);
}
function onPayDateChange(e) {
  console.log('선택한 결제 요청일:', e.target.value);
}



function validateOrderForm() {
  // 1) 거래처·상품
  if (!isSelectClient) {
    alert('거래처를 선택해주세요.');
    return false;
  }
  if (!isSelectProduct) {
    alert('상품을 선택해주세요.');
    return false;
  }

  // 2) 주문 수량
  const cntEl  = document.getElementById('odd_cnt');
  const cntVal = cntEl?.value.replace(/,/g,'') || '';
  const cntNum = parseInt(cntVal, 10);
  if (!cntVal) {
    alert('주문 수량을 입력해주세요.');
    return false;
  }
  if (isNaN(cntNum) || cntNum <= 0) {
    alert('주문 수량은 1 이상이어야 합니다.');
    return false;
  }

  // 3) 결제 금액
  const payEl   = document.getElementById('odd_pay');
  const payVal  = payEl?.value.replace(/,/g,'') || '';
  const payNum  = parseInt(payVal, 10);
  if (!payVal) {
    alert('결제 금액을 입력해주세요.');
    return false;
  }
  if (isNaN(payNum) || payNum <= 0) {
    alert('결제 금액은 1 이상이어야 합니다.');
    return false;
  }
  // 4) 날짜 값 가져오기
   const endDateStr = document.getElementById('odd_end_date')?.value || '';
   const payDateStr = document.getElementById('odd_pay_date')?.value || '';
  // 4) 납품 요청일
  if (!endDateStr) {
    alert('납품 요청일을 선택해주세요.');
    return false;
  }

  // 5) 결제 요청일
  if (!payDateStr) {
    alert('결제 요청일을 선택해주세요.');
    return false;
  }

  // 6) 날짜 순서 검증 (선택사항)
  if (endDateStr < payDateStr) {
    alert('납품 요청일은 결제 요청일 이후여야 합니다.');
    return false;
  }
  
  // 5) 오늘 날짜 체크용
    const validateToday = new Date();
    validateToday.setHours(0,0,0,0);

    const endDate = new Date(endDateStr);
    const payDate = new Date(payDateStr);

    // 6) 과거일 입력 방지
    if (endDate < validateToday) {
      alert('납품 요청일은 오늘 날짜 이후로 선택해야 합니다.');
      return false;
    }
    if (payDate < validateToday) {
      alert('결제 요청일은 오늘 날짜 이후로 선택해야 합니다.');
      return false;
    }
  
  // 2) 우편번호
  const postCodeEl = document.getElementById('cli_pc');
  const postCode   = postCodeEl?.value.trim() || '';
  if (!postCode) {
    alert('배송지를 입력해주세요.');
    return false;
  }
  
 const postDetailEl = document.getElementById("cli_da");
 const postDetail   = postDetailEl?.value.trim() || '';
 if (!postDetail) {
     alert('배송지의 상세 주소를 입력해주세요.');
     return false;
   }
  

  // 모든 검증 통과
  return true;
}



async function submitForm() {
  if (!validateOrderForm()) {
    return;
  }

  console.log('✅ 검증 통과! 서버로 전송합니다.');

  // 3) 주문 수량
  const cntRaw   = document.getElementById('odd_cnt')?.value.replace(/,/g, '') || '0';
  const orderCnt = parseInt(cntRaw, 10);

  // 4) 결제 금액
  const payRaw  = document.getElementById('odd_pay')?.value.replace(/,/g, '') || '0';
  const payAmt  = parseInt(payRaw, 10);

  // 5) 납품 요청일
  const deliverDate = document.getElementById('odd_end_date')?.value || '';

  // 6) 결제 요청일
  const payDate     = document.getElementById('odd_pay_date')?.value || '';

  // 7) 우편번호
  const postCode    = document.getElementById('cli_pc')?.value.trim() || '';
  
  // 7-1) 우편번호
  const postAdd    = document.getElementById('cli_add')?.value.trim() || '';

  // 8) 상세주소
  const postDetail  = document.getElementById('cli_da')?.value.trim() || '';

  const formData = {
	selectClientCd,
    selectProductCd,
    orderCnt,
    payAmt,
    deliverDate,
    payDate,
    postCode,
	postAdd,
    postDetail
  };

  console.log('▶️ 전송할 데이터:', formData);
  
  // --- 에러 핸들링 및 fetch 로직 ---
  try {
      const response = await fetch('/solex/orders', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json'
          },
          body: JSON.stringify(formData)
      });

      // HTTP 상태 코드가 200-299 범위가 아닐 경우 에러로 처리
      if (!response.ok) {
          // 서버가 에러 메시지를 JSON 형태로 보냈을 경우를 대비
          const errorData = await response.json().catch(() => null);
          const errorMessage = errorData?.message || `서버에 문제가 발생했습니다. (상태: ${response.status})`;
          throw new Error(errorMessage);
      }

      // 응답 본문을 JSON으로 파싱
      const data = await response.json();
      console.log('✅ 등록 완료 응답:', data);

      // 서버에서 받은 메시지를 alert 창으로 보여줌
      alert(data.message);

      // 서버 응답의 status가 'OK'일 경우에만 페이지를 새로고침
      if (data.status === 'OK') {
          location.reload();
      }

  } catch (error) {
      // 네트워크 에러 또는 위에서 발생시킨 에러를 처리
      console.error('⛔️ 등록 중 에러 발생:', error);
      alert(`오류가 발생했습니다: ${error.message}`);
  }

}

