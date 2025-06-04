// notice.js

import { loadEditorScript, showNoticeModal } from './modal.js';

let currentPage = 0;
const pageSize = 20;
const gridHeight = 700;
window.editorLoaded = false; // 전역 설정
let searchKeyword = '';

const grid = new tui.Grid({
    el: document.getElementById('grid'),
    bodyHeight: gridHeight,
    scrollY: true,
    scrollX: false,
    data: [],
    columns: [
        { header: '제목', name: 'notTt', width: 600, sortable: true },
        { header: '부서', name: 'detNm', align: 'center', sortable: true },
        { header: '작성자', name: 'empNm', align: 'center', sortable: true },
        { header: '등록일', name: 'notRegDate', align: 'center', sortable: true }
    ],
    rowHeaders: [
        {
            header: '번호',
            type: 'rowNum',
            width: 100
        }
    ]
});

window.addEventListener('DOMContentLoaded', () => {
    searchKeyword = document.getElementById('searchInput').value.trim();
    noticeList(currentPage, searchKeyword);
    document.getElementById('searchBtn').addEventListener('click', searchNotice);
    document.getElementById('writeBtn').addEventListener('click', onWriteNotice);
});

function bindScrollEvent() {
    grid.off('scrollEnd');
    grid.on('scrollEnd', () => {
        const keyword = document.getElementById('searchInput').value.trim();
        noticeList(currentPage, keyword);
    });
}
bindScrollEvent();

async function noticeList(page, keyword = '') {
    try {
        let url = `/SOLEX/api/notice?page=${page}&size=${pageSize}`;
        if (keyword) url += `&keyword=${encodeURIComponent(keyword)}`;

        const res = await fetch(url);
        const data = await res.json();

        const gridData = data.map(n => ({
            notId: n.NOT_ID,
            notTt: n.NOT_TT,
            notCon: n.NOT_CON,
            detNm: n.DET_NM,
            empNm: n.EMP_NM,
            notRegDate: n.NOT_REG_DATE
        }));

        if (page === 0) grid.resetData(gridData);
        else grid.appendRows(gridData);

        currentPage++;
        if (data.length < pageSize) grid.off('scrollEnd');
        else bindScrollEvent();

    } catch (e) {
        console.error('fetch 에러 : ', e);
    }
}

function searchNotice() {
    const keyword = document.getElementById('searchInput').value.trim();
    currentPage = 0;
    bindScrollEvent();
    noticeList(currentPage, keyword);
}

grid.on('click', async (ev) => {
    if (ev.columnName === 'notTt') {
        const noticeId = grid.getRow(ev.rowKey).notId;
        try {
            const res = await fetch(`/SOLEX/api/notice/${noticeId}`);
            const detail = await res.json();
            showNoticeModal('view', detail);
        } catch (e) {
            console.error('공지사항 상세 조회 실패: ', e);
        }
    }
});

function onWriteNotice() {
    showNoticeModal('new');
}

window.changeNotice = async function(mode, noticeId = null) {
    let url = '', method = '', payload = null;

    if (mode == 'new') {
        url = '/SOLEX/api/notice';
        method = 'POST';
    } else if (mode == 'edit') {
        url = `/SOLEX/api/notice/${noticeId}`;
        method = 'PUT';
    } else if (mode == 'delete') {
        url = `/SOLEX/api/notice/${noticeId}`;
        method = 'DELETE';
    }

    if (mode == 'delete') {
        if (!confirm('정말 삭제하시겠습니까?')) return;
    } else {
        const title = document.getElementById('noticeTitle').value.trim();
        const content = window.editorInstance ? window.editorInstance.getMarkdown() : '';
        if (!title || !content) {
            alert('제목과 내용을 모두 입력해 주세요.');
            return;
        }
        payload = { notTt: title, notCon: content };
    }

    try {
        const res = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            ...(payload && { body: JSON.stringify(payload) })
        });

        if (!res.ok) throw new Error(`서버 오류: ${res.status}`);

        alert('성공적으로 처리되었습니다.');
        bootstrap.Modal.getInstance(document.getElementById('exampleModal')).hide();
        currentPage = 0;
        noticeList(currentPage);

    } catch (err) {
        console.error('공지사항 처리 실패:', err);
        alert('공지사항 처리 중 오류가 발생했습니다.');
    }
}

window.noticeEditMode = function(noticeId) {
    fetch(`/SOLEX/api/notice/${noticeId}`)
        .then(res => res.json())
        .then(data => showNoticeModal('edit', data))
        .catch(err => console.error('수정 모드 조회 실패', err));
};
