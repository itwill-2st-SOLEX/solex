document.addEventListener('DOMContentLoaded', () => {
  let selectedDetId = null;
  window.processOptions = []; // 공정 목록 저장용

  // 공정 리스트 불러오기 (콜백 기반)
	window.loadProcessOptions = function(callback) {
    $.ajax({
      url: '/SOLEX/process/list',
      method: 'GET',
      success: function (res) {
        window.processOptions = res.map(p => ({
          value: String(p.PRC_ID),
          text: p.PRC_NM,
          ...p
        }));
		console.log("✅ 공정 목록 세팅됨:", window.processOptions);
        if (typeof callback === 'function') callback();
      },
      error: function () {
        alert('공정 목록을 불러오지 못했습니다.');
      }
    });
  }

  // 초기화 함수 정의
  function initGrids() {
    // 제품유형 리스트 그리드
    window.type_list_grid = new tui.Grid({
      el: document.getElementById('type-list-grid'),
      bodyHeight: 600,
      scrollY: true,
      pageOptions: {
        useClient: false,
        type: 'scroll',
        perPage: 20
      },
      rowHeaders: [
        { type: 'checkbox', width: 40 },
        { type: 'rowNum', width: 40, header: 'No.' }
      ],
      data: {
        api: {
          readData: {
            url: '/SOLEX/product/type/list',
            method: 'GET'
          }
        }
      },
      columns: [
        { header: '제품유형ID', name: 'DET_ID', hidden: true },
        { header: '제품유형', name: 'DET_NM', align: 'center' }
      ]
    });

    // 제품유형 클릭 시 공정순서 조회
    window.type_list_grid.on('focusChange', ev => {
      const rowKey = ev.rowKey;
      const rowData = window.type_list_grid.getRow(rowKey);
      if (rowData) {
        selectedDetId = rowData.DET_ID;
        loadTypeProcessList(selectedDetId);
      }
    });

    // 공정순서 조회 함수
    function loadTypeProcessList(DET_ID) {
      $.ajax({
        url: '/SOLEX/typeProcess/list',
        type: 'GET',
        data: { DET_ID: DET_ID },
        success: function (res) {
		  window.loadProcessOptions();
          window.type_process_grid.resetData(res);
        },
        error: function () {
          alert('공정순서 조회에 실패했습니다.');
        }
      });
    }

    // 공정순서 그리드
    window.type_process_grid = new tui.Grid({
      el: document.getElementById('type-process-grid'),
      bodyHeight: 600,
      scrollY: true,
      pageOptions: {
        useClient: false,
        type: 'scroll',
        perPage: 20
      },
      rowHeaders: [
        { type: 'checkbox', width: 40 },
        { type: 'rowNum', width: 40, header: 'No.' }
      ],
      data: [],
      columns: [
        { header: '공정ID', name: 'PRC_ID', hidden: true },
        { header: '제품유형', name: 'PRD_TYPE', hidden: true },
        { header: '공정코드', name: 'PRC_CODE', editable: false, align: 'center', width: 150 },
        {
          header: '공정명',
          name: 'PRC_NM',
          editor: {
            type: 'select',
			options: () => {
				console.log("🧐 editor.options 실행 시점의 processOptions:", window.processOptions);
				const listItems = (window.processOptions || []).map(p => ({
					value: String(p.value),
					text: String(p.text)
				}));
				console.log("📌 listItems 최종 결과:", listItems);
				return { listItems };
			}
          },
		  formatter: ({ value }) => {
		  	console.log("🧾 formatter value:", value);
		  	const item = window.processOptions.find(p => String(p.value) === String(value));
		  	return item ? item.text : value;
		  },
          align: 'center',
          width: 150
        },
        { header: '공정설명', name: 'PRC_DES', editable: false, align: 'center', width: 350 },
        { header: '작업순서', name: 'PCP_SEQ', editor: 'text', align: 'center', width: 120 }
      ]
    });

    // 추가 버튼
    document.querySelector('#tp-add').addEventListener('click', () => {
      if (!selectedDetId) {
        alert('먼저 제품유형을 선택해주세요.');
        return;
      }
      window.type_process_grid.appendRow({
        PRC_CODE: '',
        PRC_NM: '',
        PRC_DES: '',
        PCP_SEQ: '',
        __isNew: true
      }, { focus: true });
    });

    // 저장 버튼
    document.querySelector('#tp-save').addEventListener('click', () => {
      if (!selectedDetId) {
        alert('먼저 제품유형을 선택해주세요.');
        return;
      }
      // 저장 로직 작성 필요
    });

    // 삭제 버튼
    document.querySelector('#tp-delete').addEventListener('click', () => {
      if (!selectedDetId) {
        alert('먼저 제품유형을 선택해주세요.');
        return;
      }

      const checkedRows = window.type_process_grid.getCheckedRows();
      if (checkedRows.length === 0) {
        alert('삭제할 행을 선택해주세요.');
        return;
      }

      const onlyNewRowKeys = checkedRows.filter(row => row.__isNew).map(row => row.rowKey);
      if (onlyNewRowKeys.length === 0) {
        alert('추가된 행만 삭제할 수 있습니다.');
        return;
      }

      onlyNewRowKeys.sort((a, b) => b - a).forEach(rowKey => {
        window.type_process_grid.removeRow(rowKey);
      });
    });
  }

  // 최초 실행 시점에서 processOptions 준비 후 초기화
  window.typeProcess = {
    initProcessGrid: function () {
      if (window.type_list_grid && window.type_process_grid) return;
      loadProcessOptions(initGrids);
    }
  };
});
