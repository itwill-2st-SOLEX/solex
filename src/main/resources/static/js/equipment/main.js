// ===================================================================
// 1. 전역 변수 및 상태 관리
// ===================================================================
let currentPage = 0;
const pageSize = 20;
const gridHeight = 600;
let isLoading = false;
let hasMoreData = true;
let originalEquipmentData = null;

// ★★★ 개선점 1: 폼 옵션 데이터를 전역 변수로 관리 (API 호출 최소화) ★★★
// 페이지 로드 시 한 번만 채워놓고 계속 재사용합니다.
let formSelectOptions = {
    clientList: [],
    processList: []
};

// ===================================================================
// 2. TUI Grid 인스턴스 생성 (변경 없음)
// ===================================================================
const grid = new tui.Grid({
    el: document.getElementById('grid'),
    bodyHeight: gridHeight,
    scrollY: true,
    scrollX: false,
    columns: [
        { header: '설비 코드', name: 'EQP_CODE', width: 150, align: 'center', sortable: true ,renderer: {
			     styles: {
			       color: '#007BFF',
			       textDecoration: 'underline',
			       cursor: 'pointer'
			     }
			   }},
        { header: '제조사', name: 'CLI_NM', align: 'center', sortable: true },
        { header: '공정 명', name: 'PRC_NM', width: 150, align: 'center', sortable: true },
        { header: '설비 명', name: 'EQP_NAME', align: 'center', sortable: true },
        { header: '설비 가격', name: 'EQP_PRICE', width: 100, align: 'center', sortable: true},
        { header: '구입일', name: 'EQP_PURCHASE_DATE', width: 100, align: 'center', sortable: true },
        { header: '설치일', name: 'EQP_INSTALLATION_DATE', width: 100, align: 'center', sortable: true },
        { header: '사용여부', name: 'EQP_STS', width: 80, align: 'center', sortable: true }
    ],
});

// ===================================================================
// 3. 초기화 및 이벤트 리스너 설정 (DOM 로드 후)
// ===================================================================
document.addEventListener('DOMContentLoaded', async function() {
    await initializePage();

    // 이벤트 리스너들을 설정합니다.
    setupEventListeners();


    document.getElementById('PRC_NM').addEventListener('change', function() {
      getTeam();
    });
    
});

/**
 * 페이지에 필요한 모든 초기 데이터를 로드하고 설정하는 함수
 */
async function initializePage() {
    await fetchFormOptions(); // select box 옵션 데이터 로드
    await fetchGridData(0); // 그리드의 첫 페이지 데이터 로드
    setupLinkedDateInputs('EQP_PURCHASE_DATE', 'EQP_INSTALLATION_DATE');
}

/**
 * 페이지의 모든 이벤트 리스너를 설정하는 함수
 */
function setupEventListeners() {
    // 무한 스크롤
    // grid.on('scrollEnd', async ({ vert }) => {
    //     if (vert.isReachedBottom && hasMoreData && !isLoading) {
    //         currentPage++;
    //         await fetchGridData(currentPage);
    //     }
    // });

    // 그리드 행 클릭 -> 상세 모달 열기
    grid.on('click', (ev) => {
        if (ev.rowKey !== undefined && ev.columnName === 'EQP_CODE') {
            const rowData = grid.getRow(ev.rowKey);
            openDetailModal(rowData);
        }
    });

    // 설비 등록 버튼 -> 생성 모달 열기
    document.getElementById('openEquipmentModalBtn').addEventListener('click', openCreateEquipmentModal);

    // 가격 입력 포맷팅
    document.getElementById('EQP_PRICE').addEventListener('input', handlePriceInput);
}

// ===================================================================
// 4. 데이터 로딩 (API 호출) 함수
// ===================================================================

/**
 * 그리드 데이터를 서버에서 가져와 그리드에 채우는 함수
 */
async function fetchGridData(page = 0) {
    if (isLoading) return;
    isLoading = true;
    try {
        const params = new URLSearchParams({ page, pageSize });
        const response = await fetch(`/SOLEX/equipment/data?${params.toString()}`);
        if (!response.ok) throw new Error('그리드 데이터 로딩 실패');
        
        const data = await response.json();
        data.forEach(item => {
          item.EQP_PRICE = formatNumber(item.EQP_PRICE);
          item.EQP_STS = item.EQP_STS === 'y' ? '가동' : '비가동';
        });

        if (page === 0) {
            grid.resetData(data);
        } else {
            grid.appendRows(data);
        }
        hasMoreData = data.length === pageSize;
    } catch (error) {
        console.error('fetchGridData 오류:', error);
        hasMoreData = false;
    } finally {
        isLoading = false;
    }
}

/**
 * Select Box 옵션 데이터를 한 번만 가져와 전역 변수에 저장
 */
