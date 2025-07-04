$(function() {	
	let currentPage = 0;
	const pageSize = 30;

	const grid = new tui.Grid({
	    el: document.getElementById('grid'),
	    data: [], // 초기에는 빈 배열로 시작, scrollMoreClient 함수가 데이터를 채움
	    height: 600,
	    bodyHeight: 500,
	    autoWidth: true,
	    columns: [
			{ header: '자재ID', name: 'matId', align : 'center', sortable: true, width:90}, 
			{ header: '거래처ID', name: 'cliId', align : 'center', sortable: true, width:90}, 
	        { header: '자재코드', name: 'matCd', align : 'center', sortable: true}, 
	        { header: '자재명', name: 'matNm', align : 'center', filter: 'select'},
	        { header: '단위', name: 'matUnit', align : 'center', filter: 'select' , width:85},
	        { header: '가격', name: 'mat_price', align : 'center', filter: 'select', width:90, editor: 'text',
				onBeforeChange: (ev) => {  // 그리드 셀의 값이 변경되기 직전에 특정 로직 수행 
				      const newValue = ev.value; // 변경될 새로운 값 가져오기
					  
				      if (isNaN(newValue) || parseFloat(newValue) < 0) {
				          alert('가격은 유효한 숫자여야 합니다.');
				          return false; // Prevent the change 아래에 안 바뀌도록 코드 추가함
				      }
				      return true; // Allow the change
				  },
			},
	        { header: '설명', name: 'mat_comm', align : 'center', width:300, editor: 'text'},
	        { header: '등록일', name: 'matRegDate', align : 'center',filter: 'select'},
	        { header: '사용여부', name: 'mat_is_active', align : 'center' , sortable: true, width:75,
				editor: {
				    type: 'select',
				    options: {
				        listItems: [ //드롭다운 박스에 표시될 항목의 목록들
				            { text: '사용', value: 'Y' },
				            { text: '미사용', value: 'N' }
				        ]
				    }
				}, formatter: (ev) => { // 셀에 표시될 값을 화면에 맞게 변환
				    return ev.value === 'Y' ? '사용' : '미사용'; 
				}
			}
	    ]
	}); //tui 그리드 가져오기 끝
	
	// 자재 목록 조회 
	async function loadDrafts(page) { //page번호를 인자로 받아 자재목록을 불러옴 (30개당 한페이지)

		const response = await fetch(`/SOLEX/material/materialList?page=${page}&size=${pageSize}`); // 백엔드api에 fetch요청 30명씩 끊어서 ... 
		const rawData = await response.json(); // 받은 데이터를 필요한 형태로 가공
		const data = rawData.map(row => ({ // 이게 서버에서 받아온 사원정보 리스트(배열) 이런식으로 들어있음 //
			// .map()함수는 배열의 요소를 다른형태로 바꿔서 새 배열을 만든다는데 뭔말;
			// row는 객체를 하나씩 꺼내서 사용할 필드만 골라 새 객체를 만들어 넣음 (=그리드에 넣을 데이터를 원하는 형태로 변환)
		    matId: row.matId,
			cliId: row.cliId, 
		    matCd: row.matCd,
		    matNm: row.matNm,
		    matUnit: row.matUnit,
			mat_price: row.matPrice,
			mat_comm: row.matComm,
			matRegDate: row.matRegDate,
			mat_is_active: row.matIsActive
		}));

		//현재 페이지가 첫 페이진지(전자) 아닌지(후자) 판단 후 그리드에 데이터를 새로넣을지 : 붙일지 정하는 코드 
		page === 0 ? grid.resetData(data) : grid.appendRows(data);

		//페이지를 하나 불러왔으니 다음에 불러올때는 ++로 함 
      	currentPage++;

		//데이터 길이보다 페이지 사이즈가 크면 스크롤 끝 
      	if (data.length < pageSize) grid.off("scrollEnd");
  
  	}

	loadDrafts(currentPage); //최조 1페이지 로딩
	grid.on('scrollEnd', () =>  loadDrafts(currentPage)); // 스크롤 끝나면 다음 페이지 로딩

	//테이블에서 바로 수정할 수 있는 코드 
	grid.on('afterChange', async (ev) => { // 그리드에서 셀이 편집될때 afterchange 이벤트가 발생
	    for (const change of ev.changes) {
	        const { rowKey, columnName, value, oldValue } = change;
			
			if (columnName === 'matPrice' || columnName === '다른_가격_컬럼_이름') { // 'matPrice'는 예시, 실제 가격 컬럼 이름으로 변경
	            const parsedValue = parseFloat(value);
	            if (isNaN(parsedValue) || parsedValue < 0) {
	                alert('가격은 유효한 숫자이며 0보다 작을 수 없습니다. 원래 값으로 되돌립니다.');
	                // 유효하지 않은 경우, 강제로 원래 값으로 되돌립니다.
	                grid.setValue(rowKey, columnName, oldValue, false);
	                continue; // 다음 변경으로 넘어갑니다. (백엔드 전송 방지)
	            }
	        }
			
	        const rowData = grid.getRow(rowKey);
	        const matId = rowData.matId;

	        // 여기서 백엔드로 변경된 값을 담아 전송함 
	        const updatePayload = {
	            matId: matId,
				n: columnName,
	            v: value
			}

	        try {
	            const response = await fetch('/SOLEX/material/updateGridCell', { // Your backend API endpoint
	                method: 'PUT', 
	                headers: {
	                    'Content-Type': 'application/json',
	                },
	                body: JSON.stringify(updatePayload)
	            });

	            const result = await response.json();
				
				if (response.ok && result.status === 'success') {
				       console.log('Material update successful:', result);
				       alert('자재 정보가 성공적으로 업데이트되었습니다.');
				   } else {
				       // 백엔드에서 에러 응답을 보낸 경우 (result.status === 'error')
				       console.error('Material update failed from server:', result.message);
				       alert(`자재 정보 업데이트 실패: ${result.message}`);
				       grid.setValue(rowKey, columnName, oldValue, false);
				   }
				
	        } catch (error) {
	            console.error('Error updating material:', error);
	            alert(`자재 정보 업데이트 실패: ${error.message}`);
	            grid.setValue(rowKey, columnName, oldValue, false); 
	        }
	    }
	}); //테이블 수정코드 fin
	
	/**  공통: JSON 응답(fetch) ― 바디가 없으면 기본값 반환 */
	async function fetchJson(url, defaultValue = null) {
	  const res = await fetch(url);

	  // 204 No Content 같이 바디가 없는 성공 응답
	  if (res.status === 204) return defaultValue;

	  if (!res.ok) throw new Error(`${url} 오류`);

	  const text = await res.text();       // 바로 json() 하지 말고 text() 로 읽음
	  if (!text) return defaultValue;      // Content-Length: 0 인 경우

	  return JSON.parse(text);
	}
	
	// 거래처 목록을 받아와 <select> 에 채워 주는 공통 함수
	async function loadClientNames() {
		
		const $sel = $('#cliId');
		
		// 이미 한 번 불러왔으면 재요청 생략
		if ($sel.data('loaded')) return;
		
		try {
		    const list = await fetchJson('/SOLEX/clients/name', []);

		    list.forEach(cli => {
				$('<option>', {
		        	value: cli.CLI_ID,                // 실제 값 
		        	text : cli.CLI_NM      // 사용자에게 보이는 글자
		      	}).appendTo($sel);
		    });

		    $sel.data('loaded', true);      // 플래그
			
		} catch (err) {
		    	console.error('거래처 목록 로딩 실패', err);
		    	alert('거래처 목록 로딩 실패');
		}
	}
	
	// 거래처 목록을 받아와 <select> 에 채워 주는 공통 함수
	async function loadMaterialUnits() {
		
		const $sel = $('#matUnit');
		
		// 이미 한 번 불러왔으면 재요청 생략
		if ($sel.data('loaded')) return;
		
		try {
		    const list = await fetchJson('/SOLEX/material/code', []);

		    list.forEach(unit => {
				$('<option>', {
		        	value: unit.DET_ID,                // 실제 값 
		        	text : unit.DET_NM      // 사용자에게 보이는 글자
		      	}).appendTo($sel);
		    });

		    $sel.data('loaded', true);      // 플래그
			
		} catch (err) {
		    	console.error('거래처 목록 로딩 실패', err);
		    	alert('자재 단위 목록 로딩 실패');
		}
	}
	
	
	
	const $materialModal  = $('#exampleModal');

	$materialModal .on('show.bs.modal', loadClientNames);   // 거래처
	$materialModal .on('show.bs.modal', loadMaterialUnits); // 자재 단위
	
	$materialModal.on('hidden.bs.modal', function () {
		  const $modal = $(this);

		  // ① <form> 태그가 있다면 한 줄로 끝!
		  $modal.find('form')[0]?.reset();

		  // ② 별도 <form>이 없을 때는 각 요소를 개별 초기화
		  $modal.find('input, textarea').val('');
		  $modal.find('select').prop('selectedIndex', 0);   // 첫 옵션으로
		});
	
	// 자재 등록
	$('#submitMaterial').on('click', async function () {
		
		const $modal    = $('#exampleModal');
		
		const matCd    = $.trim($modal.find('#matCd').val()); 
		const matNm    = $.trim($modal.find('#matNm').val());
		const cliId    = $modal.find('#cliId').val();
		const matUnit  = $modal.find('#matUnit').val(
		); 
		const matComm    = $.trim($modal.find('#matComm').val()); 
		const matPrice    = $.trim($modal.find('#matPrice').val()); 
				
		/* --- 검증 --- */
//	  	나중에 지피티 한테 물어봐서 유효성 검증 추가하삼

	  	/* --- 서버로 전송할 데이터 --- */
	  	const payload = {
	    	matCd     : matCd,
	    	matNm : matNm,
	    	cliId   : cliId,
			matUnit    : matUnit,
			matComm   : matComm,
			matPrice    : matPrice
	  	};
				
		try {
	    	const res = await fetch('/SOLEX/material', {  // ← POST 엔드포인트
	  			method  : 'POST',
	      		headers : { 'Content-Type': 'application/json' },
	      		body    : JSON.stringify(payload)
	    	});
	    	if (!res.ok) throw new Error(`에러러러러러러`);

	    	alert('자재가 등록되었습니다@@');
	    	$modal.modal('hide');

	    	// 목록 새로고침
	    	currentPage = 0;
	    	loadDrafts(currentPage);
  		} catch (err) {
    		console.error('자재 등록 실패', err);
    		alert('자재 등록 실패');
  		}
	});		
});
