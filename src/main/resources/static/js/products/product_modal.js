window.addEventListener('DOMContentLoaded', () => {
	
	document.getElementById('writeProductBtn').addEventListener('click', onWriteProduct);	
});	


// 글쓰기 버튼 클릭
async function onWriteProduct() {
	try {
        // 모달 띄우기 (빈 제목, 내용과 사용자 정보 포함)
        showProductModal('new');

    } catch (e) {
        console.error('제품 등록 모달창 표시 실패', e);
        // 사용자 정보 없을 때 기본값 처리 가능
        showProductModal('new', { EMP_NM: '알 수 없음', DET_NM: '-', POS_NM: '-' });
    }
}

// 모달 표시 함수
function showProductModal(mode, data = {}) {
	console.log('data ??? '  + JSON.stringify(data));
    const modalContainer = document.getElementById('showProductModal');
    const modalFooter = document.getElementById('productModalFooter');
    const isEditable = (mode == 'new' || mode == 'edit');
    const now = new Date();

    const title = isEditable ? 
	
		`<label for="cli_nm" class="form-label">제품명 <span style="color:red">*</span></label>
		 <input type="text" id="noticeTitle" class="form-control" value="${data.NOT_TT || ''}" placeholder="제품명을 입력하세요">` : 
		`<span id="modalTitle">${data.NOT_TT || ''}</span>`;

    const content = isEditable ?
        `<div id="editor"></div>` :
        `${(data.NOT_CON || '내용 없음').replace(/\n/g, '<br>')}`; // \n줄바꿈 , /g 전역 검색 플래그

    modalContainer.innerHTML = `
        <div class="custom-modal-detail">
            <div class="custom-modal-header">
                <h4 class="custom-modal-title" id="exampleModalLabel">${title}</h4>
            </div>
            <div class="custom-modal-content" id="modalContent">
				<div class="row mb-4">
	                <div class="col">
	                    <label for="cli_nm" class="form-label">유형<span style="color:red">*</span></label>
						<br>
						<select id="clientTypeSelect" class="form-select"></select>
	                </div>
	                <div class="col">
	                    <label for="cli_ceo" class="form-label">단위<span style="color:red">*</span></label>
	                    <input type="text" id="cli_ceo" name="cli_ceo" class="form-control" placeholder="단위" value="">
	                </div>
	            </div>
			</div>
			<div class="modal-body big-box">
	            
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