async function fetchFormOptions() {
    try {
        const response = await fetch('/SOLEX/equipment/form-data');
        if (!response.ok) throw new Error('폼 옵션 데이터 로딩 실패');
        const data = await response.json();
        // 가져온 데이터를 전역 변수에 저장합니다.
        formSelectOptions.clientList = data.clientList || [];
        formSelectOptions.processList = data.processList || [];
    } catch (error) {
        console.error('fetchFormOptions 오류:', error);
        alert('페이지 초기화에 필요한 옵션 정보를 불러오는 데 실패했습니다.');
    }
}

// ===================================================================
// 5. 모달 관련 함수
// ===================================================================

/**
 * [생성 모달] '설비 등록' 모달을 엽니다.
 */
function openCreateEquipmentModal() {
    resetModalForm(); // 폼을 깨끗하게 초기화
    setupModalForCreate(); // 생성 모드에 맞게 모달 설정
    
    const modal = new bootstrap.Modal(document.getElementById('myModal'));
    modal.show();
}

/**
 * [상세/수정 모달] '설비 상세' 모달을 엽니다.
 */
async function openDetailModal(rowData) {
    resetModalForm(); // 폼을 깨끗하게 초기화
    console.log(rowData);
    try {
        const response = await fetch(`/SOLEX/equipment/${rowData.EQP_CODE}`);
        if (!response.ok) throw new Error('상세 데이터 로딩 실패');
        
        const equipmentData = (await response.json())[0];

        originalEquipmentData = equipmentData;
		
		    console.log(equipmentData);
        
        // 상세 데이터로 폼을 채웁니다.
        populateModalForm(equipmentData);
        
        // 수정 모드에 맞게 모달을 설정합니다.
        setupModalForUpdate(equipmentData.EQP_CODE);

        const modal = new bootstrap.Modal(document.getElementById('myModal'));
        modal.show();
    } catch (error) {
        console.error('openDetailModal 오류:', error);
        alert('상세 정보를 불러오는 데 실패했습니다.');
    }
}

// ===================================================================
// 6. 폼 및 헬퍼 함수
// ===================================================================

/**
 * 모달의 모든 입력 필드를 초기화합니다.
 */
function resetModalForm() {
    document.getElementById('EQP_NAME').value = '';
    document.getElementById('EQP_PRICE').value = '';
    document.getElementById('EQP_PURCHASE_DATE').value = '';
    document.getElementById('EQP_INSTALLATION_DATE').value = '';
    document.getElementById('EQP_STS').value = '';
    document.getElementById('EQP_COMM').value = '';
    const teamSelect = document.getElementById('TEAM_NAME');
    teamSelect.innerHTML = '';
    const defaultOption = document.createElement('option');
    defaultOption.textContent = `-팀을 선택해주세요-`;
    defaultOption.value = '';
    defaultOption.selected = true;
    teamSelect.appendChild(defaultOption);
    //

    // Select box는 reset()으로 기본값이 선택되지 않을 수 있어 수동으로 채웁니다.
    populateSelect('CLI_NM', formSelectOptions.clientList, 'CLI_ID', 'CLI_NM');
    populateSelect('PRC_NM', formSelectOptions.processList, 'PRC_ID', 'PRC_NM');
    originalEquipmentData = {};
}

/**
 * 상세 데이터로 모달 폼을 채웁니다.
 */
function populateModalForm(data) {
    document.getElementById('EQP_NAME').value = data.EQP_NAME || '';
    document.getElementById('EQP_COMM').value = data.EQP_COMM || '';
    document.getElementById('EQP_PURCHASE_DATE').value = data.EQP_PURCHASE_DATE || '';
    document.getElementById('EQP_INSTALLATION_DATE').value = data.EQP_INSTALLATION_DATE || '';
    document.getElementById('EQP_STS').value = data.EQP_STS || '';

    document.getElementById('EQP_PRICE').value = formatNumber(data.EQP_PRICE || 0);
    
    // 
    document.getElementById('CLI_NM').value = data.CLI_ID || '';
    document.getElementById('PRC_NM').value = data.PRC_ID || '';


    const teamSelect = document.getElementById('TEAM_NAME');
    teamSelect.innerHTML = '';
    const defaultOption = document.createElement('option');
    defaultOption.textContent = data.TEAM_NAME || '';
    defaultOption.value = data.TEAM_ID || '';
    teamSelect.appendChild(defaultOption);
    
}

/**
 * '등록' 모드에 맞게 모달 버튼을 설정합니다.
 */
function setupModalForCreate() {
    document.getElementById('exampleModalLabel').textContent = '설비 등록'; // 모달 제목 변경

    const submitBtn = document.getElementById('submitBtn');
    const newBtn = submitBtn.cloneNode(true); // 이벤트 리스너 제거
    submitBtn.parentNode.replaceChild(newBtn, submitBtn);
    
    newBtn.textContent = '등록';
    newBtn.addEventListener('click', createEquipment); // submitForm 함수 직접 연결
}

/**
 * '수정' 모드에 맞게 모달 버튼을 설정합니다.
 */
