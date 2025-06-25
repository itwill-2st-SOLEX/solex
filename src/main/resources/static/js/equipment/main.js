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
        { header: '설비 코드', name: 'EQP_CODE', width: 150,align: 'center', sortable: true },
        { header: '제조사', name: 'CLI_NM', align: 'center', sortable: true },
        { header: '공정 명', name: 'PRC_NM', width: 150,align: 'center', sortable: true },
        { header: '설비 명', name: 'EQP_NAME', align: 'center', sortable: true },
        { header: '설비 가격', name: 'EQP_PRICE', width: 100, align: 'center', sortable: true },
        { header: '구입일', name: 'EQP_PURCHASE_DATE', width: 100, align: 'center', sortable: true },
        { header: '설치일', name: 'EQP_INSTALLATION_DATE', width: 100, align: 'center', sortable: true },
        { header: '사용여부', name: 'EQP_STS', width: 80, align: 'center', sortable: true }
    ],
});

// 3. DOM 로드 후 실행될 코드
document.addEventListener('DOMContentLoaded', async function() { // async 키워드 추가
  // 날짜 데이터로드
	setupLinkedDateInputs('EQP_PURCHASE_DATE', 'EQP_INSTALLATION_DATE');
	
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

  const openCreateEquipmentModalBtn = document.getElementById('openEquipmentModalBtn');
  openCreateEquipmentModalBtn.addEventListener('click', openCreateEquipmentModal);
  
  // 숫자 포맷팅팅
  const eqpPriceInput = document.getElementById('EQP_PRICE');
   eqpPriceInput.addEventListener('input', handlePriceInput);



   // 폼 제출
   const submitBtn = document.getElementById('submitBtn');
   submitBtn.addEventListener('click', submitForm);
});

// 초기 grid 테이블에 들어갈 list
async function fetchGridData(page = currentPage) {

  isLoading = true; // 로딩 중 플래그 설정 (전역 변수)
  try {
    const params = new URLSearchParams();
    params.append('page', currentPage);
    params.append('pageSize', pageSize);
    
    const url = `/SOLEX/equipment/data?${params.toString()}`; 

    
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

async function openCreateEquipmentModal() {
  const url = `/SOLEX/equipment/form-data`;
  const response = await fetch(url);

  // 2. 응답 상태 확인
  if (!response.ok) { // HTTP 상태 코드가 200-299 범위가 아니면 오류
    throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`);
  }
  // 3. 응답 데이터를 JSON으로 파싱
  const data = await response.json();
  console.log(data);

  // 4. 분리해둔 공통 함수를 '호출'하여 select 박스 채우기
  populateSelect('CLI_NM', data.clientList, 'CLI_ID', 'CLI_NM');
  populateSelect('PRC_NM', data.processList, 'PRC_ID', 'PRC_NM');

  const modal = document.getElementById('myModal');
  const modalInstance = new bootstrap.Modal(modal);
  modalInstance.show();
} 

async function openUpdateEquipmentModal(selectedId) {
  const url = `/SOLEX/order-requests/${selectedId}`;
  const response = await fetch(url);

  // 2. 응답 상태 확인
  if (!response.ok) { // HTTP 상태 코드가 200-299 범위가 아니면 오류
    throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`);
  }
  // 3. 응답 데이터를 JSON으로 파싱
  const data = await response.json();

  console.log(data);
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
    const finalRequiredCnt = Math.ceil(material.TOTAL_BOM_CNT * 1.1); // 소수점이 나올 수 있으므로 올림(ceil) 처리
    // 각 자재 정보를 div로 감싸서 간격을 줍니다.
    return `
        <div style="margin-bottom: 10px;">
            <strong>${material.MAT_NM}</strong>
            <div style="padding-left: 15px;">
                - 단위당 필요 갯수 : ${material.BOM_CNT}, 
                총 필요 갯수(+불량율 10%) : ${finalRequiredCnt}, 
                현 재고 : ${material.STK_MATERIAL_CNT}개 
                <strong class="${statusClass}">${material.STK_MATERIAL_STATUS}</strong>
            </div>
        </div>
    `;
});

  textArea.innerHTML = htmlLines.join('\n');


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




  const modal = document.getElementById('myModal');
  const modalInstance = new bootstrap.Modal(modal);
  modalInstance.show();

}

