$(function() {
    // 현재 페이지
    let currentPage = 0;

    // 무한스크롤 보일 행 수
    const pageSize = 30;

    // tui 그리드 가져오기
    const grid = new tui.Grid({
        //그리드 들고와서 el에 넣고
        el: document.getElementById('grid'),

        //데이터 빈 배열로 만들고
        data: [],
        //높이는 600, 높이는 500(바디하이트), 자동넓이 트루, 컬럼들 채우기
        height: 600,
        bodyHeight: 500,
        autoWidth: true,
        columns: [
            //헤더, 네임, 얼라인(센터)
            { header: '발주ID', name: 'matOrdId', align: 'center', width: 89 },
            { header: '자재ID', name: 'matId', align: 'center', width: 99 },
            { header: '요청자ID', name: 'empId', align: 'center', width: 99 },
            { header: '발주설명', name: 'matComm', align: 'center', width: 600 },
            { header: '발주수량', name: 'matQty', align: 'center', width: 99 },
            { header: '발주 요청일', name: 'matRegDate', align: 'center', width: 118 },
            {
                header: '승인/반려',
                name: 'mat_ok',
                align: 'center',
                width: 230,
                formatter: ({ value, rowKey }) => {
                    // 값이 '승인' 또는 '반려'라면 그대로 출력
                    if (value === '승인' || value === '반려') return value;

                    // 아직 미처리 → 버튼 렌더링
                    return `
                        <button class="btn btn-secondary" name="approval" data-row-key="${rowKey}">승인</button>
                        <button class="btn btn-secondary" name="deny"     data-row-key="${rowKey}">반려</button>`;
                }
            }
        ]
    }); //tui 그리드 가져오기 끝


    //자재 발주 목록 조회
    async function loadMatList(page) {
        const response = await fetch(`/SOLEX/material_orders/materialList?page=${page}&size=${pageSize}`);
        const rawData = await response.json();
        const data = rawData.map(row => ({
            matOrdId: row.matOrdId,
            matId: row.matId,
            empId: row.empId,
            matComm: row.matComm,
            matQty: row.matQty,
            matRegDate: row.matRegDate,
            matEtaDate: row.matEtaDate,
            matAtaDate: row.matAtaDate,
            matlmddate: row.matlmddate
        }));

        //현재 페이지가 첫 페이진지(전자) 아닌지(후자) 판단 후 그리드에 데이터를 새로넣을지 : 붙일지 정하는 코드
        page === 0 ? grid.resetData(data) : grid.appendRows(data);

        //페이지를 하나 불러왔으니 다음에 불러올때는 ++로 함
        currentPage++;

        //데이터 길이보다 페이지 사이즈가 크면 스크롤 끝
        if (data.length < pageSize) grid.off("scrollEnd");
    }

    loadMatList(currentPage); //최조 1페이지 로딩
    grid.on('scrollEnd', () => loadMatList(currentPage)); // 스크롤 끝나면 다음 페이지 로딩

	
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
	
	
	// 자재id 목록 받아오는 함수 - select box
	async function fetchAndPopulateMaterial() {
		
		const $sel = $('#matId');
		if ($sel.data('loaded')) return;
		
		try{
			const response = await fetchJson(`/SOLEX/material_orders/getMatId`, []); // 자재목록을 가져올 api 엔드포인트에 요청

			response.forEach(mat => {
				$('<option>', {
		        	value: mat.MAT_ID,                // 실제 값 
		        	text : mat.MAT_NM      // 사용자에게 보이는 글자
		      	}).appendTo($sel);
		    });

		    $sel.data('loaded', true);      // 플래그
			
		} catch(e) {
			console.error('자재 목록 로딩 실패', e);
			alert('자재 목록 로딩 실패');
		}
	}
	
	
	  // 저장 될 창고 가져오는 함수 - select box
	  async function fetchAndPopulateWarehouse(matId) {
	      selectElement.innerHTML = '<option value="">-- 창고 선택 --</option>';
	      console.log('matId', matId);
	      const url = matId ? `/SOLEX/material_orders/getWarehouse?matId=${matId}` : '/SOLEX/material_orders/getWarehouse';

	      const response = await fetchJson(url);
	      const warehouseList = await response.json(); // 리스트 받아오기

	      warehouseList.forEach(whs => {
	          const option = document.createElement('option');
	          option.value = whs.WHS_ID;
	          option.textContent = whs.WHS_NM;
	          selectElement.appendChild(option);
	      });
	  }

	  // 저장 될 구역 가져오는 함수 - select box
	  async function fetchAndPopulateArea(selectElement, whsId, matId) {
	      selectElement.disabled = false;

	      selectElement.innerHTML = '<option value="">-- 구역 선택--</option>';

	      if (!whsId) {
	          selectElement.disabled = true;
	          return;
	      }

	      const response = await fetchJson(`/SOLEX/material_orders/getArea?whsId=${whsId}&matId=${matId}`);
	      const area = await response.json(); // 리스트 받아오기

	      area.forEach(a => {
	          const option = document.createElement('option');
	          option.value = a.ARE_ID;
	          option.textContent = a.ARE_NM;
	          selectElement.appendChild(option);
	      });
	  }
	  
	const $materialOrdersModal  = $('#exampleModal');
	$materialOrdersModal .on('show.bs.modal', fetchAndPopulateMaterial);   // 자재id
	  
	  
	  
	  
    // 자재발주등록 내에서 등록버튼
	$('#registerBtn').on('click', async function () {
		
		const $modal    = $('#exampleModal');
	
		const matId    = $modal.find('#matId').val();
		const mayQty    = $.trim($modal.find('#mayQty').val()); 
		const matRegDate = $.trim($modal.find('#matRegDate').val());
		const matComm    = $.trim($modal.find('#matComm').val()); 
		
        const payload = {
            matId: matId,
            mayQty: mayQty, 
            matRegDate: matRegDate,
            matComm: matComm
        };
	
        try {
            const response = await fetch(`/SOLEX/material_orders/registration`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                alert('발주 등록 성공');
                window.location.reload();
            } else {
                const errorText = await response.text();
                alert('발주 등록 실패: ' + errorText);
            }
        } catch (error) {
            console.log('전송중 오류발생 = ', error);
            alert('서버 전송 실패');
        }
    });
		
		
	
	

    // 승인버튼 누르면 모달창뜨게
    grid.on('click', async ev => {
        // ev.targetType === 'cell' 일 때만 처리
        if (ev.columnName !== 'mat_ok') return;

        // 클릭된 실제 DOM 버튼
        const btn = ev.nativeEvent.target.closest('button');
        if (!btn) return;

        // 행 rowKey 얻기
        const rowKey = ev.rowKey;
        const rowData = grid.getRow(rowKey);

        if (btn.name === 'approval') {
            openModal('approval', rowKey); //승인 모달 열림
            return;
        }
        if (btn.name === 'deny') {
            try {
                const res = await fetch('/SOLEX/material_orders/materialDeny', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ mat_ord_id: rowData.matOrdId })  // 필요한 키만 전송
                });

                if (!res.ok) {
                    const msg = await res.text();
                    alert('반려 실패: ' + msg);
                    return;
                }

                // 2) 성공하면 UI 갱신
                alert('반려되었습니다.');
                grid.setValue(rowKey, 'mat_ok', '반려');   // 버튼 → '반려' 텍스트
            } catch (err) {
                console.error('[반려 요청 오류]', err);
                alert('서버 통신 중 오류가 발생했습니다.');
            }
        }
    });

    // 모달 오픈
    async function openModal(mode, rowKey = null) {

        const modalEl = document.getElementById('exampleModal');
        const modal = new bootstrap.Modal(modalEl);
        const modalBody = modalEl.querySelector('.modal-body');
        const modalTit = document.getElementById('exampleModalLabel');

        // 모달 열릴때마다 기존 내용 제거
        modalBody.innerHTML = '';


       if (mode === 'approval') { //자재가 저장 될 수 있는 창고 목록 보여주기
            modalTit.textContent = '발주 승인';

            // rowKey를 Number로 변환하여 사용 (Toast UI Grid는 rowKey를 숫자로 관리)
            const approvalRowData = grid.getRow(Number(rowKey));
            console.log("approvalRowData", approvalRowData);

            //폼 생성
            const form = document.createElement('form');
            form.id = 'applyForm';

            form.innerHTML = `
				  <div class="row mb-3">
  					<div class="col">
  						<label>자재ID</label>
  						<div><input type="number" class="form-control d-inline-block" id="matId" name="mat_id" value ="${approvalRowData.matId}" readonly></div>
  					</div>	
					<div class="col">
  						<label>수량</label>
  						<div><input type="number" class="form-control d-inline-block" id="matQty" name="mat_qty" value ="${approvalRowData.matQty}" readonly></div>
  					</div>
  				</div>
				  <div class="row mb-3">
					  <div class="col">
					  	<label>저장될 창고</label>
						<div>
							<select id="whsId" class="form-control d-inline-block" name="whs_id" required>
							<option value="">-- 창고를 선택하세요 --</option></select>
						</div>
					  </div>
					  <div class="col">
					  	<label>구역</label>
						<div>
							<select id="areId" class="form-control d-inline-block" name="are_id" disabled required>
							<option value="">-- 구역을 선택하세요 --</option></select>
						</div>
					  </div>
  				  </div>
				  
			      <div class="text-end">
			        <button id="approveBtn" class="btn btn-primary">승인</button>
			        <button id="cancelBtn"  class="btn btn-secondary" data-bs-dismiss="modal">취소</button>
			      </div>
			    `;
            modalBody.appendChild(form); // 최종 폼 삽입

            // select_box 채우기
            const whsIdSelect = form.querySelector('#whsId');
            await fetchAndPopulateWarehouse(whsIdSelect, approvalRowData.matId);

            const areaIdSelect = form.querySelector('#areId');
            // 초기에는 구역 선택창을 비활성화하고, 창고 선택 전까지는 비워둡니다.
            await fetchAndPopulateArea(areaIdSelect, null, null);

            // (D) 창고 선택 변화 감지 → 구역 다시 로드
            whsIdSelect.addEventListener('change', () => {
                const whsId = whsIdSelect.value;
                fetchAndPopulateArea(areaIdSelect, whsId, approvalRowData.matId); // approvalRowData.matId 전달
            });


            // 승인 버튼
            modalBody.querySelector('#approveBtn').onclick = async () => {
                const matIdValue = document.getElementById('matId').value;
                const areIdValue = document.getElementById('areId').value;
                const whsHisCntVal = document.getElementById('matQty').value;
                const whsIdValue = document.getElementById('whsId').value;

                console.log('areIdValue = ', areIdValue, 'whsHisCntVal = ', whsHisCntVal, 'matIdValue = ', matIdValue);
                console.log("rowKey (approval): " + rowKey); // 이 rowKey가 제대로 넘어왔는지 확인
                console.log("approvalRowData (approval): ", approvalRowData); // approvalRowData 확인


                let res; // res 변수를 try/catch 블록 밖에서 선언

                try {
                    // debugger; // 이 위치에 debugger를 넣어 실행 흐름을 멈추고 변수 값 확인
                    res = await fetch('/SOLEX/material_orders/materialApprove', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            mat_ord_id: approvalRowData.matOrdId, // openModal로 넘어온 rowData 사용
                            mat_id: matIdValue,
                            are_id: areIdValue,
                            whs_his_cnt: whsHisCntVal,
                            whs_id: whsIdValue
                        })
                    });
                    console.log('fetch 응답 객체:', res); // fetch가 성공적으로 완료된 후 res 객체 확인

                } catch (e) {
                    console.error('Fetch 에러 발생:', e); // 실제 네트워크 에러는 여기서 잡힘
                    alert("서버 통신 중 오류가 발생했습니다: " + e.message);
                    return; // 에러 발생 시 이후 코드 실행 중지
                }

                // res.ok가 true인지 false인지에 따라 처리
                if (res.ok) {
                    alert('승인 완료');
                    modal.hide();

                    console.log('Grid 업데이트 시도...');
                    console.log('rowKey (for setValue):', rowKey);
                    console.log('grid object (for setValue):', grid);

                    // grid와 rowKey가 유효한지 다시 한번 확인
                    if (rowKey !== null && rowKey !== undefined && grid && typeof grid.setValue === 'function') {
                        grid.setValue(Number(rowKey), 'mat_ok', '승인'); // rowKey를 Number로 다시 변환
                        grid.refreshCell(Number(rowKey), 'mat_ok');
                        console.log('Grid 업데이트 성공.');
                    } else {
                        console.error('Grid 업데이트 실패: rowKey 또는 grid 객체 유효성 문제.');
                    }

                } else {
                    const errorText = await res.text(); // 응답이 ok가 아니면 에러 메시지 추출
                    console.error('승인 실패 에러 응답:', errorText);
                    alert('승인 실패: ' + errorText);
                }
            };
        }

        modal.show(); // 모달 표시
    }
}); //domContentLoaded 끝