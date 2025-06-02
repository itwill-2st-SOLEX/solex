document.addEventListener('DOMContentLoaded', () => {
  const codeList = window.codeList || [];  // HTML에서 넘겨준 데이터 (없으면 빈 배열)

  const grid = new tui.Grid({
    el: document.getElementById('code-grid'),
    data: codeList,
    bodyHeight: 300,
    columns: [
      { header: '순번', name: 'COD_ID' },
      { header: '항목명', name: 'COD_NM' },
      { header: '사용여부', name: 'COD_YN' },
      { header: '등록일시', name: 'COD_REG_TIME' }
    ]
  });
});
