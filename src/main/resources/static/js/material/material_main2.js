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
	        { header: '자재ID', name: 'matId', align : 'center', sortable: true, width:90}, // 백엔드 DTO 필드명 (camelCase)
	        { header: '거래처ID', name: 'cliId', align : 'center', sortable: true, width:90}, // 백엔드 DTO 필드명 (camelCase)
	        { header: '자재코드', name: 'matCd', align : 'center', sortable: true}, // 백엔드 DTO 필드명 (camelCase)
	        { header: '자재명', name: 'matNm', align : 'center', filter: 'select'},
	        { header: '단위', name: 'matUnit', align : 'center', filter: 'select' , width:85},
	        { header: '가격', name: 'matPrice', align : 'center', filter: 'select', width:90},
	        { header: '설명', name: 'matComm', align : 'center', width:300},
	        { header: '등록일', name: 'matRegDate', align : 'center',filter: 'select'},
	        { header: '사용여부', name: 'matIsActive', align : 'center' , sortable: true, width:75}
	    ]
	});
	
	// 1) 거래처 목록을 받아와 <select> 에 채워 주는 공통 함수
	async function fetchAndPopulateClients(selectElement) {
	  try {
	    // 실제 거래처 목록을 반환하는 API 엔드포인트로 바꿔 주세요
	    const response = await fetch('/SOLEX/client/list');
	    if (!response.ok) {
	      throw new Error('서버에서 거래처 목록을 가져오지 못했습니다.');
	    }

	    /* 예시 응답 구조
	       [
	         { "CLI_ID": "cli_001", "CLI_NM": "삼성전자" },
	         { "CLI_ID": "cli_002", "CLI_NM": "LG화학" },
	         ...
	       ]
	    */
	    const clients = await response.json();
		
		/*
			CLI_NM: A컴퍼니
			CLI_ID: 50
		*/
		
	    clients.forEach(cli => {
	      const option = document.createElement('option');
	      option.value = cli.CLI_ID;                       // 거래처 id 까먹지 마리 까먹으면 딱밤 10대
	      option.textContent = cli.CLI_NM;  // 사용자에게 보이는 라벨 
	      selectElement.appendChild(option);
	    });
	  } catch (error) {
	    console.error('거래처 목록 로딩 실패:', error);
	  }
	}
	// 자재 목록 조회 
	async function loadDrafts(page) { //page번호를 인자로 받아 자재목록을 불러옴 (30개당 한페이지)
		try {
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
			matPrice: row.matPrice,
			matComm: row.matComm,
			matRegDate: row.matRegDate,
			matIsActive: row.matIsActive
      	}));

		//현재 페이지가 첫 페이진지(전자) 아닌지(후자) 판단 후 그리드에 데이터를 새로넣을지 : 붙일지 정하는 코드 

		page === 0 ? grid.resetData(data) : grid.appendRows(data);

		//페이지를 하나 불러왔으니 다음에 불러올때는 ++로 함 
      	currentPage++;

		//데이터 길이보다 페이지 사이즈가 크면 스크롤 끝 
      	if (data.length < pageSize) grid.off("scrollEnd");
    	} catch (error) {
      		console.error('자재 목록 조회 실패:', error);
    	}
  	}

		  	loadDrafts(currentPage); //최조 1페이지 로딩
			grid.on('scrollEnd', () =>  loadDrafts(currentPage)); // 스크롤 끝나면 다음 페이지 로딩

			// 등록 모달 열기 
			document.getElementById('RegisterModalBtn').addEventListener('click', function() {
				  openModal(); 

			});
			
			async function fetchAndPopulateMaterialUnits(selectElement) {
				try {
					// ※ 중요: '/SOLEX/material/units'는 실제 자재 단위 목록을 반환하는 API 엔드포인트로 변경해야 합니다.
					// ex) 서버에서 ['BOX', 'EA', 'KG', 'M'] 와 같은 JSON 배열을 반환한다고 가정합니다.
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
						selectElement.appendChild(option);
					});

				} catch (error) {
					console.error('자재 단위 목록 로딩 실패:', error);
				}
			}
			
			// 등록 모달 내부 
			async function openModal(){
				console.log("open Modal inside");
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
				  <input type="text" class="form-control d-inline-block w-25" name="mat_id" required><br>
				`;
				form.appendChild(div1);
				
				// ===== 거래처ID =====
				let div2 = document.createElement('div');
				div2.className = 'mb-3';
				div2.innerHTML = `
					<label>거래처</label>   
					<select name="cli_id" id="cliId" class="form-select d-inline-block w-25">     
				  		<option value="">-- 거래처를 선택하세요 --</option>   
					</select>
				`;
				form.appendChild(div2);
				
				const cliSelect = form.querySelector('#cliId');
				await fetchAndPopulateClients(cliSelect);
				
				// ===== 자재코드 =====
				let div3 = document.createElement('div');
				div3.className = 'mb-3';
				div3.innerHTML = `
				  <label>자재코드</label>
				  <input type="text" class="form-control d-inline-block w-25" name="mat_cd" required><br>
				`;
				form.appendChild(div3);
			
				
				// ===== 자재명 =====
				let div4 = document.createElement('div');
				div4.className = 'mb-3';
				div4.innerHTML = `
				  <label>자재명</label>
				  <input type="text" class="form-control d-inline-block w-25" name="mat_nm" required><br>
				`;
				form.appendChild(div4);
				
				let inlineDiv = document.createElement('div');
				inlineDiv.className = 'inline-container';
				inlineDiv.innerHTML = `
					<span>단위</span>
						<select name="matUnit" id="matUnit" class="form-select">
							<option value="">-- 단위를 선택하세요 --</option>
						</select>
				`;
				form.appendChild(inlineDiv);	
				
				// 방금 생성한 form 내부의 자재 단위 select 요소를 찾음
				const matUnitSelect = form.querySelector('#matUnit');
				
				// 서버에서 단위 목록을 가져와 select box를 채움
				await fetchAndPopulateMaterialUnits(matUnitSelect);

				// ===== 가격 =====
				let div5 = document.createElement('div');
				div5.className = 'mb-3';
				div5.innerHTML = `
				  <label>가격</label>
				  <input type="text" class="form-control d-inline-block w-25" name="mat_price" required><br>
				`;
				form.appendChild(div5);
				
				
				// ===== 설명 =====
				let div6 = document.createElement('div');
				div6.className = 'mb-3';
				div6.innerHTML = `
				  <label>설명</label>
				  <input type="text" class="form-control d-inline-block w-25" name="mat_comm" required><br>
				`;
				form.appendChild(div6);
				
				
				// ===== 등록일 =====
				let div7 = document.createElement('div');
				div7.className = 'mb-3';
				div7.innerHTML = `
				  <label>등록일</label>
				  <input type="date" class="form-control d-inline-block w-25" name="mat_reg_date" required><br>
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

					        // 유효성 검사
					        const url = '/SOLEX/material/registration';
					        const method = 'POST';

					        const formData = new FormData(form); // 동적으로 생성된 'form' 사용
					        const payload = {
					            cli_id: formData.get('cli_id'),
					            mat_cd: formData.get('mat_cd'),
					            mat_nm: formData.get('mat_nm'),
					            mat_price: formData.get('mat_price'),
					            matUnit: formData.get('matUnit'),
					            mat_comm: formData.get('mat_comm'),
					            mat_reg_date: formData.get('mat_reg_date').replace(/\./g, '-'),
					            mat_is_active: formData.get('matIsActive')
					        };

					        console.log('서버로 보낼 등록 데이터 (payload):', payload);
							
							try {
						           const response = await fetch(url, {
						               method: method,
						               headers: {
						                   'Content-Type': 'application/json'
						               },
						               body: JSON.stringify(payload)
						           });

						           if (response.ok) {
						               // 등록 성공 → 모달 닫기
						               const modalEl = document.getElementById('exampleModal');
						               const modal = bootstrap.Modal.getInstance(modalEl);
						               modal.hide();

						               // 필요 시 목록 새로고침
						               // await loadMaterialList();
						           } else {
						               alert('등록 실패: 서버 오류 발생');
						           }
						       } catch (error) {
						           console.error('전송 중 오류 발생:', error);
						           alert('서버 전송 실패!');
						       }
							
							
					    });
					}// if문 끝
					
					const grid = new YourGridLibrary({ // Replace 'YourGridLibrary' with your actual grid library initialization
					    el: document.getElementById('grid'), // Or whatever your grid element is
					    columns: [
					        { header: '자재ID', name: 'matId', align : 'center', sortable: true, width:90},
					        { header: '거래처ID', name: 'cliId', align : 'center', sortable: true, width:90},
					        { header: '자재코드', name: 'matCd', align : 'center', sortable: true},
					        { header: '자재명', name: 'matNm', align : 'center', filter: 'select'},
					        { header: '단위', name: 'matUnit', align : 'center', filter: 'select' , width:85},
					        {
					            header: '가격',
					            name: 'matPrice',
					            align : 'center',
					            filter: 'select',
					            width:90,
					            // --- Make '가격' column editable ---
					            editor: 'text', // Or 'number' depending on your grid library and desired input type
					            onAfterChange: handleCellEdit // Custom function to handle changes
					        },
					        {
					            header: '설명',
					            name: 'matComm',
					            align : 'center',
					            width:300,
					            // --- Make '설명' column editable ---
					            editor: 'text',
					            onAfterChange: handleCellEdit // Custom function to handle changes
					        },
					        { header: '등록일', name: 'matRegDate', align : 'center',filter: 'select'},
					        {
					            header: '사용여부',
					            name: 'matIsActive',
					            align : 'center',
					            sortable: true,
					            width:75,
					            // --- Make '사용여부' column editable ---
					            // For boolean, a checkbox or select box is usually better.
					            // Assuming '사용여부' is a boolean or string like 'Y'/'N'
					            editor: {
					                type: 'select', // Or 'checkbox' if your grid supports it directly
					                options: {
					                    listItems: [
					                        { text: '사용', value: 'Y' }, // Or true
					                        { text: '미사용', value: 'N' } // Or false
					                    ]
					                }
					            },
					            onAfterChange: handleCellEdit // Custom function to handle changes
					        }
					    ],
					    // ... other grid options like data, etc.
					});

					// 자재 목록 조회
					async function loadDrafts(page) {
					    try {
					        const response = await fetch(`/SOLEX/material/materialList?page=${page}&size=${pageSize}`);
					        if (!response.ok) {
					            throw new Error('서버에서 자재 목록을 가져오지 못했습니다.');
					        }
					        const rawData = await response.json();
					        const data = rawData.map(row => ({
					            matId: row.matId,
					            cliId: row.cliId,
					            matCd: row.matCd,
					            matNm: row.matNm,
					            matUnit: row.matUnit,
					            matPrice: row.matPrice,
					            matComm: row.matComm,
					            matRegDate: row.matRegDate,
					            // Ensure matIsActive is in a format your editor expects (e.g., 'Y'/'N' or true/false)
					            matIsActive: row.matIsActive === true ? 'Y' : 'N' // Example: if backend sends boolean, convert to 'Y'/'N'
					        }));

					        grid.resetData(data); // Assuming your grid has a method to set data
					        console.log("자재 목록 로드 완료:", data);
					    } catch (error) {
					        console.error('자재 목록 로딩 실패:', error);
					    }
					}

					// --- Function to handle cell edits and send updates to the backend ---
					async function handleCellEdit(ev) {
					    // This event object structure depends heavily on your grid library.
					    // Common properties are: rowKey, columnName, value (new value), oldValue
					    const { rowKey, columnName, value, instance } = ev; // 'instance' might be the grid itself

					    // Get the full row data for the edited row to extract matId
					    // Your grid library should provide a way to get row data by rowKey.
					    // Example for TOAST UI Grid:
					    const rowData = instance.getRow(rowKey);
					    const matId = rowData.matId;

					    if (!matId) {
					        console.error('업데이트할 자재 ID를 찾을 수 없습니다.');
					        return;
					    }

					    console.log(`Row ${rowKey} - Column '${columnName}' changed to: ${value}`);

					    // Prepare the data to send to the backend
					    const updatePayload = {
					        matId: matId,
					        [columnName]: value // Dynamically set the updated field
					    };

					    // Special handling for matIsActive if it needs conversion back to boolean or specific string for backend
					    if (columnName === 'matIsActive') {
					        updatePayload.matIsActive = (value === 'Y'); // Convert 'Y'/'N' back to boolean for backend if needed
					        // Or keep as 'Y'/'N' if your backend expects that string
					    }

					    try {
					        const response = await fetch('/SOLEX/material/update', { // Replace with your actual update API endpoint
					            method: 'PUT', // Or 'POST', depending on your backend API design for updates
					            headers: {
					                'Content-Type': 'application/json',
					                // 'X-CSRF-TOKEN': 'your-csrf-token' // If you're using CSRF protection
					            },
					            body: JSON.stringify(updatePayload)
					        });

					        if (!response.ok) {
					            const errorText = await response.text();
					            throw new Error(`자재 정보 업데이트 실패: ${response.status} - ${errorText}`);
					        }

					        const result = await response.json();
					        console.log('자재 정보 업데이트 성공:', result);

					        // Optional: Show a success message to the user
					        alert('자재 정보가 성공적으로 업데이트되었습니다.');

					    } catch (error) {
					        console.error('자재 정보 업데이트 중 오류 발생:', error);
					        // Optional: Revert the cell's value in the grid if the update failed
					        // This depends on your grid library's API.
					        // For example: instance.setValue(rowKey, columnName, oldValue);
					        alert(`자재 정보 업데이트 실패: ${error.message}`);
					    }
					}

					// Initial load of data when the page loads
					document.addEventListener('DOMContentLoaded', () => {
					    loadDrafts(1); // Load the first page of data
					});
					
					
					
					
					
	}//
});
