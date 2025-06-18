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
	        { header: '수정일', name: 'matModDate', align : 'center', filter: 'select'},
	        { header: '사용여부', name: 'matIsActive', align : 'center' , sortable: true, width:75}
	    ]
	});
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
					matModDate: row.matModDate,
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
			
			//등록 모달 내부 
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
				  <label>거래처ID</label>
				  <input type="text" class="form-control d-inline-block w-25" name="cli_id" required><br>
				`;
				form.appendChild(div2);
				
				
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
				
				// ===== 단위 =====
				let inlineDiv = document.createElement('div');
				inlineDiv.className = 'inline-container';
				inlineDiv.innerHTML = `
				
					<span>단위</span>
					  <select name="matUnit" id="matUnit" class="form-select">
					    <option value="">-- 단위를 선택하세요 --</option>
					  </select>
	
					  <span>사용여부</span>
					  <select name="matIsActive" id="matIsActive" class="form-select">
					    <option value="">-- 사용여부를 선택하세요 --</option>
					  </select>
				`;
				
				form.appendChild(inlineDiv);
				
				
				
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
				  <input type="text" class="form-control d-inline-block w-25" name=mat_comm" required><br>
				`;
				form.appendChild(div6);
				
				
				// ===== 등록일 =====
				let div7 = document.createElement('div');
				div7.className = 'mb-3';
				div7.innerHTML = `
				  <label>등록일</label>
				  <input type="text" class="form-control d-inline-block w-25" name="mat_reg_date" required><br>
				`;
				form.appendChild(div7);
				
				
				// ===== 수정일 =====
				let div8 = document.createElement('div');
				div8.className = 'mb-3';
				div8.innerHTML = `
				  <label>수정일</label>
				  <input type="text" class="form-control d-inline-block w-25" name="mat_mod_date" required><br>
				`;
				form.appendChild(div8);
				
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
//					if (registerBtn) {
//					    registerBtn.addEventListener('click', async function(event) {
//					        event.preventDefault(); // type="submit"이므로 기본 제출 방지
//
//					        // 유효성 검사
//					       
//					        const url = '/SOLEX/material/registration';
//					        const method = 'POST';
//
//					        const formData = new FormData(form); // 동적으로 생성된 'form' 사용
//					        const payload = {
//					            emp_nm: formData.get('emp_nm'),
//					            emp_birth: formData.get('emp_birth').replace(/\./g, '-'), // YYYY.MM.DD -> YYYY-MM-DD
//					            emp_hire: formData.get('emp_hire'),
//					            emp_gd: document.querySelector('input[name="emp_gd"]:checked')?.value,
//					            empCatCd: formData.get('empCatCd'),
//					            empDepCd: formData.get('empDepCd'),
//					            empPosCd: formData.get('empPosCd'),
//					            empTeamCd: formData.get('empTeamCd'),
//					            emp_phone: formData.get('emp_phone'),
//					            emp_email: formData.get('emp_email'),
//					            emp_pc: formData.get('emp_pc'),
//					            emp_add: formData.get('emp_add'),
//					            emp_da: formData.get('emp_da'),
//					            emp_ea: document.getElementById('sample6_extraAddress')?.value || '' // name 없는 경우
//					        };
//
//					        console.log('서버로 보낼 등록 데이터 (payload):', payload);
//					        await sendData(url, method, payload, false); // isModifyMode = false
//					    });
//					}	

				
					
				
			}
			
});
