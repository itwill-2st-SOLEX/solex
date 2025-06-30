document.addEventListener('DOMContentLoaded', function(){
	
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
	
	// 거래처 목록을 받아와 <select> 에 채워 주는 공통 함수
	async function fetchAndPopulateClients(selectElement) {
	  try {
	    // 실제 거래처 목록을 반환하는 API 엔드포인트로 바꿔 주세요
	    const response = await fetch('/SOLEX/clients/name');
	    if (!response.ok) {
	      throw new Error('서버에서 거래처 목록을 가져오지 못했습니다.');
	    }

	    const clients = await response.json();
		
	    clients.forEach(cli => {
	      const option = document.createElement('option');
	      option.value = cli.CLI_ID; // 거래처 id 까먹지 마리 까먹으면 딱밤 10대
	      option.textContent = cli.CLI_NM;  // 사용자에게 보이는 라벨 
	      selectElement.appendChild(option);
	    });
	  } catch (error) {
	    console.error('거래처 목록 로딩 실패:', error);
	  }
	}
	
	// 자재 단위 select 박스 채우기
	async function fetchAndPopulateMaterialUnits(selectElement) {
		try {
			const response = await fetch('/SOLEX/material/code'); 
			if (!response.ok) {
				throw new Error('서버에서 단위 목록을 가져오는 데 실패했습니다.');
			}
			const units = await response.json();

			// 받아온 단위 목록으로 option 태그를 생성하여 select box에 추가
			units.forEach(unit => {
				const option = document.createElement('option');
				option.value = unit.DET_ID;
				option.textContent = unit.DET_NM;
				console.log('option = ', option);
				selectElement.appendChild(option);
			});

		} catch (error) {
			console.error('자재 단위 목록 로딩 실패:', error);
		}
	}
	
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

//			// 등록 버튼 (모달 열기) 
			document.getElementById('RegisterModalBtn').addEventListener('click', function() {
				  openModal(); 
			});
			
			// 등록 모달 내부 
			async function openModal(){
				const modalElement = document.getElementById('exampleModal');
				const modal = new bootstrap.Modal(modalElement);
				const modalBody = modalElement.querySelector('.modal-body');
				const modalTitle = document.getElementById('exampleModalLabel');
				
				modalBody.innerHTML = ''; // 모달 열릴때마다 기존 내용 제거
				
				// 폼 생성 후 select box에 옵션 추가 form 요소를 동적으로 생성하고 기본속성을 설정 
				const form = document.createElement('form'); // 이게 dom api를 사용해 html 요소 생성
				form.setAttribute('id','materialForm'); // 폼요소에 id 속성을 부여하고 materialForm이라는 값을 넣음 
				form.setAttribute('method','post');
				
					// ===== 자재ID =====
					let div1 = document.createElement('div');
					div1.className = 'mb-3'; 
					div1.innerHTML = `
					  <label>자재ID</label>
					  <input type="text" class="form-control d-inline-block " name="mat_id" required><br>
					`;
					form.appendChild(div1);
					
					// ===== 자재코드 =====
					let div3 = document.createElement('div');
					div3.className = 'mb-3';
					div3.innerHTML = `
					  <label>자재코드</label>
					  <input type="text" class="form-control d-inline-block " name="mat_cd" required><br>
					`;
					form.appendChild(div3);
				
					// ===== 자재명 =====
					let div4 = document.createElement('div');
					div4.className = 'mb-3';
					div4.innerHTML = `
					  <label>자재명</label>
					  <input type="text" class="form-control d-inline-block " name="mat_nm" required><br>
					`;
					form.appendChild(div4);
					
					// ===== 거래처ID =====
					let div2 = document.createElement('div');
					div2.className = 'mb-3';
					div2.innerHTML = `
						<label>거래처</label>   
						<select name="cli_id" id="cliId" class="form-select d-inline-block">     
					  		<option value="">-- 거래처를 선택하세요 --</option>   
						</select>
					`;
					form.appendChild(div2);
					
					const cliSelect = form.querySelector('#cliId');
					await fetchAndPopulateClients(cliSelect);
					
					// 단위
					let inlineDiv = document.createElement('div');
					inlineDiv.className = 'inline-container';
					inlineDiv.innerHTML = `
						<span>단위</span>
							<select name="matUnit" id="matUnit" class="form-select">
								<option value="">-- 단위를 선택하세요 --</option>
							</select><br>
					`;
					form.appendChild(inlineDiv);	
					
					// 방금 생성한 form 내부의 자재 단위 select 요소를 찾음
					const matUnitSelect = form.querySelector('#matUnit');
					
					// 서버에서 단위 목록을 가져와 select box를 채움 
					await fetchAndPopulateMaterialUnits(matUnitSelect);
	
					// ===== 설명 =====
					let div6 = document.createElement('div');
					div6.className = 'mb-3';
					div6.innerHTML = `
					  <label>설명</label>
					  <input type="text" class="form-control d-inline-block" name="mat_comm" required><br>
					`;
					form.appendChild(div6);
	
									
					// ===== 가격 =====
					let div5 = document.createElement('div');
					div5.className = 'mb-3';
					div5.innerHTML = `
					  <label>가격</label>
					  <input type="text" class="form-control d-inline-block" name="mat_price" required><br>
					`;
					form.appendChild(div5);
					
					
					// ===== 등록일 =====
					let div7 = document.createElement('div');
					div7.className = 'mb-3';
					div7.innerHTML = `
					  <label>등록일</label>
					  <input type="date" class="form-control d-inline-block" name="mat_reg_date" required><br>
					`;
					form.appendChild(div7);
					
					// ===== 버튼 =====
					let footerDiv = document.createElement('div');
					footerDiv.className = 'modal-footer';
					footerDiv.innerHTML = `
					  <button type="submit" class="btn custom-btn-blue btn-success" id="registerBtn">등록</button>
					  <button type="reset" class="btn btn-secondary" id="resetBtn">초기화</button>
					  <button type="button" class="btn btn-danger" data-bs-dismiss="modal">취소</button>
					`;

					form.appendChild(footerDiv);
					modalBody.appendChild(form); // 최종 폼 삽입
				
				// 폼이 DOM에 추가된 후, 버튼 요소를 다시 가져옵니다.
				const registerBtn = document.getElementById('registerBtn');
				
				// 폼 데이터 전송 및 공통 후처리 함수
				async function sendData(url, method, payload, isModifyMode) {
				    try {
				        const response = await fetch(url, {
				            method: method,
				            headers: { 'Content-Type': 'application/json' },
				            body: JSON.stringify(payload)
				        });

				        if (!response.ok) {
				            throw new Error(`서버 오류: ${response.status} - ${errorData.message || '알 수 없는 오류'}`);
				        }

				        const modalInstance = bootstrap.Modal.getInstance(document.getElementById('exampleModal'));
				        if (modalInstance) {
				            modalInstance.hide();
				        }
				        loadDrafts(0); // 자재 목록 새로고침 (첫 페이지부터 다시 로드)

				    } catch (error) {
				        console.error('데이터 전송 중 오류 발생:', error);
				        alert('오류 발생: ' + error.message);
				    }
				}// try 끝
				
				// --- 1. 등록 버튼 클릭 이벤트 처리 ---
					if (registerBtn) {
					    registerBtn.addEventListener('click', async function(event) {
					        event.preventDefault(); // type="submit"이므로 기본 제출 방지

					        const formData = new FormData(form); // 동적으로 생성된 'form' 사용
					        const payload = {
					            cli_id: formData.get('cli_id'),
					            mat_cd: formData.get('mat_cd'),
					            mat_nm: formData.get('mat_nm'),
					            mat_price: formData.get('mat_price'),
					            matUnit: formData.get('matUnit'),
					            mat_comm: formData.get('mat_comm'),
					            mat_reg_date: formData.get('mat_reg_date').replace(/\./g, '-'),
					            mat_is_active: formData.get('mat_is_active')
					        };

					        console.log('서버로 보낼 등록 데이터 (payload):', payload);
							
							try {
						           const response = await fetch(`/SOLEX/material/registration`, {
						               method: 'POST',
						               headers: {
						                   'Content-Type': 'application/json'
						               },
						               body: JSON.stringify(payload)
						           });

						           if (response.ok) {
						               // 등록 성공 → 모달 닫기
						               const modalEl = document.getElementById('exampleModal');
						               const modal = bootstrap.Modal.getInstance(modalEl).hide();

						           } else {
						               alert('등록 실패: 서버 오류 발생');
						           }
						       } catch (error) {
						           console.error('전송 중 오류 발생:', error);
						           alert('서버 전송 실패!');
						       }
							
							
					    });
					}// if문 끝
	}//모달 내부 끝
});
