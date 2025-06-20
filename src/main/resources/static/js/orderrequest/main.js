// order.js

let currentPage = 0;
const pageSize = 20;
const gridHeight = 600;
let isLoading = false; // 데이터 로딩 중인지 여부 (중복 요청 방지)
let hasMoreData = true; // 더 불러올 데이터가 있는지 여부 (무한 스크롤 종료 조건)




// 2. ToastUI Grid 생성 (변경 없음)
const grid = new tui.Grid({
    el: document.getElementById('grid'),
    bodyHeight: gridHeight,
    scrollY: true,
    scrollX: false,
    data: [], // 초기 데이터는 비어있음
    columns: [
        { header: '수주 번호', name: 'ORD_ID', width: 100,align: 'center', sortable: true },
        { header: '거래처', name: 'CLI_NM', align: 'center', sortable: true },
        { header: '제품명', name: 'PRD_NM', width: 200, align: 'center', sortable: true },
        { header: '컬러', name: 'OPT_COLOR', width: 80, align: 'center', sortable: true },
        { header: '사이즈', name: 'OPT_SIZE', width: 80, align: 'center', sortable: true },
        { header: '높이', name: 'OPT_HEIGHT', width: 80, align: 'center', sortable: true },
        { header: '주문 수량', name: 'ORD_CNT', align: 'center', sortable: true },
        { header: '진행 현황', name: 'DET_NM', align: 'center', sortable: true },
        { header: '원자재 재고 여부', name: 'PRODUCTION_STATUS', align: 'center', sortable: true },
        { header: '납품 요청일', name: 'ORD_END_DATE', align: 'center', sortable: true }
    ],
});

// 3. DOM 로드 후 실행될 코드
document.addEventListener('DOMContentLoaded', async function() { // async 키워드 추가
	
	
	// 초기 그리드 데이터 로드 (페이지 로드 시)
	fetchGridData(currentPage); // 초기 페이지와 (비어있는) 검색어 전달
	
	// 무한 스크롤 이벤트 리스너 추가
	grid.on('scrollEnd', async ({ horz, vert }) => {
    if (vert.isReachedBottom) { // 스크롤이 그리드 바닥에 도달했을 때
      if (hasMoreData && !isLoading) { // 더 불러올 데이터가 있고, 현재 로딩 중이 아닐 때
        currentPage++; // 다음 페이지 번호로 업데이트
        await fetchGridData(currentPage); // 다음 페이지 데이터 로드
      }
    }
	});
  
	grid.on('click', (ev) => {
    // 컬럼 id를 선택을 하여 모달을 띄운다.
		if (ev.columnName === 'DET_NM') {
			const rowData = grid.getRow(ev.rowKey);
			const order_id = rowData.ORD_ID;
      console.log(order_id);  
      const selectedId = order_id;
      DetailModal(selectedId);
		}
	});

	
	
	// --- 주문 등록 모달 관련 요소 및 이벤트 리스너 ---
  const myModalElement = document.getElementById('myModal'); // Bootstrap 모달 컨테이너 ID


  if (myModalElement) {
    myModalElement.addEventListener('shown.bs.modal', () => {
    
    });
  
    myModalElement.addEventListener('hidden.bs.modal', () => {
      
    });
  }


});


// 초기 grid 테이블에 들어갈 list
async function fetchGridData(page = currentPage) {

  isLoading = true; // 로딩 중 플래그 설정 (전역 변수)
  try {
    const params = new URLSearchParams();
    params.append('page', currentPage);
    params.append('pageSize', pageSize);
    
    const url = `/SOLEX/order-request/data?${params.toString()}`; 

    
    const response = await fetch(url);

    // 2. 응답 상태 확인
    if (!response.ok) { // HTTP 상태 코드가 200-299 범위가 아니면 오류
        throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`);
    }
    
    // 3. 응답 데이터를 JSON으로 파싱
    const data = await response.json();
    console.log(data);
    
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




async function DetailModal(selectedId) {
  const url = `/SOLEX/order-requests/${selectedId}`;


  const response = await fetch(url);

  // 2. 응답 상태 확인
  if (!response.ok) { // HTTP 상태 코드가 200-299 범위가 아니면 오류
      throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`);
  }
  
  // 3. 응답 데이터를 JSON으로 파싱
  const data = await response.json();

  console.log(data);


  const modal = document.getElementById('myModal');
  const modalInstance = new bootstrap.Modal(modal);
  modalInstance.show();

}
