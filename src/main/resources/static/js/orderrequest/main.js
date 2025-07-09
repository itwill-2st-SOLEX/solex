// order.js

let currentPage = 0;
const pageSize = 100;
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
        { header: '수주 상세번호', name: 'ODD_ID', width: 100,align: 'center', sortable: true ,renderer: {
			     styles: {
			       color: '#007BFF',
			       textDecoration: 'underline',
			       cursor: 'pointer'
			     }
			   }},
        { header: '제품 코드', name: 'PRD_CODE', width: 100,align: 'center', sortable: true },
        { header: '회사명', name: 'CLI_NM', align: 'center', sortable: true },
        { header: '제품명', name: 'PRD_NM', width: 200, align: 'center', sortable: true },
        { header: '컬러', name: 'OPT_COLOR', width: 80, align: 'center', sortable: true },
        { header: '사이즈', name: 'OPT_SIZE', width: 80, align: 'center', sortable: true },
        { header: '굽', name: 'OPT_HEIGHT', width: 80, align: 'center', sortable: true },
        { header: '주문 수량', name: 'ODD_CNT', align: 'center', sortable: true },
        { header: '진행 현황', name: 'DET_NM', align: 'center', sortable: true },
        { header: '원자재 재고 여부', name: 'PRODUCTION_STATUS', align: 'center', width: 200, sortable: true },
        { header: '납품 요청일', name: 'ORD_END_DATE', align: 'center', sortable: true }
    ],
});

// 3. DOM 로드 후 실행될 코드
document.addEventListener('DOMContentLoaded', async function() { // async 키워드 추가
	
	
	// 초기 그리드 데이터 로드 (페이지 로드 시)
	fetchGridData(currentPage); // 초기 페이지와 (비어있는) 검색어 전달
	
	// 무한 스크롤 이벤트 리스너 추가
	// grid.on('scrollEnd', async ({ horz, vert }) => {
  //   if (vert.isReachedBottom) { // 스크롤이 그리드 바닥에 도달했을 때
  //     if (hasMoreData && !isLoading) { // 더 불러올 데이터가 있고, 현재 로딩 중이 아닐 때
  //       currentPage++; // 다음 페이지 번호로 업데이트
  //       await fetchGridData(currentPage); // 다음 페이지 데이터 로드
  //     }
  //   }
	// });
  
	// grid.on('click', (ev) => {
  //   // 컬럼 id를 선택을 하여 모달을 띄운다.
	// 	if (ev.columnName === 'DET_NM') {
  //     const rowData = grid.getRow(ev.rowKey);
  //     DetailModal(rowData.ODD_ID);
	// 	}
	// });

  const gridContainer = document.getElementById('grid'); // TUI Grid를 감싸는 div의 ID
  gridContainer.addEventListener('click', async function(e) {
    const target = e.target;
    if (target.classList.contains('assign-btn')) {
      e.stopPropagation();
      
      const oddId = target.dataset.ordId;
      const action = target.dataset.action; // data-action 값을 가져옴
      
      const result = await checkMaterial(oddId);
      if(!result) {
        alert('자재가 창고에 등록되어 있지 않습니다.');
        return;
      }

      if (action === 'instruct') {
          // 작업 지시용 모달 열기
          openWorkInstructionModal(oddId);
      } else if (action === 'request') {
          // 자재 요청용 모달 열기
          openMaterialRequestModal(oddId);
      } else if (action === 'materialRequest') {
          // 자재 요청 완료
          openMaterialRequestCompleteModal(oddId);
      }
    }
  });

});