// 거래처, 공정 select 채우는 함수
function populateSelect(selectId, list, valueKey, textKey) {
  const selectElement = document.getElementById(selectId);
  selectElement.innerHTML = ''; // 기존 옵션 초기화

  // 기본 옵션 추가
  const defaultOption = document.createElement('option');
  defaultOption.textContent = `- ${selectElement.parentElement.previousElementSibling.textContent}을(를) 선택해주세요 -`;
  defaultOption.value = '';
  defaultOption.selected = true;
  selectElement.appendChild(defaultOption);

  // 데이터 리스트로 옵션 채우기
  list.forEach(item => {
      const option = document.createElement('option');
      option.value = item[valueKey];
      option.textContent = item[textKey];
      selectElement.appendChild(option);
  });
}
// 날짜 포맷팅
function getFormattedDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// 구입일과 설치일을 연결하는 함수
function setupLinkedDateInputs(purchaseDateId, installationDateId) {
  const purchaseInput = document.getElementById(purchaseDateId);
  const installInput = document.getElementById(installationDateId);

  // 두 요소 중 하나라도 없으면 함수를 중단합니다.
  if (!purchaseInput || !installInput) {
      console.error('날짜 입력 요소를 찾을 수 없습니다.');
      return;
  }

  // 오늘 날짜를 기준으로 최소 날짜를 설정합니다.
  const todayString = getFormattedDate(new Date());
  purchaseInput.min = todayString;
  installInput.min = todayString;

  // 구입일 변경 시 설치일의 최소 날짜를 업데이트하는 이벤트 리스너
  purchaseInput.addEventListener('change', function() {
      if (this.value) {
          installInput.min = this.value;
          if (installInput.value && installInput.value < this.value) {
              installInput.value = '';
          }
      }
  });

  // 설치일 변경 시 구입일의 최대 날짜를 업데이트하는 이벤트 리스너
  installInput.addEventListener('change', function() {
      if (this.value) {
          purchaseInput.max = this.value;
      }
  });
}

// 가격 포맷팅
function handlePriceInput(event) {
  let value = event.target.value;
  const cleanValue = value.replace(/[^0-9]/g, '');
  if (cleanValue === '') {
    event.target.value = '';
    return;
  }
  const formattedValue = cleanValue.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  event.target.value = formattedValue;
}

// 폼 유효성 검사
async function validateForm() {
   // 1. 설비명
  const eqpNameInput = document.getElementById('EQP_NAME');
  if (!eqpNameInput.value.trim()) {
    alert('설비명을 입력해주세요.');
    eqpNameInput.focus();
    return false; // 실패 시 false 반환
  }

  // 2. 설비 가격
  const eqpPriceInput = document.getElementById('EQP_PRICE');
  const cleanPrice = eqpPriceInput.value.replace(/,/g, '');
  if (!cleanPrice) {
    alert('설비 가격을 입력해주세요.');
    eqpPriceInput.focus();
    return false;
  }
  if (isNaN(cleanPrice)) {
    alert('설비 가격은 숫자만 입력해야 합니다.');
    eqpPriceInput.focus();
    return false;
  }

  // 3. 구입일
  const eqpPurchaseDateInput = document.getElementById('EQP_PURCHASE_DATE');
  const eqpPurchaseDate = eqpPurchaseDateInput.value;
  if (!eqpPurchaseDate) {
    alert('구입일을 선택해주세요.');
    eqpPurchaseDateInput.focus();
    return false;
  }

  // 4. 설치일
  const eqpInstallationDateInput = document.getElementById('EQP_INSTALLATION_DATE');
  const eqpInstallationDate = eqpInstallationDateInput.value;
  if (!eqpInstallationDate) {
    alert('설치일을 선택해주세요.');
    eqpInstallationDateInput.focus();
    return false;
  }
    
  // 6. 제조사 (거래처)
  const cliIdInput = document.getElementById('CLI_NM');
  const cliId = cliIdInput.value;
  if (!cliId) {
    alert('제조사를 선택해주세요.');
    cliIdInput.focus();
    return false;
  }

  // 7. 공정
  const prcIdInput = document.getElementById('PRC_NM');
  const prcId = prcIdInput.value;
  if (!prcId) {
    alert('공정을 선택해주세요.');
    prcIdInput.focus();
    return false;
  }

  return true;
}

// 폼 제출
async function submitForm() {
  if (!validateForm()) {
    return;
  }
  // 2. 유효성 검사를 통과했으므로, 서버에 보낼 데이터를 만듭니다.
  try {
    const data = {
    // trim()으로 혹시 모를 양 끝 공백을 제거해줍니다.
    eqp_name: document.getElementById('EQP_NAME').value.trim(),

    // ★★★ 핵심: 가격에서 콤마(,)를 제거하고, Number()로 감싸 숫자로 변환합니다. ★★★
    eqp_price: Number(document.getElementById('EQP_PRICE').value.replace(/,/g, '')),

    eqp_purchase_date: document.getElementById('EQP_PURCHASE_DATE').value,
    eqp_installation_date: document.getElementById('EQP_INSTALLATION_DATE').value,

    // ID 값들도 숫자로 변환해주는 것이 안전합니다.
    cli_id: Number(document.getElementById('CLI_NM').value),
    prc_id: Number(document.getElementById('PRC_NM').value),
  };

    console.log('서버로 전송할 최종 데이터:', data);


    const res = await fetch(`/SOLEX/equipment`, {
    method : 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
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
    console.error('자재 요청 중 오류 발생:', err);
    alert(err.message);
  }
}
