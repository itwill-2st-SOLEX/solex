
//전역 변수 설정
let currentPage = 0;
const pageSize = 20;
const gridHeight = 600;
let editorInstance = null;
let editorLoaded = false;
let searchKeyword = '';
let empId = null;

// ToastUI Grid 생성
const grid = new tui.Grid({
    el: document.getElementById('grid'),
    bodyHeight: gridHeight,
    scrollY: true,
    scrollX: false,
    data: [],
    columns: [
		{ header: '번호', name: 'rowNum', width: 100, sortable: true },
        { header: '부서', name: 'empDepNm', align: 'center',  sortable: true },
        { header: '제목', name: 'notTt', width: 500, sortable: true },
        { header: '작성자', name: 'empNm', align: 'center',  sortable: true },
        { header: '직급', name: 'empPosNm', align: 'center',  sortable: true },
        { header: '등록일', name: 'notRegDate', align: 'center',  sortable: true }
    ],
});

// 페이지가 완전히 로딩 된 후에 자동으로 목록 보여짐
window.addEventListener('DOMContentLoaded', () => {
		
	searchKeyword = document.getElementById('searchInput').value.trim();
    noticeList(currentPage, searchKeyword);
	document.getElementById('searchBtn').addEventListener('click', searchNotice);
	document.getElementById('writeBtn').addEventListener('click', onWriteNotice);
	
});

//무한 스크롤 이벤트
function bindScrollEvent() {
	// 검색으로 화면 목록이 변경되었을 경우를 대비해서 스크롤 초기화
    grid.off('scrollEnd');
	
	//무한스크롤시 검색어 유지를 위해 재전달
    grid.on('scrollEnd', () => {
        const keyword = document.getElementById('searchInput').value.trim();
        noticeList(currentPage, keyword);
    });
}

//페이지 로딩시 무한스크롤 기능이 동작하도록 이벤트 등록
bindScrollEvent();