// 초기 grid 테이블에 들어갈 list
async function fetchGridData(page = currentPage) {

  isLoading = true; // 로딩 중 플래그 설정 (전역 변수)
  try {
    const params = new URLSearchParams();
    params.append('page', currentPage);
    params.append('pageSize', pageSize);
    
    const url = `/SOLEX/order-requests/data?${params.toString()}`; 

    
    const response = await fetch(url);

    // 2. 응답 상태 확인
    if (!response.ok) { // HTTP 상태 코드가 200-299 범위가 아니면 오류
        throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`);
    }
    
    // 3. 응답 데이터를 JSON으로 파싱
    const data = await response.json();
    
    

    data.map((item) => {
      // 자재 요청일 경우 자재요청완료?
      if(item.PRODUCTION_STATUS == '생산 가능') {
        // data-action="instruct" 추가
        if(item.ODD_STS == 'odd_sts_01') {
          item.PRODUCTION_STATUS = `<button class="btn btn-sm custom-btn-blue assign-btn" data-action="instruct" data-ord-id="${item.ODD_ID}">작업 지시(자재 요청 완료)</button>`;
        } else {
          item.PRODUCTION_STATUS = `<button class="btn btn-sm custom-btn-blue assign-btn" data-action="instruct" data-ord-id="${item.ODD_ID}">작업 지시</button>`;
        }
      } else if(item.ODD_STS == 'odd_sts_01') {
        item.PRODUCTION_STATUS = `<button class="btn btn-sm custom-btn-blue assign-btn" data-action="materialRequest" data-ord-id="${item.ODD_ID}">자재 요청 완료</button>`;
      } else {
        // data-action="request" 추가
        item.PRODUCTION_STATUS = `<button class="btn btn-sm btn-danger delete-btn assign-btn" data-action="request" data-ord-id="${item.ODD_ID}">자재 요청</button>`;
      }
    });
    

    
    // 4. 그리드 데이터 업데이트
    if (page === 0) { // 첫 페이지 요청 시 (새로운 검색 또는 초기 로드)
      grid.resetData(data); // 기존 데이터를 모두 지우고 새 데이터로 채움
    } else { // 다음 페이지 요청 시 (무한 스크롤)
      grid.appendRows(data); // 기존 데이터에 새 데이터를 추가
    }

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


// 자재가 창고에 등록이 안 되어 있으면 오류가 발생함
async function checkMaterial(selectedId) {
  try {
    const res = await fetch(`/SOLEX/order-requests/check-material`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        odd_id: selectedId
      })
    });

    if (!res.ok) {
      const errorMessage = await res.text();
      throw new Error(errorMessage);
    }

    return true; // 모든 재료가 성공적으로 확인되었을 때 true 반환

  } catch (err) {
    console.error('자재 확인 중 오류 발생:', err);
    return false; // 오류 발생 시 false 반환
  }
}



async function openWorkInstructionModal(selectedId) {
  const url = `/SOLEX/order-requests/${selectedId}`;
  const response = await fetch(url);

  // 2. 응답 상태 확인
  if (!response.ok) { // HTTP 상태 코드가 200-299 범위가 아니면 오류
    throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`);
  }
  // 3. 응답 데이터를 JSON으로 파싱
  const data = await response.json();

  const commonInfo = data[0];
  // id와 데이터의 key가 일치하는 공통 정보 필드에 값을 한 번만 설정
  document.getElementById('CLI_NM').value = commonInfo.CLI_NM;
  document.getElementById('PRD_NM').value = commonInfo.PRD_NM;
  document.getElementById('OPT_COLOR').value = commonInfo.OPT_COLOR;
  document.getElementById('OPT_SIZE').value = commonInfo.OPT_SIZE;
  document.getElementById('STK_CNT').value = commonInfo.STK_CNT;
  document.getElementById('OPT_HEIGHT').value = commonInfo.OPT_HEIGHT;
  document.getElementById('ODD_CNT').value = commonInfo.ODD_CNT;
  document.getElementById('ORD_END_DATE').value = commonInfo.ORD_END_DATE;
  
  const textArea = document.getElementById('MATERIAL_CNT');
  const htmlLines = data.map(material => {
    // 상태에 따라 글자색을 다르게 하기 위한 클래스 변수
    const statusClass = material.STK_MATERIAL_STATUS.includes('부족') ? 'text-danger' : 'text-success';
    // 불량율 계산 10%
    const finalRequiredCnt = Math.ceil(material.TOTAL_BOM_CNT * 1.05); // 소수점이 나올 수 있으므로 올림(ceil) 처리
	
	  const shortageCnt = finalRequiredCnt - material.STK_MATERIAL_CNT;
    // 각 자재 정보를 div로 감싸서 간격을 줍니다.
    return `
      <div style="margin-bottom: 10px;">
        <strong>${material.MAT_NM}</strong>
        <div style="padding-left: 15px;">
          - 단위당 필요 갯수 : ${material.BOM_CNT}개
          <br>
          - 총 필요 갯수(+불량율 5%) : ${finalRequiredCnt}개
          <br>
          - 현 재고 : ${material.STK_MATERIAL_CNT}개
          <br>
          ${ shortageCnt > 0 ? `${shortageCnt}개 <strong class="text-danger">부족</strong>` : `<strong class="text-success">생산 가능</strong>` }
        </div>
      </div>
    `;
});

  textArea.innerHTML = htmlLines.join('\n');

  
  const oldBtn  = document.getElementById('submitBtn');
  // 1. 기존 버튼을 복제하여 이벤트 리스너를 모두 제거
  const newBtn = oldBtn.cloneNode(true); 
  // 2. 기존 버튼을 새로운 버튼으로 교체
  oldBtn.parentNode.replaceChild(newBtn, oldBtn);
  // 3. 이벤트가 없는 새 버튼에 클릭 이벤트를 등록
  newBtn.textContent = '작업 지시'; 
  newBtn.addEventListener('click', () => {
    submitForm(selectedId);
  });

  const oldBtn2  = document.getElementById('rejectBtn');
  // 1. 기존 버튼을 복제하여 이벤트 리스너를 모두 제거
  const newBtn2 = oldBtn2.cloneNode(true); 
  // 2. 기존 버튼을 새로운 버튼으로 교체
  oldBtn2.parentNode.replaceChild(newBtn2, oldBtn2);
  // 3. 이벤트가 없는 새 버튼에 클릭 이벤트를 등록
  newBtn2.textContent = '반려'; 
  newBtn2.addEventListener('click', () => {
    rejectForm(selectedId);
  });

  document.getElementById('submitBtn').style.display = 'block';
  document.getElementById('rejectBtn').style.display = 'block';
  


  const modal = document.getElementById('myModal');
  const modalInstance = new bootstrap.Modal(modal);
  modalInstance.show();

}

