// order.js

// 1. 전역 변수 설정
let currentPage = 0;
const pageSize = 20;
const gridHeight = 700;
let editorInstance = null;
let editorLoaded = false;

let searchKeyword = ''; // 그리드 필터링을 위한 거래처명 키워드
let productSearchKeyword = ''; // 그리드 필터링을 위한 상품명 키워드

let clientVirtualSelectInstance = null; // 거래처명 Virtual Select 인스턴스
let productVirtualSelectInstance = null; // 상품명 Virtual Select 인스턴스

// DB에서 받아올 원본 데이터를 보관할 배열
let allClients = [];
let allProducts = [];
let allGridData = []; // 그리드의 원본 데이터 (필터링 전)

// 2. ToastUI Grid 생성 (변경 없음)
const grid = new tui.Grid({
    el: document.getElementById('grid'),
    bodyHeight: gridHeight,
    scrollY: true,
    scrollX: false,
    data: [], // 초기 데이터는 비어있음
    columns: [
        { header: '상품 번호', name: 'rowNum', width: 100, sortable: true },
        { header: '상품명', name: 'notTt', width: 200, sortable: true },
        { header: '거래처 명', name: 'detNm', align: 'center', sortable: true },
        { header: '진행 상태', name: 'empNm', align: 'center', sortable: true },
        { header: '상태 변경일', name: 'notRegDate', align: 'center', sortable: true }
    ],
});

// 3. DOM 로드 후 실행될 코드
document.addEventListener('DOMContentLoaded', async function() { // async 키워드 추가

    // --- 3-1. 초기 데이터 로드 (DB에서 가져오는 시뮬레이션) ---
    // 실제 환경에서는 여기에 서버 API 호출 (fetch) 로직을 넣습니다.
    await loadInitialData(); // 데이터를 먼저 로드

    // --- 3-2. Virtual Select 초기화 및 데이터 바인딩 ---

    // 거래처명 Virtual Select 초기화
    const cliNmSelectElement = document.getElementById('cli_nm_virtual_select');
    if (cliNmSelectElement) {
        clientVirtualSelectInstance = VirtualSelect.init({
            ele: cliNmSelectElement,
            placeholder: "거래처명을 선택하거나 검색하세요...",
            search: true,
            silentSearch: true,
            allowNew: true,
            clearButton: true,
            options: allClients.map(client => ({ label: client.name, value: client.id })), // DB 데이터로 옵션 설정
            // Virtual Select의 search_server 옵션을 사용할 경우, 이 options 배열은 필요 없거나 초기값만 줍니다.
            // search_server를 사용할 경우, 이 부분은 비워두고 search_server 설정을 활성화해야 합니다.
            // search_server: { url: '/api/searchClients', data: (param) => ({ query: param.search }), /* ... */ }
        });

        // 거래처명 Virtual Select 값 변경 이벤트 처리
        cliNmSelectElement.addEventListener('vs:change', function(event) {
            const selectedLabel = event.detail.label || '';
            searchKeyword = selectedLabel;
            currentPage = 0;
            // 두 키워드를 모두 넘겨 그리드 데이터 필터링
            fetchGridData(currentPage, searchKeyword, productSearchKeyword);
            console.log('거래처명 선택:', selectedLabel, '(값:', event.detail.value + ')');
        });
    }

    // 상품명 Virtual Select 초기화
    const prdNmSelectElement = document.getElementById('prd_nm_virtual_select');
    if (prdNmSelectElement) {
        productVirtualSelectInstance = VirtualSelect.init({
            ele: prdNmSelectElement,
            placeholder: "상품명을 선택하거나 검색하세요...",
            search: true,
            silentSearch: true,
            allowNew: true,
            clearButton: true,
            options: allProducts.map(product => ({ label: product.name, value: product.id })), // DB 데이터로 옵션 설정
            // search_server를 사용할 경우, 이 부분은 비워두고 search_server 설정을 활성화해야 합니다.
            // search_server: { url: '/api/searchProducts', data: (param) => ({ query: param.search }), /* ... */ }
        });

        // 상품명 Virtual Select 값 변경 이벤트 처리
        prdNmSelectElement.addEventListener('vs:change', function(event) {
            const selectedLabel = event.detail.label || '';
            productSearchKeyword = selectedLabel;
            currentPage = 0;
            // 두 키워드를 모두 넘겨 그리드 데이터 필터링
            fetchGridData(currentPage, searchKeyword, productSearchKeyword);
            console.log('상품명 선택:', selectedLabel, '(값:', event.detail.value + ')');
        });
    }

    // 3-3. ToastUI Grid 초기 데이터 로딩
    // 초기 로드 시에는 저장된 모든 그리드 원본 데이터를 필터링 없이 표시
    fetchGridData();

}); // DOMContentLoaded 끝

// --- 4. 데이터 로딩 관련 함수들 ---

// DB에서 초기 데이터 (거래처, 상품, 그리드 데이터)를 비동기로 로드하는 함수
async function loadInitialData() {
    try {
        // 거래처 데이터 로드
        const clientResponse = await fetch('/api/clients'); // 실제 거래처 API 엔드포인트
        allClients = await clientResponse.json();
        console.log('로드된 거래처:', allClients);

        // 상품 데이터 로드
        const productResponse = await fetch('/api/products'); // 실제 상품 API 엔드포인트
        allProducts = await productResponse.json();
        console.log('로드된 상품:', allProducts);

        // 그리드에 표시될 모든 데이터 로드 (필터링 전 원본)
        const gridDataResponse = await fetch('/api/allGridData'); // 실제 그리드 전체 데이터 API 엔드포인트
        allGridData = await gridDataResponse.json();
        console.log('로드된 전체 그리드 데이터:', allGridData);

    } catch (error) {
        console.error('초기 데이터 로드 중 오류 발생:', error);
        // 사용자에게 오류 메시지를 표시하거나 대체 동작 수행
    }
}

// 그리드 데이터 필터링 및 업데이트 함수
function fetchGridData(page = currentPage, clientKw = searchKeyword, productKw = productSearchKeyword) {
    console.log(`그리드 데이터 필터링: 페이지 ${page}, 거래처: "${clientKw}", 상품명: "${productKw}"`);

    // 1. 클라이언트 측 필터링 (간단한 예시)
    // 서버에서 필터링된 데이터를 받아오는 것이 더 효율적일 수 있습니다 (아래 주석 처리된 fetch 예시).
    let filteredData = allGridData.filter(item => {
        const clientMatch = clientKw ? item.detNm.includes(clientKw) : true;
        const productMatch = productKw ? item.notTt.includes(productKw) : true;
        return clientMatch && productMatch;
    });

    grid.resetData(filteredData);

    // 2. 서버 측 필터링 (더 권장되는 방식, 특히 데이터가 많을 때)
    /*
    const url = `/api/gridData?page=${page}&pageSize=${pageSize}&client=${encodeURIComponent(clientKw)}&product=${encodeURIComponent(productKw)}`;
    fetch(url)
        .then(response => {
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return response.json();
        })
        .then(data => {
            grid.resetData(data.data); // 서버에서 필터링된 데이터로 그리드 업데이트
            // currentPage = page; // 페이지네이션 로직 필요
        })
        .catch(error => {
            console.error('그리드 데이터 로딩 중 오류 발생:', error);
        });
    */
}

// 기타 함수들 (필요하다면 여기에 추가)
// ...