//날짜 형식 함수
//날짜만 넣으면 년-월-일 형식, (날짜, true)하면 년-월-일 오전?오후 시:분 형식으로 출력
function dateFormatter(date, includeTime = false) {
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

// 게시글 목록 불러오기
async function noticeList(page, keyword = '') {
    try {
		
		// 무한스크롤 페이지, 검색어 url로 전달
		let url = `/SOLEX/notice/api?page=${page}&size=${pageSize}`;
		
        if (keyword) {
            url += `&keyword=${encodeURIComponent(keyword)}`;
        }
		
		
		
        const res = await fetch(url);  // 1. 서버에 요청 → 응답 도착까지 기다림
        const data = await res.json();  // 2. 응답을 JSON으로 파싱 → 객체로 바꿈
		
		const list = data.list;
		const totalCount = data.totalCount;
		
		empId = data.empId;
		
		console.log(data)
		
        const gridData = list.map((n, idx) => ({
            id: n.NOT_ID,
            notTt: n.NOT_TT,
            notCon: n.NOT_CON,
            empDepNm: n.EMP_DEP_NM  == '공통' ? '-' : n.EMP_DEP_NM,
            empPosNm: n.EMP_POS_NM  == '공통' ? '-' : n.EMP_POS_NM,
            empNm: n.EMP_NM || '-',
            notRegDate: dateFormatter(new Date(n.NOT_REG_DATE)),
			rowNum: totalCount - (page * pageSize + idx) // 역순 번호 계산
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
    }
}

// 검색기능
function searchNotice() {
	const keyword = document.getElementById('searchInput').value.trim();
	    currentPage = 0;
		
		bindScrollEvent();		//무한스크롤 초기화 후 실행
	    noticeList(currentPage, keyword);
}

// 제목 클릭 시 상세조회
grid.on('click', async (ev) => {
    if (ev.columnName === 'notTt') {
        const noticeId = grid.getRow(ev.rowKey).id;

        try {
            const res = await fetch(`/SOLEX/notice/api/${noticeId}`);
            const detail = await res.json();
            showNoticeModal('view', detail);
        } catch (e) {
            console.error('공지사항 상세 조회 실패: ', e);
        }
    }
});


// 게시글 등록/수정/삭제 - 비동기
async function changeNotice(mode, noticeId = null) {
	
	let url = '';
	let method = '';
	let payload = null;
	
	if (mode == 'new') {
		url = '/SOLEX/notice/api';
		method = 'POST';
	  
	} else if (mode == 'edit') {
		url = `/SOLEX/notice/api/${noticeId}`;
		method = 'PUT';
	  
	} else if (mode == 'delete') {
		url = `/SOLEX/notice/${noticeId}`;
		method = 'DELETE';
	  
	}
	
	//삭제와 등록/수정 구분하기
	if (mode == 'delete') {
		if (!confirm('정말 삭제하시겠습니까?')) return;
		
	} else {
		const title = document.getElementById('noticeTitle').value.trim();
	    const content = window.editorInstance ? window.editorInstance.getMarkdown() : '';
		
	    if (!title || !content) {
	        alert('제목과 내용을 모두 입력해 주세요.');
	        return;
	    }
	
	    payload = {
	        notTt: title,
	        notCon: content
	    };
	}	

    try {
        const res = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json'
            },
			//payload가 존재하면 payload추가, 없으면 아무것도 추가안함
			// DELETE에는 body 없이 전달
			// ...(대상 && 존재할때 추가할 값)
            ...(payload && { body: JSON.stringify(payload) }) 
        });

        if (!res.ok) {
            throw new Error(`서버 오류: ${res.status}`);
        }

		alert('성공적으로 처리되었습니다.');
        bootstrap.Modal.getInstance(document.getElementById('exampleModal')).hide();
        currentPage = 0;
        noticeList(currentPage);
		
    } catch (err) {
		console.error('공지사항 처리 실패:', err);
        alert('공지사항 처리 중 오류가 발생했습니다.');
    }
}
// 글쓰기 버튼 클릭
async function onWriteNotice() {
	
	try {
        // 사용자 정보만 받아오기
        const res = await fetch('/SOLEX/notice/api/userinfo');
        if (!res.ok) throw new Error('사용자 정보 로드 실패');
        const userInfo = await res.json();
        
		console.log(userInfo)
        // 모달 띄우기 (빈 제목, 내용과 사용자 정보 포함)
        showNoticeModal('new', userInfo);

    } catch (e) {
        console.error('글 작성 모달창 표시 실패', e);
        // 사용자 정보 없을 때 기본값 처리 가능
        showNoticeModal('new', { EMP_NM: '알 수 없음', DET_NM: '-', POS_NM: '-' });
    }
}

// 수정 버튼 클릭
function noticeEditMode(noticeId) {
    fetch(`/SOLEX/notice/api/${noticeId}`)
        .then(res => res.json())
        .then(data => showNoticeModal('edit', data))
        .catch(err => console.error('수정 모드 조회 실패', err));
}

// 삭제 버튼 클릭
function noticeDelMode(noticeId) {
    fetch(`/SOLEX/notice/${noticeId}`)
        .then(res => res.json())
        .then(data => showNoticeModal('delete', data))
        .catch(err => console.error('삭제 모드 조회 실패', err));
}

// 모달 표시 함수
function showNoticeModal(mode, data = {}) {
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
                    <li><strong>등록일 </strong> <span id="modalDate">${data.NOT_REG_DATE ? dateFormatter(data.NOT_REG_DATE, true) : dateFormatter(now)}</span></li>
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



// 에디터 스크립트 동적 로딩
function loadEditorScript(callback) {
    if (editorLoaded) {
        callback();
        return;
    }

    const script = document.createElement('script');
    script.src = '/SOLEX/js/editor.js';
    script.onload = () => {
        editorLoaded = true;
        callback();
    };
	
    document.body.appendChild(script);
}

