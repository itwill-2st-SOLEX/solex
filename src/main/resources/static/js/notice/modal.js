// modal.js


export function showNoticeModal(mode, data = {}) {
    const modalContainer = document.getElementById('showModal');
    const modalFooter = document.getElementById('modalFooter');
    const isEditable = (mode == 'new' || mode == 'edit');
    const now = new Date();

    const title = isEditable ? 
        `<input type="text" id="noticeTitle" class="form-control" value="${data.NOT_TT || ''}" placeholder="제목을 입력하세요">` : 
        `<span id="modalTitle">${data.NOT_TT || ''}</span>`;

    const content = isEditable ?
        `<div id="editor"></div>` :
        `${(data.NOT_CON || '내용 없음').replace(/\n/g, '<br>')}`;
	



    modalContainer.innerHTML = `
        <div class="custom-modal-detail">
            <div class="custom-modal-header">
                <h4 class="custom-modal-title" id="exampleModalLabel">${title}</h4>
                <ul class="custom-modal-meta">
                    <li><strong>부서명 </strong> <span id="modalDept">${data.DET_NM || '작성자부서명'}</span></li>
                    <li><strong>작성자 </strong> <span id="modalWriter">${data.EMP_NM || '작성자이름'}</span></li>
                    <li><strong>등록일 </strong> <span id="modalDate">${data.NOT_REG_DATE || now.toLocaleDateString()}</span></li>
                </ul>
            </div>
            <div class="custom-modal-content" id="modalContent">${content}</div>
        </div>
    `;

    modalFooter.innerHTML = `
        ${mode === 'view' ? `<button class="btn custom-btn-blue mt-3" onclick="window.noticeEditMode(${data.NOT_ID})">수정</button>` : ''}
        ${mode === 'view' ? `<button class="btn custom-btn-blue mt-3" onclick="window.changeNotice('delete', ${data.NOT_ID})">삭제</button>` : ''}
        ${isEditable ? `<button class="btn custom-btn-blue mt-3" onclick="window.changeNotice('${mode}', ${data.NOT_ID || null})">저장</button>` : ''}
        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">닫기</button>
    `;

    const modalEl = document.getElementById('exampleModal');
    const bsModal = new bootstrap.Modal(modalEl);
    bsModal.show();

    modalEl.addEventListener('hidden.bs.modal', () => {
        document.querySelectorAll('.modal-backdrop').forEach(el => el.remove());
        document.body.classList.remove('modal-open');
    }, { once: true });

    if (isEditable) {
        loadEditorScript(() => {
            initEditor('#editor', data.NOT_CON || '');
        });
    }
}

export function loadEditorScript(callback) {
    if (window.editorLoaded) {
        callback();
        return;
    }

    const script = document.createElement('script');
    script.src = '/SOLEX/js/editor.js';
	script.type = 'module';  // 여기 추가!
    script.onload = () => {
        window.editorLoaded = true;
        callback();
    };

    document.body.appendChild(script);
}