function setupModalForUpdate(eqpCode) {
    document.getElementById('exampleModalLabel').textContent = '설비 정보 수정'; // 모달 제목 변경
    const submitBtn = document.getElementById('submitBtn');
    const newBtn = submitBtn.cloneNode(true);
    submitBtn.parentNode.replaceChild(newBtn, submitBtn);

    newBtn.textContent = '수정';
    newBtn.addEventListener('click', () => {
      // 수정 로직은 submitForm과 유사하게 별도 함수로 만들거나,
      // submitForm 내에서 분기 처리할 수 있습니다.
      updateEquipment(eqpCode); 
    });
}
// 거래처, 공정 select 채우는 함수
async function populateSelect(selectId, list, valueKey, textKey) {
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
async function setupLinkedDateInputs(purchaseDateId, installationDateId) {
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
  purchaseInput.addEventListener('change', async function() {
      if (this.value) {
          installInput.min = this.value;
          if (installInput.value && installInput.value < this.value) {
              installInput.value = '';
          }
      }
  });

  // 설치일 변경 시 구입일의 최대 날짜를 업데이트하는 이벤트 리스너
  installInput.addEventListener('change', async function() {
      if (this.value) {
          purchaseInput.max = this.value;
      }
  });
}
// 가격 포맷팅
async function handlePriceInput(event) {
  let value = event.target.value;
  const cleanValue = value.replace(/[^0-9]/g, '');
  if (cleanValue === '') {
    event.target.value = '';
    return;
  }
  const formattedValue = cleanValue.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  event.target.value = formattedValue;
}

// DB에서 조회했을때 가격 포맷팅
function formatNumber(num) {
  const formatNumber = num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return formatNumber;
}

// 공정에 대한 팀 선택.
function getTeam() {

  const prcId = document.getElementById('PRC_NM').value;
  // 공백일때도 return
  if (!prcId || prcId === '') return;

  fetch(`/SOLEX/equipment/${prcId}/teams`)
    .then(response => response.json())
    .then(data => {
      const teamSelect = document.getElementById('TEAM_NAME');
      teamSelect.innerHTML = '';
      const defaultOption = document.createElement('option');
      defaultOption.textContent = `-팀을 선택해주세요-`;
      defaultOption.value = '';
      defaultOption.selected = true;
      teamSelect.appendChild(defaultOption);
      data.forEach(team => {
        const option = document.createElement('option');
        option.value = team.TEAM_CD;
        option.textContent = team.TEAM_NM;
        teamSelect.appendChild(option);
      });
    })
    .catch(error => console.error('팀 데이터 로딩 실패:', error));
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

async function createEquipment() {
  if (!validateForm()) return;
  
  const data = getCurrentFormData();
  
  try {
      const response = await fetch('/SOLEX/equipment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('서버 등록 실패');
      
      alert('성공적으로 등록되었습니다.');
      window.location.reload();
  } catch (error) {
      console.error('createEquipment 오류:', error);
      alert(error.message);
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

function getCurrentFormData() {
  const price = document.getElementById('EQP_PRICE').value.replace(/,/g, '');
  const data = {
      eqp_name: document.getElementById('EQP_NAME').value.trim(),
      eqp_comm: document.getElementById('EQP_COMM').value.trim(),
      eqp_price: Number(price) || 0,
      eqp_purchase_date: document.getElementById('EQP_PURCHASE_DATE').value,
      eqp_installation_date: document.getElementById('EQP_INSTALLATION_DATE').value,
      eqp_sts: document.getElementById('EQP_STS').value,
      cli_id: Number(document.getElementById('CLI_NM').value),
      prc_id: Number(document.getElementById('PRC_NM').value),
      team_id: document.getElementById('TEAM_NAME').value,
  };
  console.log(data);
  return data;
}

// 업데이트 함수
async function updateEquipment(eqpCode) {
  if (!validateForm()) return;

  const currentData = getCurrentFormData();

  // 원본 데이터와 현재 폼 데이터를 비교
  const isChanged = 
      originalEquipmentData.EQP_NAME !== currentData.eqp_name ||
      originalEquipmentData.EQP_COMM !== currentData.eqp_comm ||
      originalEquipmentData.EQP_PRICE !== currentData.eqp_price ||
      originalEquipmentData.EQP_PURCHASE_DATE !== currentData.eqp_purchase_date ||
      originalEquipmentData.EQP_INSTALLATION_DATE !== currentData.eqp_installation_date ||
      originalEquipmentData.EQP_STS !== currentData.eqp_sts ||
      originalEquipmentData.CLI_ID !== currentData.cli_id ||
      originalEquipmentData.PRC_ID !== currentData.prc_id ||
      originalEquipmentData.TEAM_ID !== currentData.team_id;
  console.log(currentData);
  if (!isChanged) {
      alert('변경된 내용이 없습니다.');
      return;
  }

  try {
      const response = await fetch(`/SOLEX/equipment/${eqpCode}`, {
          method: 'PATCH', // 또는 'PATCH'
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(currentData)
      });
      if (!response.ok) throw new Error('서버 수정 실패');

      alert('성공적으로 수정되었습니다.');
      window.location.reload();
  } catch (error) {
      console.error('updateEquipment 오류:', error);
      alert(error.message);
  }
}
