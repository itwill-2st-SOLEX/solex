// ToastUI Grid 생성
const bgrid = new tui.Grid({
    el: document.getElementById('bom-grid'),
    bodyHeight: gridHeight,
    scrollY: true,
    scrollX: false,
    data: [],
    columns: [
		{ header: 'BOM번호', name: 'bom_id', align : 'center' },
		{ header: '제품', name: 'opt_id',align : 'center', sortable: 'true' },
		{ header: '원자재', name: 'mat_id',align : 'center', sortable: 'true' },
		{ header: '소모량', name: 'bom_cnt', sortable: 'true',align : 'center' },
		{ header: '단위', name: 'bom_unit', sortable: 'true',align : 'center' },
		{ header: '설명', name: 'bom_comm', sortable: 'true',align : 'center' },
		{ header: '등록일', name: 'bom_reg_date', sortable: 'true',align : 'center' },
	]
});

	
// 페이지가 완전히 로딩 된 후에 자동으로 목록 보여짐
window.addEventListener('DOMContentLoaded', () => {
	document.getElementById('bom-add').addEventListener('click', onWriteBom);
    bomList(currentPage);
});

//무한 스크롤 이벤트
function bindScrollEvent() {
	// 검색으로 화면 목록이 변경되었을 경우를 대비해서 스크롤 초기화
    grid.off('scrollEnd');
	
	//무한스크롤시 검색어 유지를 위해 재전달
    grid.on('scrollEnd', () => {
        bomList(currentPage);
    });
}

//페이지 로딩시 무한스크롤 기능이 동작하도록 이벤트 등록
bindScrollEvent();


// 상품 목록 불러오기
async function bomList(page) {
    try {
		
		// 무한스크롤 페이지, 검색어 url로 전달
		let url = `/SOLEX/boms/api/productList`;
		
        const res = await fetch(url);  // 1. 서버에 요청 → 응답 도착까지 기다림
		
		// HTTP 응답 상태 코드 확인 (추가!)
        if (!res.ok) { // res.ok는 status가 200-299 범위에 있으면 true
            const errorText = await res.text(); // 오류 메시지를 텍스트로 가져옴
            console.error(`HTTP 오류: ${res.status} - ${res.statusText}`, errorText);
            // 에러를 던져 catch 블록으로 보냄
            throw new Error(`HTTP error! status: ${res.status}`);
        }
		
        const data = await res.json();  // 2. 응답을 JSON으로 파싱 → 객체로 바꿈
		console.log("productList  data ???" + JSON.stringify(data));
		
		const totalCount = data.totalCount;
		
        const gridData = data.map((p, idx) => ({
			prd_cd: p.PRD_CD,
            prd_nm: p.PRD_NM,
            prd_price: p.PRD_PRICE,
            prd_type: p.PRD_TYPE,
            prd_unit: p.PRD_UNIT
        }));
		
		//첫 페이지면 초기화 후 새로 보여줌
		//내용이 있으면 아래에 행추가
        if (page === 0) grid.resetData(gridData);
        else grid.appendRows(gridData);
        
        currentPage++;
		
		// 무한스크롤 종료
        if (data.length < pageSize) {
            grid.off('scrollEnd');
        } else {
			bindScrollEvent();
		}

    } catch (e) {
        console.error('fetch 에러 : ', e);
		console.error("productList 함수 실행 중 오류 발생:", error);
    }
}

// 모달 표시 함수
function showProductsModal(mode, data = {}) {
    const modalContainer = document.getElementById('showModal');
    const modalFooter = document.getElementById('modalFooter');
    const isEditable = (mode == 'new' || mode == 'edit');
    const now = new Date();

    const title = isEditable ? 
		`<input type="text" id="noticeTitle" class="form-control" value="${data.NOT_TT || ''}" placeholder="제목을 입력하세요">` : 
		`<span id="modalTitle">${data.NOT_TT || ''}</span>`;

    const content = isEditable ?
        `<div id="editor"></div>` :
        `${(data.NOT_CON || '내용 없음').replace(/\n/g, '<br>')}`; // \n줄바꿈 , /g 전역 검색 플래그

    modalContainer.innerHTML = `
        <div class="custom-modal-detail">
            <div class="custom-modal-header">
                <h4 class="custom-modal-title" id="exampleModalLabel">${title}</h4>
                <ul class="custom-modal-meta">
					<li><strong>부서명 </strong> <span id="modalDept">${data.EMP_DEP_NM == '공통' ? '-' : data.EMP_DEP_NM}</span></li>
                    <li><strong>작성자 </strong> <span id="modalWriter">${data.EMP_NM}</span> &nbsp; </li>
                    <li><strong>등록일 </strong> <span id="modalDate">${data.NOT_REG_DATE ? formatter(data.NOT_REG_DATE, true) : formatter(now)}</span></li>
					                </ul>
            </div>
            <div class="custom-modal-content" id="modalContent">${content}</div>
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

    // 모달 닫힐 때 editor 제거
    modalEl.addEventListener('hidden.bs.modal', () => {	// editor.js의 editorInstance가 알아서 관리하니 여기서 따로 처리 안 해도 됨
	        document.querySelectorAll('.modal-backdrop').forEach(el => el.remove());
	        document.body.classList.remove('modal-open');
	    }, { once: true });

	    if (isEditable) {
	        loadEditorScript(() => {
	            // editor.js에서 제공하는 initEditor() 사용
	            initEditor('#editor', data.NOT_CON || '');
	        });
    }
	
	
}
// 글쓰기 버튼 클릭
async function onWriteBom() {
	
	try {
        // 사용자 정보만 받아오기
        const res = await fetch('/SOLEX/notice/api/userinfo');
        if (!res.ok) throw new Error('사용자 정보 로드 실패');
        const userInfo = await res.json();
        
		console.log(userInfo)
        // 모달 띄우기 (빈 제목, 내용과 사용자 정보 포함)
        showProductsModal('new', userInfo);

    } catch (e) {
        console.error('글 작성 모달창 표시 실패', e);
        // 사용자 정보 없을 때 기본값 처리 가능
        showProductsModal('new', { EMP_NM: '알 수 없음', DET_NM: '-', POS_NM: '-' });
    }
}