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
	        { header: '사번', name: 'empNum', align : 'center', sortable: true}, // 백엔드 DTO 필드명 (camelCase)
	        { header: '카테고리', name: 'empCatCd', align : 'center', filter: 'select'},
	        { header: '부서', name: 'empDepCd', align : 'center', filter: 'select' },
	        { header: '팀', name: 'empTeamCd', align : 'center', filter: 'select'},
	        { header: '직급', name: 'empPosCd', align : 'center', filter: 'select'},
	        { header: '사원명', name: 'empNm', align : 'center' },
	        { header: '연락처', name: 'empPhone', align : 'center' },
	        { header: '입사일', name: 'empHire', align : 'center' , sortable: true},
	        { header: '재직상태', name: 'empStsCd', align : 'center', filter: 'select'},
	    ]
	});
	
	const checkAllCheckbox = document.getElementById('check-all');
	
	checkAllCheckbox.addEventListener('change', (event) => {
		if(event.target.checked){
			console.log("checked == "); // ok
			
			// 퇴사자 포함 누르면
			const allData = grid.getData();
			
			allData.forEach(row =>{
				grid.check(row.rowKey);
			});
		} else {
			grid.uncheckAll();
		}
	});

	// 사원 목록 조회 
	async function loadDrafts(page) { //page번호를 인자로 받아 사원목록을 불러옴 (30개당 한페이지)
			try {
				const response = await fetch(`/SOLEX/emp/empList?page=${page}&size=${pageSize}`); // 백엔드api에 fetch요청 30명씩 끊어서 ... 
	      		const rawData = await response.json(); // 받은 데이터를 필요한 형태로 가공
	      		const data = rawData.map(row => ({ // 이게 서버에서 받아온 사원정보 리스트(배열) 이런식으로 들어있음 //
				// .map()함수는 배열의 요소를 다른형태로 바꿔서 새 배열을 만든다는데 뭔말;
				//row는 객체를 하나씩 꺼내서 사용할 필드만 골라 새 객체를 만들어 넣음 (=그리드에 넣을 데이터를 원하는 형태로 변환)
		        empNum: row.empNum,
				empCatCd: row.empCatCd, 
		        empDepCd: row.empDepCd,
		        empTeamCd: row.empTeamCd,
		        empPosCd: row.empPosCd,
				empNm: row.empNm,
				empPhone: row.empPhone,
				empHire: row.empHire,
				empStsCd: row.empStsCd
	      	}));

			//현재 페이지가 첫 페이진지(전자) 아닌지(후자) 판단 후 그리드에 데이터를 새로넣을지 : 붙일지 정하는 코드 

			page === 0 ? grid.resetData(data) : grid.appendRows(data);

			//페이지를 하나 불러왔으니 다음에 불러올때는 ++로 함 
	      	currentPage++;

			//데이터 길이보다 페이지 사이즈가 크면 스크롤 끝 
	      	if (data.length < pageSize) grid.off("scrollEnd");
	    	} catch (error) {
	      		console.error('사원 목록 조회 실패:', error);
	    	}
	  	}

	  	loadDrafts(currentPage); //최조 1페이지 로딩
		grid.on('scrollEnd', () =>  loadDrafts(currentPage)); // 스크롤 끝나면 다음 페이지 로딩

		// 등록 모달 열기 
		document.getElementById('RegisterModalBtn').addEventListener('click', function() {
			  openModal(); 

		});

		// 폼 제출 전 전화번호, 이메일 병합
		function beforeSubmit() {

		   const phone1 = document.getElementById('emp_phone1')?.value || '';
		   const phone2 = document.getElementById('emp_phone2').value || '';
		   const phone3 = document.getElementById('emp_phone3').value || '';
		   const fullPhone = `${phone1}-${phone2}-${phone3}`;

		   const empPhoneInput = document.getElementById('emp_phone');
		   if (empPhoneInput) {
		          empPhoneInput.value = fullPhone;
	      } 
		  
		  const email1 = document.getElementById('emp_email1')?.value || ''; // email 병합
		  	   const email2 = document.getElementById('emp_email2')?.value || '';
		  	   const fullEmail = `${email1}@${email2}`;
		  	   const empEmailInput = document.getElementById('emp_email');
		  	   if (empEmailInput) {
		  	       empEmailInput.value = fullEmail;
		  	   } 
		  	   return true; // 이 함수는 값을 조합하는 역할만 하고, 유효성 검사는 각 버튼의 이벤트 리스너에서 수행합니다.
		  	}

		// 등록 모달 열기
		async function openModal(empData = null) {
		    const modalElement = document.getElementById('exampleModal');
		    const modal = new bootstrap.Modal(modalElement);
		    const modalBody = modalElement.querySelector('.modal-body');
			const modalTitle = document.getElementById('exampleModalLabel');
			
			// 모달 열릴 때마다 기존 내용 제거
			modalBody.innerHTML = '';

			// 폼 생성 후에 select 박스에 옵션을 추가해야함 
			const form = document.createElement('form');
			form.id = 'joinForm'
			
			modalTitle.textContent = '사원 등록';
			
			form.innerHTML = `
							<div class="row mb-4">
							  <div class="col-3">
							    <label>사진</label>
							    <img id="emp_img_preview" alt="사진 미리보기"
							         src="/SOLEX/assets/img/emp/simple_person_pic.jpg"
							         style="width:173px; height:208px; border-radius:4px; object-fit:cover; display:block; margin-bottom:10px;" />
							    <input type="file" class="form-control" name="emp_img" id="emp_img" accept="image/*" required>
							  </div>
				
							  <!-- 🧾 오른쪽: 나머지 입력 폼 -->
							  <div class="col-9">
							    <div class="row mb-3">
							      <div class="col">
							        <label>이름</label>
							        <input type="text" class="form-control" name="emp_nm" required>
							      </div>
							      <div class="col">
							        <label>입사일</label>
							        <input type="date" class="form-control" name="emp_hire" required>
							      </div>
							    </div>
				
							    <div class="row mb-3">
							      <div class="col">
							        <label>성별</label><br>
							        <label id="genderM"><input type="radio" name="emp_gd" value="M" checked> 남</label>
							        <label><input type="radio" name="emp_gd" value="W"> 여</label>
							      </div>
							      <div class="col">
							        <label>생년월일</label>
							        <input type="text" class="form-control" name="emp_birth" id="emp_birth" pattern="\\d{6}" placeholder="ex)990101" required>
							        <input type="hidden" name="emp_pw" id="emp_pw">
							      </div>
							    </div>
				
							    <div class="row mb-3">
							      <div class="col">
							        <label>연락처</label><br>
							        <input type="text" id="emp_phone1" class="form-control d-inline-block w-25" required> -
							        <input type="text" id="emp_phone2" class="form-control d-inline-block w-25" required> -
							        <input type="text" id="emp_phone3" class="form-control d-inline-block w-25" required>
							        <input type="hidden" name="emp_phone" id="emp_phone">
							      </div>
							    </div>
				
							    <div class="row mb-3">
							      <div class="col">
							        <label>이메일</label><br>
							        <input type="text" id="emp_email1" class="form-control d-inline-block w-25" required> @
							        <input type="text" id="emp_email2" class="form-control d-inline-block w-25" required>
							        <input type="hidden" name="emp_email" id="emp_email">
							      </div>
							    </div>
				
							    <div class="row mb-3">
							      <div class="col">
							        <label>직급</label>
							        <select name="empPosCd" id="empPosCd" class="form-control">
							          <option value="">-- 직급을 선택하세요 --</option>
							        </select>
							      </div>
							      <div class="col">
							        <label>사원</label>
							        <select name="empCatCd" id="empCatCd" class="form-control">
							          <option value="">-- 사원을 선택하세요 --</option>
							        </select>
							      </div>
							    </div>
				
							    <div class="row mb-3">
							      <div class="col">
							        <label>부서</label>
							        <select name="empDepCd" id="empDepCd" class="form-control">
							          <option value="">-- 부서를 선택하세요 --</option>
							        </select>
							      </div>
							      <div class="col">
							        <label>팀</label>
							        <select name="empTeamCd" id="empTeamCd" class="form-control">
							          <option value="">-- 팀을 선택하세요 --</option>
							        </select>
							      </div>
							    </div>
				
							    <div class="row mb-3">
							      <div class="col">
							        <label>주소</label><br>
							        <input type="text" id="sample6_postcode" name="emp_pc" class="form-control d-inline-block w-25" placeholder="우편번호" required>
							        <input type="button" onclick="sample6_execDaumPostcode()" value="우편번호 찾기"><br>
							        <input type="text" id="sample6_address" name="emp_add" class="form-control" placeholder="주소" required>
							        <input type="text" id="sample6_detailAddress" name="emp_da" class="form-control" placeholder="상세주소" required>
							        <input type="text" id="sample6_extraAddress" class="form-control" placeholder="참고항목">
							      </div>
							    </div>
							  </div>
							</div>

					<div class="modal-footer">
						<button type="button" class="btn btn-secondary" data-bs-dismiss="modal">닫기</button>
						<button type="submit" class="btn custom-btn-blue btn-success" id="registerBtn">등록</button>
					</div>
				`			

			// ===== 버튼 =====

			let footerDiv = document.createElement('div');

			footerDiv.className = 'modal-footer';

			form.appendChild(footerDiv);

			modalBody.appendChild(form); // 최종 폼 삽입
			
			// 폼이 DOM에 추가된 후, 버튼 요소를 다시 가져옵니다.
			const registerBtn = document.getElementById('registerBtn');
			const modifyBtn = document.getElementById('modifyBtn');
			
			// 폼 데이터 전송 및 공통 후처리 함수
			async function sendData(url, method, payload, isModifyMode) {
			    try {
					
			        const response = await fetch(url, {
			            method: method,
			            headers: { 'Content-Type': 'application/json' },
			            body: JSON.stringify(payload)
			        });

			        alert(isModifyMode ? '직원 정보가 성공적으로 수정되었습니다!' : '직원이 성공적으로 등록되었습니다!');
			        
			   

			    } catch (error) {
			        console.error('데이터 전송 중 오류 발생:', error);
			        alert('오류 발생: ' + error.message);
			    }
			}
			
			// 사진 파일 선택 → 미리보기
			const imgInput   = document.getElementById('emp_img');
			const imgPreview = document.getElementById('emp_img_preview');

			
			// 기본 이미지 경로
			const defaultImg = '/assets/img/emp/simple_person_pic.jpg';
			
			imgInput.addEventListener('change', e => {
			  const file = e.target.files[0];
			  if (!file) {                      // 선택 취소한 경우
			    imgPreview.style.display = 'none';
			    imgPreview.src = defaultImg;
			    return;
			  }

			  const reader = new FileReader();
			  reader.onload = evt => {
			    imgPreview.src = evt.target.result;   // 선택한 이미지 표시
			  };
			  reader.readAsDataURL(file);             // 이미지 파일 → base64 읽기
			});
					// --- 1. 등록 버튼 클릭 이벤트 처리 ---
					if (registerBtn) {
					    registerBtn.addEventListener('click', async function(event) {
					        event.preventDefault(); // type="submit"이므로 기본 제출 방지

					        if (!beforeSubmit()) { // 전화번호, 이메일 조합
					            console.log("beforeSubmit 함수에서 폼 제출이 중단되었습니다.");
					            return;
					        }

					        // 유효성 검사
					        const phone1 = document.getElementById('emp_phone1').value.trim();
					        const phone2 = document.getElementById('emp_phone2').value.trim();
					        const phone3 = document.getElementById('emp_phone3').value.trim();
					        if (!phone1 || !phone2 || !phone3) {
					            alert('연락처를 모두 입력해 주세요.');
					            return;
					        }
					        const email1 = document.getElementById('emp_email1').value.trim();
					        const email2 = document.getElementById('emp_email2').value.trim();
					        if (!email1 || !email2) {
					            alert('이메일을 모두 입력해 주세요.');
					            return;
					        }
					        
					        const url = '/SOLEX/emp';
					        const method = 'POST';

					        const formData = new FormData(form); // 동적으로 생성된 'form' 사용
							formData.append("emp_img", imgFile); // 파일은 직접 append
							
					        const payload = {
					            emp_nm: formData.get('emp_nm'),
					            emp_birth: formData.get('emp_birth').replace(/\./g, '-'), // YYYY.MM.DD -> YYYY-MM-DD
					            emp_hire: formData.get('emp_hire'),
					            emp_gd: document.querySelector('input[name="emp_gd"]:checked')?.value,
					            empCatCd: formData.get('empCatCd'),
					            empDepCd: formData.get('empDepCd'),
					            empPosCd: formData.get('empPosCd'),
					            empTeamCd: formData.get('empTeamCd'),
					            emp_phone: formData.get('emp_phone'),
					            emp_email: formData.get('emp_email'),
					            emp_pc: formData.get('emp_pc'),
					            emp_add: formData.get('emp_add'),
					            emp_da: formData.get('emp_da'),
					            emp_ea: document.getElementById('sample6_extraAddress')?.value || '' // name 없는 경우
					        };

					        console.log('서버로 보낼 등록 데이터 (payload):', payload);
					        await sendData(url, method, payload, false); // isModifyMode = false
					    });
					}

					// --- 2. 수정 버튼 클릭 이벤트 처리 ---
					if (modifyBtn) {
					    modifyBtn.addEventListener('click', async function(event) {
					        event.preventDefault(); // type="button"이므로 기본 동작 없음

					        if (!beforeSubmit()) { // 전화번호, 이메일 조합
					            console.log("beforeSubmit 함수에서 폼 제출이 중단되었습니다.");
					            return;
					        }

					        // 유효성 검사 (수정 시에도 필요하다면 추가)
					        const phone1 = document.getElementById('emp_phone1').value.trim();
					        const phone2 = document.getElementById('emp_phone2').value.trim();
					        const phone3 = document.getElementById('emp_phone3').value.trim();
					        if (!phone1 || !phone2 || !phone3) {
					            alert('연락처를 모두 입력해 주세요.');
					            return;
					        }
					        const email1 = document.getElementById('emp_email1').value.trim();
					        const email2 = document.getElementById('emp_email2').value.trim();
					        if (!email1 || !email2) {
					            alert('이메일을 모두 입력해 주세요.');
					            return;
					        }
							

					        const url = '/SOLEX/emp/modify';
					        const method = 'PUT';

					        const formData = new FormData(form); // 동적으로 생성된 'form' 사용
					        const payload = {}; // 서버로 보낼 데이터 객체

					        // 수정 시 반드시 필요한 사원 번호
					        if (empData && empData.EMP_NUM) {
					            payload.emp_num = empData.EMP_NUM;
							}
							
					        // 폼에서 변경될 수 있는 필드들을 payload에 추가 (모두 포함)
					        payload.empCatCd = formData.get('empCatCd');
					        payload.empDepCd = formData.get('empDepCd');
					        payload.empPosCd = formData.get('empPosCd');
					        payload.empTeamCd = formData.get('empTeamCd');
					        
					        payload.emp_nm = formData.get('emp_nm');
					        payload.emp_birth = formData.get('emp_birth').replace(/\./g, '-'); // YYYY.MM.DD -> YYYY-MM-DD
					        payload.emp_gd = document.querySelector('input[name="emp_gd"]:checked')?.value;
					        payload.emp_phone = formData.get('emp_phone');
					        payload.emp_email = formData.get('emp_email');
					        payload.emp_pc = formData.get('emp_pc');
					        payload.emp_add = formData.get('emp_add');
					        payload.emp_da = formData.get('emp_da');
					        payload.emp_ea = document.getElementById('sample6_extraAddress')?.value || ''; // name 없는 경우


					        console.log('서버로 보낼 수정 데이터 (Payload):', payload);
					        await sendData(url, method, payload, true); // isModifyMode = true
					    });
					}

					// 코드 리스트 fetch 및 select 옵션 추가 (기존과 동일)
					try {
						const response = await fetch('http://localhost:8080/SOLEX/emp/codes');
						const codeList = await response.json();
				        codeList.forEach(code => {
					         const detId = code.DET_ID;
					         const detNm = code.DET_NM;
							 if (detId.startsWith('cat_')) addOption('empCatCd', detId, detNm);
					 			else if (detId.startsWith('pos_')) addOption('empPosCd', detId, detNm);
					 			else if (detId.startsWith('dep_')) addOption('empDepCd', detId, detNm);
					 			else if (detId.startsWith('team_')) addOption('empTeamCd', detId, detNm);
					       });
					} catch (error){
						console.log('코드 불러오기 실패', error);
					}

				   function addOption(selectId, value, text) {
					     const select = document.getElementById(selectId);
					     if (select) {
					       const option = document.createElement('option');
					       option.value = value;
					       option.textContent = text;
					       select.appendChild(option);
					     }
					}

					// === empData에 따른 필드 값 채우기 및 readOnly 설정 ===
					if (empData) { // 수정 모드
						modalTitle.textContent='사원 수정';
						setTimeout(() => {
							
							// DATE 객체 변환
							const date = new Date(empData.EMP_BIRTH);
							const year = date.getFullYear();
							const month = (date.getMonth() + 1).toString().padStart(2,'0');
							const day = date.getDate().toString().padStart(2,'0');
							const formattedDate = `${year}.${month}.${day}`; // YYYY.MM.DD

							document.querySelector('input[name="emp_nm"]').value = empData.EMP_NM;
							document.querySelector('input[name="emp_nm"]').readOnly = true; // 이름 수정 불가

							document.querySelector('input[name="emp_hire"]').value = empData.EMP_HIRE;
							document.querySelector('input[name="emp_hire"]').readOnly = true; // 입사일수정 불가

							// 성별 라디오 버튼
							const genderRadios = document.querySelectorAll('input[name="emp_gd"]');
							genderRadios.forEach(radio => {
								if (radio.value === empData.EMP_GD) {
									radio.checked = true;
								}
								radio.readOnly = true; // 성별은 수정 가능하도록 readOnly 해제
							});
							
							document.querySelector('input[name="emp_birth"]').value = formattedDate;
							document.querySelector('input[name="emp_birth"]').readOnly = true; // 생년월일 수정 가능

							// select 박스 채우기 (모두 수정 가능)
							document.querySelector('select[name="empCatCd"]').value = empData.EMP_CAT_CD;
							document.querySelector('select[name="empDepCd"]').value = empData.EMP_DEP_CD;
							document.querySelector('select[name="empPosCd"]').value = empData.EMP_POS_CD;
							document.querySelector('select[name="empTeamCd"]').value = empData.EMP_TEAM_CD;

							// 전화번호 필드 채우기 (수정 가능)
							const phoneParts = empData.EMP_PHONE.split('-');
							document.getElementById('emp_phone1').value = phoneParts[0];
							document.getElementById('emp_phone1').readOnly = true;
							document.getElementById('emp_phone2').value = phoneParts[1];
							document.getElementById('emp_phone2').readOnly = true;
							document.getElementById('emp_phone3').value = phoneParts[2];
							document.getElementById('emp_phone3').readOnly = true;
							
							// 이메일 필드 채우기 (수정 가능)
							const emailParts = empData.EMP_EMAIL.split('@');
							document.getElementById('emp_email1').value = emailParts[0];
							document.getElementById('emp_email1').readOnly = true;
							document.getElementById('emp_email2').value = emailParts[1];
							document.getElementById('emp_email2').readOnly = true;

							// 주소 필드 채우기 (수정 가능)
							document.getElementById('sample6_postcode').value = empData.EMP_PC;
							document.getElementById('sample6_postcode').readOnly = true;
							document.getElementById('sample6_address').value = empData.EMP_ADD;
							document.getElementById('sample6_address').readOnly = true;
							document.getElementById('sample6_detailAddress').value = empData.EMP_DA;
							document.getElementById('sample6_detailAddress').readOnly = true;
							document.getElementById('sample6_extraAddress').readOnly = true;

							// 버튼 가시성 업데이트
							if (registerBtn) registerBtn.style.display = 'none'; // 수정 모드에서는 등록 버튼 숨김
							if (registerBtn) registerBtn.style.display = 'none'; // 수정 모드에서는 등록 버튼 숨김
							if (modifyBtn) modifyBtn.style.display = ''; // 수정 모드에서는 수정 버튼 표시

						}, 200); // select, input이 다 그려진 후에 값 설정

					} else { // 등록 모드
						// 폼 초기화 (reset 버튼과 유사)
						form.reset(); 
						modalTitle.textContent ='사원 등록';
						// 등록 모드에서는 모든 필드를 수정 가능하게 (readOnly 해제)
						document.querySelector('input[name="emp_img"]').readOnly = false; 
						document.querySelector('input[name="emp_num"]').readOnly = false; 
						document.querySelector('input[name="emp_nm"]').readOnly = false;
						document.querySelector('input[name="emp_hire"]').readOnly = false;
						document.querySelectorAll('input[name="emp_gd"]').forEach(radio => radio.readOnly = false);
						document.querySelector('input[name="emp_birth"]').readOnly = false;
						document.getElementById('emp_phone1').readOnly = false;
						document.getElementById('emp_phone2').readOnly = false;
						document.getElementById('emp_phone3').readOnly = false;
						document.getElementById('emp_email1').readOnly = false;
						document.getElementById('emp_email2').readOnly = false;
						document.getElementById('sample6_postcode').readOnly = false;
						document.getElementById('sample6_address').readOnly = false;
						document.getElementById('sample6_detailAddress').readOnly = false;
						document.getElementById('sample6_extraAddress').readOnly = false;


						// 버튼 가시성 업데이트
						if (registerBtn) registerBtn.style.display = ''; // 등록 모드에서는 등록 버튼 표시
						if (modifyBtn) modifyBtn.style.display = 'none'; // 등록 모드에서는 수정 버튼 숨김
					}

					// 모달 표시
					modal.show();
				}

				// 그리드 행 클릭 이벤트 처리 (수정 모달 열기)
				grid.on('click', async (ev) => {
					if (ev.columnName === 'empNum') {
						const rowData = grid.getRow(ev.rowKey);
						const empNum = rowData.empNum;

						try {
							const response = await fetch(`/SOLEX/emp/codes/${empNum}`);
							const empData = await response.json();
							openModal(empData); // 수정 모드로 모달 열기
						} catch (error) {
							console.error('직원 정보 조회 실패:', error);
							alert('직원 정보를 불러오는 데 실패했습니다.');
						}
					}
				});
				
				
			}); // DOMContentLoaded 끝
			
