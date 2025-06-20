window.addEventListener('DOMContentLoaded', () => {
	
	document.getElementById('writeProductBtn').addEventListener('click', onWriteProduct);	
});	


// 글쓰기 버튼 클릭
async function onWriteProduct() {
	try {
        // 모달 띄우기 (빈 제목, 내용과 사용자 정보 포함)
        showProductModal('new');
		// 단위 셀렉트 박스
		loadPrdUnitTypes();
    } catch (e) {
        console.error('제품 등록 모달창 표시 실패', e);
        // 사용자 정보 없을 때 기본값 처리 가능
        showProductModal('new', { EMP_NM: '알 수 없음', DET_NM: '-', POS_NM: '-' });
    }
}

// 모달 표시 함수
function showProductModal(mode, data = {}) {
	console.log('data ??? '  + JSON.stringify(data));
	console.log('mode ??? '  + mode);
    const modalContainer = document.getElementById('showProductModal');
    const modalFooter = document.getElementById('productModalFooter');
    const isEditable = (mode == 'new' || mode == 'edit');
    const now = new Date();
	
	
	const modalTitleText = isEditable ? '제품 수정' : '제품 등록';

    const title = isEditable ? 
		`<label for="prd_nm" class="form-label">제품명 <span style="color:red">*</span></label>
		 <input type="text" id="prd_nm" name="prd_nm" class="form-control" value="${data.PRD_NM || ''}" placeholder="제품명을 입력하세요">` : 
		`<span id="modalTitle">${data.PRD_NM || ''}</span>`;

    const content = isEditable ?
        `<div id="editor"></div>` :
        `${(data.NOT_CON || '내용 없음').replace(/\n/g, '<br>')}`; // \n줄바꿈 , /g 전역 검색 플래그

    modalContainer.innerHTML = `
        <div class="custom-modal-detail">
            <div class="custom-modal-content" id="modalContent">
				<div class="row mb-4">
	                <div class="col">
						${title}
	                </div>
	                <div class="col">
	                    <label for="prd_price" class="form-label">제품 가격<span style="color:red">*</span></label>
	                    <input type="text" id="prd_price" name="prd_price" class="form-control" placeholder="제품가격" value="${data.PRD_PRICE}">
	                </div>
	            </div>
				<div class="row mb-4">
		        	<div class="col">
		            	<label for="prd_unit" class="form-label">제품 단위<span style="color:red">*</span></label>
						<br>
						<select id="prdUnitSelect" class="form-select"></select>
						${data.PRD_UNIT}
						
		            </div>
	                <div class="col">
	                    <label for="prd_type" class="form-label">제품 유형<span style="color:red">*</span></label>
						<br>
						${data.PRD_TYPE}
	                </div>
		            </div>
				</div>
			</div>
        </div>
    `;

	modalFooter.innerHTML = `
	        ${mode === 'view' ? `<button class="btn custom-btn-blue mt-3" onclick="noticeEditMode(${data.NOT_ID})">수정</button>` : ''}
			${mode === 'view' ? `<button class="btn custom-btn-blue mt-3" onclick="changeNotice('delete', ${data.NOT_ID})">삭제</button>` : ''}
	        ${isEditable ? `<button class="btn custom-btn-blue mt-3"  onclick="changeNotice('${mode}', ${data.NOT_ID || null})">저장</button>` : ''}
	        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">닫기</button>
	    `;

    // 모달 표시
    const modalEl = document.getElementById('exampleModal');
    const bsModal = new bootstrap.Modal(modalEl);
    bsModal.show();

    
}

//날짜 형식 함수
//날짜만 넣으면 년-월-일 형식, (날짜, true)하면 년-월-일 오전?오후 시:분 형식으로 출력
function formatter(date, includeTime = false) {
	const d = new Date(date);
	
	//Intl.DateTimeFormat(...).formatToParts() : 날짜를 구성 요소별로 나눠서 배열 형태로 반환
	//DateTimeFormat이 날짜를 무조건 .으로 구분해서 저장하므로 배열에 '.'리터럴도 한칸씩 저장됨
	const parts = new Intl.DateTimeFormat('ko-KR', {
		year: 'numeric',
		month: '2-digit',
		day: '2-digit',
		hour: includeTime ? '2-digit' : undefined,
		minute: includeTime ? '2-digit' : undefined,
		hour12: true // 오전/오후 포함
	}).formatToParts(d);
	
	//저장된 parts 배열을 반복하면서 원하는 값만 가져올 수 있도록 함수를 정의함
	const get = type => parts.find(p => p.type === type)?.value;
	
	//get함수를 이용하여 각 년, 월, 일의 값만 배열에서 찾아와서 저장
	const year = get('year');
	const month = get('month');
	const day = get('day');
	
	let result = `${year}-${month}-${day}`;
	
	if (includeTime) {
		const dayPeriod = get('dayPeriod'); // '오전' or '오후'
		const hour = get('hour');
		const minute = get('minute');
		result += ` ${dayPeriod} ${hour}:${minute}`;
	}

	return result;
}


// 제품 단위 셀렉트 박스 
async function loadPrdUnitTypes(selectedValue = null) {
    const select = document.getElementById('prdUnitSelect');
    console.log("선택된 제품 단위 값:", selectedValue); // 디버깅용
    if (!select) {
        console.error("제품 단위 선택 요소를 찾을 수 없습니다.");
        return; // 요소가 없으면 종료
    }

    try {
        const response = await fetch('/SOLEX/products/api/prdUnitTypes');
		console.log('단위 url 잘 불러오나???????? ');
        if (!response.ok) {
            throw new Error('단위값을 불러오지 못했습니다.');
        }
        const prdUnitTypes = await response.json();
        select.innerHTML = ''; // 기존 옵션 비우기

        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.textContent = '선택하세요';
        defaultOption.disabled = true;
        if (!selectedValue) { // 수정 모드가 아닐 때 (또는 선택된 값이 없을 때) 기본값 선택
            defaultOption.selected = true;
        }
        select.appendChild(defaultOption);

        clientTypes.forEach(type => {
            const option = document.createElement('option');
            option.value = type.code;
            option.textContent = type.name;
            if (selectedValue && type.code == selectedValue) { // 수정 모드일 때 해당 값 선택
                option.selected = true;
            }
            select.appendChild(option);
        });
    } catch (error) {
        console.error("단위 로드 중 오류 발생:", error);
        alert("단위값을 불러오는 데 실패했습니다.");
    }
}