// rejectForm
async function rejectForm(selectedId) {
  try {
    const res = await fetch(`/SOLEX/order-requests/reject`, {
    method : 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      odd_id : selectedId
    })
  });

  if (!res.ok) {
    const errorMessage = await res.text(); 
    throw new Error(errorMessage); 
  }

  const successMessage = await res.text(); // "정상적으로 처리되었습니다."
  alert(successMessage + ' 🙌');
  window.location.reload(); // 페이지 새로고침

  } catch (err) {
    console.error('작업 처리 중 오류 발생:', err);
    alert(err.message);
  }
}

async function openMaterialRequestModal(selectedId) {
  const url = `/SOLEX/order-requests/${selectedId}`;
  const response = await fetch(url);

  // 2. 응답 상태 확인
  if (!response.ok) { // HTTP 상태 코드가 200-299 범위가 아니면 오류
    throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`);
  }
  // 3. 응답 데이터를 JSON으로 파싱
  const data = await response.json();

  const commonInfo = data[0];
  // id와 데이터의 key가 일치하는 공통 정보 필드에 값을 한 번만 설정
  document.getElementById('CLI_NM').value = commonInfo.CLI_NM;
  document.getElementById('PRD_NM').value = commonInfo.PRD_NM;
  document.getElementById('OPT_COLOR').value = commonInfo.OPT_COLOR;
  document.getElementById('OPT_SIZE').value = commonInfo.OPT_SIZE;
  document.getElementById('STK_CNT').value = commonInfo.STK_CNT;
  document.getElementById('OPT_HEIGHT').value = commonInfo.OPT_HEIGHT;
  document.getElementById('ODD_CNT').value = commonInfo.ODD_CNT;
  document.getElementById('ORD_END_DATE').value = commonInfo.ORD_END_DATE;
  
  const textArea = document.getElementById('MATERIAL_CNT');
  const htmlLines = data.map(material => {
    // 상태에 따라 글자색을 다르게 하기 위한 클래스 변수
    const statusClass = material.STK_MATERIAL_STATUS.includes('부족') ? 'text-danger' : 'text-success';
    // 불량율 계산 5%
    const finalRequiredCnt = Math.ceil(material.TOTAL_BOM_CNT * 1.05); // 소수점이 나올 수 있으므로 올림(ceil) 처리
    // 부족 갯수 계산
    const shortageCnt = finalRequiredCnt - material.STK_MATERIAL_CNT;

    // 각 자재 정보를 div로 감싸서 간격을 줍니다.
    return `
      <div style="margin-bottom: 10px;">
        <strong>${material.MAT_NM}</strong>
        <div style="padding-left: 15px;">
          - 단위당 필요 갯수 : ${material.BOM_CNT}개
          <br>
          - 총 필요 갯수(+불량율 5%) : ${finalRequiredCnt}개
          <br>
          - 현 재고 : ${material.STK_MATERIAL_CNT}개
          <br>
          ${ shortageCnt > 0 ? `${shortageCnt}개 <strong class="text-danger">부족</strong>` : `<strong class="text-success">생산 가능</strong>` }
        </div>
      </div>
    `;
});

  textArea.innerHTML = htmlLines.join('\n');
  document.getElementById('submitBtn').style.display = 'block';
  document.getElementById('rejectBtn').style.display = 'block';


  // 자재 요청
  const oldBtn  = document.getElementById('submitBtn');  
  // 1. 기존 버튼을 복제하여 이벤트 리스너를 모두 제거
  const newBtn = oldBtn.cloneNode(true); 
  // 2. 기존 버튼을 새로운 버튼으로 교체
  oldBtn.parentNode.replaceChild(newBtn, oldBtn);
  // 3. 이벤트가 없는 새 버튼에 클릭 이벤트를 등록

  newBtn.textContent = '자재 요청'; 
  newBtn.addEventListener('click', () => {
    submitMaterialRequestForm(selectedId);
  });

  // 반려
  const oldBtn2  = document.getElementById('rejectBtn');  
  // 1. 기존 버튼을 복제하여 이벤트 리스너를 모두 제거
  const newBtn2 = oldBtn2.cloneNode(true); 
  // 2. 기존 버튼을 새로운 버튼으로 교체
  oldBtn2.parentNode.replaceChild(newBtn2, oldBtn2);
  // 3. 이벤트가 없는 새 버튼에 클릭 이벤트를 등록

  newBtn2.textContent = '반려'; 
  newBtn2.addEventListener('click', () => {
    rejectForm(selectedId);
  });




  const modal = document.getElementById('myModal');
  const modalInstance = new bootstrap.Modal(modal);
  modalInstance.show();

}


async function openMaterialRequestCompleteModal(selectedId) {
  const url = `/SOLEX/order-requests/${selectedId}`;
  const response = await fetch(url);

  // 2. 응답 상태 확인
  if (!response.ok) { // HTTP 상태 코드가 200-299 범위가 아니면 오류
    throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`);
  }
  // 3. 응답 데이터를 JSON으로 파싱
  const data = await response.json();

  const commonInfo = data[0];
  // id와 데이터의 key가 일치하는 공통 정보 필드에 값을 한 번만 설정
  document.getElementById('CLI_NM').value = commonInfo.CLI_NM;
  document.getElementById('PRD_NM').value = commonInfo.PRD_NM;
  document.getElementById('OPT_COLOR').value = commonInfo.OPT_COLOR;
  document.getElementById('OPT_SIZE').value = commonInfo.OPT_SIZE;
  document.getElementById('STK_CNT').value = commonInfo.STK_CNT;
  document.getElementById('OPT_HEIGHT').value = commonInfo.OPT_HEIGHT;
  document.getElementById('ODD_CNT').value = commonInfo.ODD_CNT;
  document.getElementById('ORD_END_DATE').value = commonInfo.ORD_END_DATE;
  
  const textArea = document.getElementById('MATERIAL_CNT');
  const htmlLines = data.map(material => {
    // 상태에 따라 글자색을 다르게 하기 위한 클래스 변수
    const statusClass = material.STK_MATERIAL_STATUS.includes('부족') ? 'text-danger' : 'text-success';
    // 불량율 계산 5%
    const finalRequiredCnt = Math.ceil(material.TOTAL_BOM_CNT * 1.05); // 소수점이 나올 수 있으므로 올림(ceil) 처리
    // 부족 갯수 계산
    const shortageCnt = finalRequiredCnt - material.STK_MATERIAL_CNT;

    // 각 자재 정보를 div로 감싸서 간격을 줍니다.
    return `
      <div style="margin-bottom: 10px;">
        <strong>${material.MAT_NM}</strong>
        <div style="padding-left: 15px;">
          - 단위당 필요 갯수 : ${material.BOM_CNT}개
          <br>
          - 총 필요 갯수(+불량율 5%) : ${finalRequiredCnt}개
          <br>
          - 현 재고 : ${material.STK_MATERIAL_CNT}개
          <br>
          ${ shortageCnt > 0 ? `${shortageCnt}개 <strong class="text-danger">부족</strong>` : `<strong class="text-success">생산 가능</strong>` }
        </div>
      </div>
    `;
});

  textArea.innerHTML = htmlLines.join('\n');

  // TODO: 자재 요청 완료 모달
  // 승인 반려 버튼 안보이게
  document.getElementById('submitBtn').style.display = 'none';
  document.getElementById('rejectBtn').style.display = 'none';



  const modal = document.getElementById('myModal');
  const modalInstance = new bootstrap.Modal(modal);
  modalInstance.show();

}


async function submitForm(selectedId) {
  try {
    const res = await fetch(`/SOLEX/order-requests`, {
    method : 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      odd_id : selectedId
    })
  });

  if (!res.ok) {
    const errorMessage = await res.text(); 
    throw new Error(errorMessage); 
  }

  const successMessage = await res.text(); // "정상적으로 처리되었습니다."
  alert(successMessage + ' 🙌');
  window.location.reload(); // 페이지 새로고침

  } catch (err) {
  console.error('작업 처리 중 오류 발생:', err);
  alert(err.message);
  }
}


async function submitMaterialRequestForm(selectedId) {
  try {
    const res = await fetch(`/SOLEX/order-requests/material-request`, {
    method : 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      odd_id : selectedId
    })
  });

  if (!res.ok) {
    const errorMessage = await res.text(); 
    throw new Error(errorMessage); 
  }

  const successMessage = await res.text(); // "정상적으로 처리되었습니다."
  alert(successMessage + ' 🙌');
  window.location.reload(); // 페이지 새로고침

  } catch (err) {
    console.error('자재 요청 중 오류 발생:', err);
    alert(err.message);
  }
}
