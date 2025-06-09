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



// 2. ToastUI Grid 생성 (변경 없음)
const grid = new tui.Grid({
    el: document.getElementById('grid'),
    bodyHeight: gridHeight,
    scrollY: true,
    scrollX: false,
    data: [], // 초기 데이터는 비어있음
    columns: [
        { header: '상품 코드', name: 'PRD_CD', width: 100, sortable: true },
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
	
	// --- 주문 등록 모달 관련 요소 및 이벤트 리스너 ---
    const openOrderModalBtn = document.getElementById('openOrderModalBtn'); // '주문 등록' 버튼
    const myModalElement = document.getElementById('myModal'); // Bootstrap 모달 컨테이너 ID

	// Bootstrap 모달 인스턴스 초기화
    let orderRegisterModalInstance = null; // 전역 변수로 선언하여 다른 함수에서도 사용 가능하게 함
    if (myModalElement) {
        orderRegisterModalInstance = new bootstrap.Modal(myModalElement);
    }

    if (openOrderModalBtn) {
        openOrderModalBtn.addEventListener('click', async function() {
            if (orderRegisterModalInstance) {
                orderRegisterModalInstance.show(); // Bootstrap 모달 열기
            }
            await loadClientDataForModal(); // 모달 데이터 로드
//            await loadProductDataForModal(); // 모달 데이터 로드
        });
    }


}); // DOMContentLoaded 끝

// 초기 grid 테이블에 들어갈 list
async function fetchGridData(page = currentPage, currentSearchKw = searchKeyword) {
    if (isLoading) return;
    isLoading = true; // 로딩 시작 플래그 설정 (전역 변수)

    console.log(`그리드 데이터 요청: 페이지 ${page}, 개수 ${pageSize}, 검색어: "${currentSearchKw}"`);

    try {
        const params = new URLSearchParams();
        params.append('page', page);
        params.append('pageSize', pageSize);

        if (currentSearchKw) { // 검색어가 비어있지 않다면 (null, '', undefined, ' ') 포함
            params.append('searchKeyword', currentSearchKw); 
        }
        
        const url = `/solex/orders/gridData?${params.toString()}`; 
		
		console.log(url);
        
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
            console.log(`첫 페이지 로드 완료. 현재 그리드 행 수: ${grid.getRowCount()}`);
        } else { // 다음 페이지 요청 시 (무한 스크롤)
            grid.appendRows(data); // 기존 데이터에 새 데이터를 추가
            console.log(`페이지 ${page} 데이터 추가 완료. 현재 그리드 행 수: ${grid.getRowCount()}`);
        }

        // 5. 더 불러올 데이터가 있는지 판단 (무한 스크롤 종료 조건)
        // 서버에서 받아온 데이터의 개수가 요청한 pageSize보다 적으면 더 이상 데이터가 없다고 판단
        if (data.length < pageSize) {
            hasMoreData = false; // 더 이상 불러올 데이터 없음 플래그 설정 (전역 변수)
            console.log('더 이상 불러올 데이터가 없습니다. 무한 스크롤 종료.');
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
      await fetchAndSetOptions(searchValue, virtualSelectInstance);
    }, 300)
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
  await fetchAndSetOptions("", vsInst);


  console.log('Virtual Select 설정 및 초기 데이터 로드 완료');
}


// 서버 호출 + 옵션 세팅을 분리한 헬퍼 함수
async function fetchAndSetOptions(searchValue, virtualSelectInstance) {
  const page     = 0;
  const pageSize = 20;

  const params = new URLSearchParams();
  params.append('page', page);
  params.append('pageSize', pageSize);
  if (searchValue && searchValue.trim()) {
    params.append('searchKeyword', searchValue.trim());
  }
  
  const url = `/solex/orders/clients?${params.toString()}`;

  try {
    const resp = await fetch(url, { headers: { 'Accept': 'application/json' } });
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const json = await resp.json();
    console.log("초기/검색 로드 결과:", json);

    // json이 배열이라 가정
    const options = json.map(item => ({
      label: item.CLI_NM,
      value: item.CLI_NM
    }));
    // hasMore 정보가 들어있지 않다면, (json.length === pageSize) 등으로 대체하세요
    const hasMore = Array.isArray(json) && json.length === pageSize;

    virtualSelectInstance.setServerOptions(options, hasMore);
  } catch (err) {
    console.error('거래처 초기/검색 오류:', err);
    virtualSelectInstance.setServerOptions([], false);
  }
}