function sample6_execDaumPostcode() {
	new daum.Postcode({
	    oncomplete: function(data) {
	        // 주소 변수
	        var addr = ''; // 주소
	        var extraAddr = ''; // 참고항목
	
	        // 사용자가 선택한 주소 타입에 따라 해당 주소 값을 가져온다.
	        if (data.userSelectedType === 'R') { // 도로명 주소
	            addr = data.roadAddress;
	        } else { // 지번 주소
	            addr = data.jibunAddress;
	        }
	
	        // 참고항목
	        if(data.userSelectedType === 'R'){
	            if(data.bname !== '' && /[동|로|가]$/g.test(data.bname)){
	                extraAddr += data.bname;
	            }
	            if(data.buildingName !== '' && data.apartment === 'Y'){
	                extraAddr += (extraAddr !== '' ? ', ' + data.buildingName : data.buildingName);
	            }
	            if(extraAddr !== ''){
	                extraAddr = ' (' + extraAddr + ')';
	            }
	            document.getElementById("sample6_extraAddress").value = extraAddr;
	        } else {
	            document.getElementById("sample6_extraAddress").value = '';
	        }
	
	        // 우편번호와 주소 정보를 해당 필드에 넣는다.
	        document.getElementById('sample6_postcode').value = data.zonecode;
	        document.getElementById("sample6_address").value = addr;
	
	        // 상세주소 입력칸으로 포커스 이동
	        document.getElementById("sample6_detailAddress").focus();
	    }
	}).open();
}