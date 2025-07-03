document.addEventListener('DOMContentLoaded', function(){
	// 현재 페이지 
	let currentPage = 0;
	
	// 무한스크롤 보일 행 수
	const pageSize = 30;
	
	// tui 그리드 가져오기
	const grid = new tui.Grid({
		
		//그리드 들고와서 el에 넣고
		el: document.getElementById('grid'),
		
		//데이터 빈 배열로 만들고
		data : [],
		//높이는 600, 높이는 500(바디하이트), 자동넓이 트루, 컬럼들 채우기
		height : 600,
		bodyHeight : 500,
		autoWidth : true,
		columns: [
			//헤더, 네임, 얼라인(센터)
			{header: '발주ID', name : 'matOrdId', align: 'center', width: 89},
			{header: '자재ID', name : 'matId', align: 'center', width: 99},
			{header: '요청자ID', name : 'empId', align: 'center', width: 99},
			{header: '발주설명', name : 'matComm', align: 'center', width: 330},
			{header: '발주수량', name : 'matQty', align: 'center', width: 99},
			{header: '발주 요청일', name : 'matRegDate', align: 'center', width: 118},
			{header: '실제 입고일', name : 'matAtaDate', align: 'center', width: 118},
			{header: '승인/반려', name : 'mat_ok', align: 'center', width: 250, 
				formatter: ({ value, rowKey }) =>	{
//				   // 값이 '반려'(또는 '승인')라면 그대로 출력
				    if (value === '승인' || value === '반려') return value;

				   // 아직 미처리 → 버튼 렌더링
				   return `
				     <button class="btn btn-secondary" name="approval" data-row-key="${rowKey}">승인</button>
				     <button class="btn btn-secondary" name="deny"     data-row-key="${rowKey}">반려</button> `;
				 }
			 }
		]
	
	}); //tui 그리드 가져오기 끝 
	
	// 자재id 목록 받아오는 함수 - select box
	async function fetchAndPopulateMaterial(selectElement) {
		const response =  await fetch(`/SOLEX/material_orders/getMatId`); // 자재목록을 가져올 api 엔드포인트에 요청
		
		const materials = await response.json(); //응답본문을 json객체로 변환
		
		materials.forEach(mat => { // 가져온 자재목록을 순회하며 dropdown에 추가
			const option = document.createElement('option');
			option.value = mat.MAT_ID;
			option.textContent = mat.MAT_NM;
			selectElement.appendChild(option); 
		});
	}

	// 저장 될 창고 가져오는 함수 - select box
	async function fetchAndPopulateWarehouse(selectElement, matId){
		selectElement.innerHTML = '<option value="">-- 창고 선택 --</option>';
		console.log('matId' , matId);
		const url = matId ? `/SOLEX/material_orders/getWarehouse?matId=${matId}`: '/SOLEX/material_orders/getWarehouse';
		
		const response = await fetch(url); 
		const warehouseList = await response.json(); // 리스트 받아오기
		
		warehouseList.forEach(whs => {
			const option = document.createElement('option');
			option.value = whs.WHS_ID;
			option.textContent = whs.WHS_NM;
			selectElement.appendChild(option);
		});
	}			
	
	// 저장 될 구역 가져오는 함수 - select box
	async function fetchAndPopulateArea(selectElement, whsId, matId){
		selectElement.disabled = false;
		
		selectElement.innerHTML = '<option value="">-- 구역 선택--</option>';
		
		if(!whsId){
			selectElement.disabled = true;
			return;
		}
		
		const response = await fetch(`/SOLEX/material_orders/getArea?whsId=${whsId}&matId=${matId}`);
		const area = await response.json(); // 리스트 받아오기
		
		area.forEach(a => {
			const option = document.createElement('option');
			option.value = a.ARE_ID;
			option.textContent = a.ARE_NM;
			selectElement.appendChild(option);
		});
	}			
	
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
		if(data.length < pageSize) grid.off("scrollEnd");
	}

	loadMatList(currentPage); //최조 1페이지 로딩
	grid.on('scrollEnd', () =>  loadDrafts(currentPage)); // 스크롤 끝나면 다음 페이지 로딩
	
	
	// 발주등록 버튼
	document.getElementById('RegisterModalBtn').addEventListener('click', () => openModal('register'));

	
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
		        method : 'POST',
		        headers: { 'Content-Type': 'application/json' },
		        body   : JSON.stringify({ mat_ord_id: rowData.matOrdId })  // 필요한 키만 전송
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
		
		const modalEl   = document.getElementById('exampleModal');
		const modal     = new bootstrap.Modal(modalEl);
		const modalBody = modalEl.querySelector('.modal-body');
		const modalTit  = document.getElementById('exampleModalLabel');
		
		// 모달 열릴때마다 기존 내용 제거
		modalBody.innerHTML = '';
			
		if (mode === 'register') {
			modalTit.textContent = '자재 발주 등록';
			// 폼 생성
		  	const form = document.createElement('form');
		  	form.id = 'materialOrderForm';
		  	// 안에 내용 틀 js 형식으로 가져오기 
	  		form.innerHTML = `
	  			<div class="modal-body big-box">
	  				<div class="row mb-3">
	  					<div class="col">
	  						<label>자재ID</label>
	  						<div><select id="matId" class="form-control d-inline-block" name= "mat_id" required>
	  						<option value="">-- 자재를 선택하세요 --</option></select>   </div>
	  					</div>	
						<div class="col">
	  						<label>발주 수량</label>
	  						<div><input type="number" class="form-control d-inline-block" name= "mat_qty" required></div>
	  					</div>
	  				</div>
	  				<div class="row mb-3">
	  					<div class="col">
	  						<label>발주 설명</label>
	  						<div><input type="text" class="form-control d-inline-block" name= "mat_comm" required></div>
	  					</div>
	  				</div>
	  				<div class="row mb-3">
	  					<div class="col">
	  						<label>발주 요청일</label>
	  						<div><input type="date" class="form-control d-inline-block" name= "mat_reg_date" required></div>
	  					</div>
	  				</div>
	  				<div class="row mb-3">
	  					<div class="col">
	  						<label>예상 입고일</label>
	  						<div><input type="date" class="form-control d-inline-block" name= "mat_eta_date" required></div>
	  					</div>
	  				</div>
	  				<div class="row mb-3">
	  					<div class="col">
	  						<label>실제 입고일</label>
	  						<div><input type="date" class="form-control d-inline-block" name= "mat_ata_date" required></div>
	  					</div>
	  				</div>
					<input type="hidden" values="${emp_id}">
	  				<div class="modal-footer">
	  					<button type="submit" class="btn custom-btn-blue btn-success" id="registerBtn">등록</button>
	  					<button type="reset" class="btn btn-secondary" id="resetBtn">초기화</button>
	  					<button type="button" class="btn btn-danger" data-bs-dismiss="modal">취소</button>
	  				</div>
	  			</div>
	  		`;
			  				
			const matIdSelect = form.querySelector('#matId');
	  		await fetchAndPopulateMaterial(matIdSelect);
	  		modalBody.appendChild(form); // 최종 폼 삽입
		  		
	  		//실제 등록
	if(registerBtn){
	  			registerBtn.addEventListener('click', async function(event) {
	  				event.preventDefault(); // type="submit"이므로 기본 제출 방지
	  									
	  				const formData = new FormData(form);
	  				const payload = {
	  					mat_id : formData.get('mat_id'),
	  					emp_id : formData.get('emp_id'),
	  					mat_qty : formData.get('mat_qty'),
	  					mat_reg_date : formData.get('mat_reg_date'),
	  					mat_eta_date : formData.get('mat_eta_date'),
	  					mat_ata_date : formData.get('mat_ata_date'),
	  					mat_lmd_date : formData.get('mat_lmd_date'),
	  					mat_comm : formData.get('mat_comm')
	  				};
			  				
	  				console.log('서버로 보낼 데이터 = ', payload);
			  				
	  				try {
	  					const response = await fetch(`/SOLEX/material_orders/registration`, {
	  						method : 'POST',
	  						headers: {
	  							'Content-Type': 'application/json'
	  						},
	  						body:JSON.stringify(payload)
	  					});
	  					
	  					if(response.ok){
	  						alert('발주 등록 성공');
	  						window.location.reload();
	  					} else {
	  						alert('발주 등록 실패');
	  					}
	  				} catch(error) {
	  					console.log('전송중 오류발생 = ', error);
	  					alert('서버 전송 실패');
	  				}
	  			});		
			}
			} else if (mode === 'approval') { //자재가 저장 될 수 있는 창고 목록 보여주기 
			    modalTit.textContent = '발주 승인';

			    const rowData = grid.getRow(Number(rowKey));   // 행 전체 데이터
				console.log("rowData", rowData);
				
				//폼 생성
				const form = document.createElement('form');
				form.id = 'applyForm';
				
			    form.innerHTML = `
				  <div class="row mb-3">
  					<div class="col">
  						<label>자재ID</label>
  						<div><input type="number" class="form-control d-inline-block" id="matId" name= "mat_id" value ="${rowData.matId}" readonly></div>
  					</div>	
					<div class="col">
  						<label>수량</label>
  						<div><input type="number" class="form-control d-inline-block" id= "matQty" name= "mat_qty" value ="${rowData.matQty}" readonly></div>
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
				// select_box 채우기
				const whsIdSelect = form.querySelector('#whsId');
				await fetchAndPopulateWarehouse(whsIdSelect, rowData.matId);
				
				const areaIdSelect = form.querySelector('#areId');
				await fetchAndPopulateArea(areaIdSelect, null, null);
				
				// (D) 창고 선택 변화 감지 → 구역 다시 로드
				whsIdSelect.addEventListener('change', () => {
				  const whsId = whsIdSelect.value;
				  fetchAndPopulateArea(areaIdSelect, whsIdSelect.value, rowData.matId);
				});
				
				
				modalBody.appendChild(form); // 최종 폼 삽입
				
				
			    // 승인 버튼
			    modalBody.querySelector('#approveBtn').onclick = async () => {
					const matIdValue = document.getElementById('matId').value; //자재아이디 - ok
					const areIdValue   = document.getElementById('areId').value;   // 구역아이디 - ok
					const whsHisCntVal = document.getElementById('matQty').value; // 수량 - ok
					const whsIdValue = document.getElementById('whsId').value; // 창고 id - ok
					
					console.log('areIdValue = ', areIdValue , 'whsHisCntVal = ', whsHisCntVal, 'matIdValue = ', matIdValue );
					
				    const res = await fetch('/SOLEX/material_orders/materialApprove', {
				        method : 'POST',
				        headers: {'Content-Type':'application/json'},
				        body   : JSON.stringify({
							 mat_ord_id: rowData.matOrdId,
							 mat_id: matIdValue,
							 are_id: areIdValue,
							 whs_his_cnt: whsHisCntVal,
							 whs_id: whsIdValue
						  })
				     });
				  
			      if (res.ok) {
			        alert('승인 완료');
			        modal.hide();

					//승인 완료 시 버튼 두개가 없어지면서 승인됨으로 변경
					grid.setValue(rowKey, 'mat_ok', '승인');
					
					grid.refreshCell(rowKey, 'mat_ok');
					
			      } else{
					console.log('error = ' , await res.text());
					alert('승인 실패');
				  } 
				    };
				  }
			  modal.show();
										
									
	}// 모달 내부 끝
	

	

	
}); //domContentLoaded