document.addEventListener('DOMContentLoaded', function(){

	let currentPage = 0;
	const pageSize = 30;

	const grid = new tui.Grid({
	    el: document.getElementById('grid'),
	    data: [], // 초기에는 빈 배열로 시작, scrollMoreClient 함수가 데이터를 채움
	    height: 700,
	    bodyHeight: 500,
	    autoWidth: true,
	    columns: [
	        { header: '사번', name: 'empNum' }, // 백엔드 DTO 필드명 (camelCase)
	        { header: '카테고리', name: 'empCatCd' },
	        { header: '부서', name: 'empDepCd' },
	        { header: '팀', name: 'empTeamCd'},
	        { header: '직급', name: 'empPosCd' },
	        { header: '사원명', name: 'empNm' },
	        { header: '연락처', name: 'empPhone' },
	        { header: '입사일', name: 'empHire'},
	        { header: '재직상태', name: 'empStsCd'}
	        
	    ]
	});
	
	//사원 목록 조회
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
		


		document.getElementById('RegisterModalBtn').addEventListener('click', function() {
			  openModal(); // 등록
		});
			
		// 폰(phone) input 하기 위한 코드
		document.querySelector('.btn-success').addEventListener('click', function (e) {
		  const phone1 = document.getElementById('emp_phone1').value;
		  const phone2 = document.getElementById('emp_phone2').value;
		  const phone3 = document.getElementById('emp_phone3').value;

		  const fullPhone = `${phone1}-${phone2}-${phone3}`;
		  document.getElementById('emp_phone').value = fullPhone;

		  // form.submit();  ← 이거 직접 호출하거나 그냥 submit 버튼이면 자동으로 됨
		});
		
		function beforeSubmit() {
		   const phone1 = document.getElementById('emp_phone1').value;
		   const phone2 = document.getElementById('emp_phone2').value;
		   const phone3 = document.getElementById('emp_phone3').value;

		   const fullPhone = `${phone1}-${phone2}-${phone3}`;
		   document.getElementById('emp_phone').value = fullPhone;

		   return true; // false면 제출 안됨
		 }
		
		async function openModal(empData = null) {
		    const modalElement = document.getElementById('exampleModal');
		    const modal = new bootstrap.Modal(modalElement);
		    const modalBody = modalElement.querySelector('.modal-body');
			
			// 모달 열릴 때마다 기존 내용 제거
			modalBody.innerHTML = '';

			// 폼 생성 후에 select 박스에 옵션을 추가해야함 
			const form = document.createElement('form');
			form.setAttribute('id', 'joinForm');
			form.setAttribute('method', 'post');
			form.setAttribute('onsubmit', 'return beforeSubmit()');
			
			//todo 
//			form.setAttribute('action', empData ? '/emp/update' : '/emp/registration');
			
			// ===== 사번 =====
			let div1 = document.createElement('div');
			div1.className = 'mb-3';
			div1.innerHTML = `
			  <label>사번</label>
			  <input type="text" class="form-control d-inline-block w-25" name="emp_num" required><br>
			`;
			form.appendChild(div1);
			
			// ===== 이름 =====
			let div2 = document.createElement('div');
			div2.className = 'mb-3';
			div2.innerHTML = `
			  <label>이름</label>
			  <input type="text" class="form-control d-inline-block w-25" name="emp_nm" required><br>
			`;
			form.appendChild(div2);
			
			// ===== 입사일 =====
			let div3 = document.createElement('div');
			div3.className = 'mb-3';
			div3.innerHTML = `
			  <label>입사일</label>
			  <input type="date" class="form-control d-inline-block w-25" name="emp_hire" required><br>
			`;
			form.appendChild(div3);
			
			// ===== 성별 =====
			let div4 = document.createElement('div');
			div4.className = 'mb-3';
			div4.innerHTML = `
			  <label>성별</label>
			  <label><input type="radio" name="emp_gd" value="M" checked> 남</label>
			  <label><input type="radio" name="emp_gd" value="W"> 여</label><br>
			`;
			form.appendChild(div4);
			
			// ===== 생년월일 =====
			let div5 = document.createElement('div');
			div5.className = 'mb-3';
			div5.innerHTML = `
			  <label>생년월일</label>
			  <input type="text" class="form-control d-inline-block w-25" name="emp_birth" id="emp_birth" pattern="\\d{6}" placeholder="ex)990101" required>
			  <input type="hidden" name="emp_pw" id="emp_pw"><br>
			`;
			form.appendChild(div5);
			
			// ===== 분류, 부서, 직급, 팀 (코드 리스트는 서버에서 전달 필요) =====
			let inlineDiv = document.createElement('div');
			inlineDiv.className = 'inline-container';
			inlineDiv.innerHTML = `
			  <span>사원</span>
			  <select name="empCatCd" id="empCatCd" class="form-select">
			    <option value="">-- 사원을 선택하세요 --</option>
			  </select>
			  
			  <span>부서</span>
			  <select name="empDepCd" id="empDepCd" class="form-select">
			    <option value="">-- 부서를 선택하세요 --</option>
			  </select>
			
			  <div>직급</div>
			  <select name="empPosCd" id="empPosCd" class="form-select">
			    <option value="">-- 직급을 선택하세요 --</option>
			  </select>
			
			  <span>팀</span>
			  <select name="empTeamCd" id="empTeamCd" class="form-select">
			    <option value="">-- 팀을 선택하세요 --</option>
			  </select>
			`;
			form.appendChild(inlineDiv);
			
			// ===== 연락처 =====
			let div6 = document.createElement('div');
			div6.className = 'mb-3';
			div6.innerHTML = `
			  <label>연락처</label>
			  <input type="text" id="emp_phone1" class="form-control d-inline-block w-25" required> -
			  <input type="text" id="emp_phone2" class="form-control d-inline-block w-25" required> -
			  <input type="text" id="emp_phone3" class="form-control d-inline-block w-25" required><br>
			  <input type="hidden" name="emp_phone" id="emp_phone">
			`;
			form.appendChild(div6);
			
			// ===== 이메일 =====
			let div7 = document.createElement('div');
			div7.className = 'mb-3';
			div7.innerHTML = `
			  <label>이메일</label>
			  <input type="text" id="email1" class="form-control d-inline-block w-25" required> @
			  <input type="text" id="email2" class="form-control d-inline-block w-25" required><br>
			`;
			form.appendChild(div7);
			
			// ===== 주소 =====
			let div8 = document.createElement('div');
			div8.className = 'mb-3';
			div8.innerHTML = `
			  <label>주소</label><br>
			  <input type="text" id="sample6_postcode" name="emp_pc" class="form-control d-inline-block w-25" placeholder="우편번호" required>
			  <input type="button" onclick="sample6_execDaumPostcode()" value="우편번호 찾기"><br>
			  <input type="text" id="sample6_address" name="emp_add" class="form-control" placeholder="주소" required>
			  <input type="text" id="sample6_detailAddress" name="emp_da" class="form-control mt-1" placeholder="상세주소" required>
			  <input type="text" id="sample6_extraAddress" placeholder="참고항목">
			`;
			form.appendChild(div8);
			
			// ===== 버튼 =====
			let footerDiv = document.createElement('div');
			footerDiv.className = 'modal-footer';
			footerDiv.innerHTML = `
			  <button type="submit" class="btn btn-success">등록</button>
			  <button type="reset" class="btn btn-secondary">초기화</button>
			  <button type="button" class="btn btn-danger" data-bs-dismiss="modal">취소</button>
			`;
			form.appendChild(footerDiv);
			
			
			form.addEventListener('submit', async (e) => {
			  e.preventDefault();

			  // 방법 1: input 필드의 값을 먼저 YYYY-MM-DD로 변경 후 FormData 생성
			    const empBirthInput = document.querySelector('input[name="emp_birth"]');
			    const empHireInput = document.querySelector('input[name="emp_hire"]');
			    const originalDisplayDate = empBirthInput.value; // 현재 화면에 보이는 YYYY.MM.DD
			    const dateForServer = originalDisplayDate.replace(/\./g, '-'); // YYYY.MM.DD -> YYYY-MM-DD

			    // 일시적으로 input의 값을 서버 전송용으로 변경
			    empBirthInput.value = dateForServer;

			    const formData = new FormData(form); // 이제 FormData에 YYYY-MM-DD가 들어갑니다.

			    // 다시 원래 화면 표시 형식으로 되돌립니다 (선택 사항, 모달 닫히면 사라질 것이므로 필수는 아님)
			    empBirthInput.value = originalDisplayDate;

			  const url = empData ? '/SOLEX/emp/modify' : '/SOLEX/emp/registration'; // 이걸로 실제 동작 결정

			  const response = await fetch(url, {
			    method: 'POST',
			    body: formData
			  });

			  if (response.ok) {
				location.reload();

			  } else {
			    alert('등록 또는 수정 실패');
				console.error("서버 오류 응답:", errorText);
			  }
			});

			
			// 최종 폼 삽입
			modalBody.appendChild(form);
			
		
			try {
				const response = await fetch('http://localhost:8080/SOLEX/emp/codes');
				const codeList = await response.json();
						
				//select 박스에 option 추가 
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
			
			// === 여기서 empData가 있으면 수정 모드 (수정 필요한 데이터만 수정하도록) ===
			if (empData) {
				console.log('empdata = ', empData);
				setTimeout(() => {
					// DATE 객체 변환하기 
					
					//1. emp_birth를 date로 변환
					const date = new Date(empData.EMP_BIRTH);
					
					//2. date 객체에서 연도 월 일 출력 
					const year = date.getFullYear();
					
					//3. month는 0월부터 시작하므로 실제 월을 구하기 위해선 +1
					const month = (date.getMonth() + 1).toString().padStart(2,'0');
					
					//4. 날짜도 한자리일 경우 0 붙이셈
					const day = date.getDate().toString().padStart(2,'0');
					
					//결합
					const fotmattedDate = `${year}.${month}.${day}`
					
					//name 속성을 #{} 여기 안에 써야함 
					document.querySelector('input[name="emp_num"]').value = empData.EMP_NUM;
					document.querySelector('input[name="emp_num"]').readOnly = true; 
					document.querySelector('input[name="emp_nm"]').value = empData.EMP_NM;
					document.querySelector('input[name="emp_nm"]').readOnly = true;
					document.querySelector('input[name="emp_hire"]').value = empData.EMP_HIRE;
					document.querySelector('input[name="emp_hire"]').readOnly = true;
					document.querySelector(`input[name="emp_gd"][value="${empData.EMP_GD}"]`).checked = true;
					document.querySelector(`input[name="emp_gd"][value="${empData.EMP_GD}"]`).readOnly = true;
					document.querySelector('input[name="emp_birth"]').value = fotmattedDate;
					document.querySelector('input[name="emp_birth"]').readOnly = true;
					
					document.querySelector('select[name="empCatCd"]').value = empData.EMP_CAT_CD;
					document.querySelector('select[name="empDepCd"]').value = empData.EMP_DEP_CD;
					document.querySelector('select[name="empPosCd"]').value = empData.EMP_POS_CD;
					document.querySelector('select[name="empTeamCd"]').value = empData.EMP_TEAM_CD;

					const phoneParts = empData.EMP_PHONE.split('-');
					document.getElementById('emp_phone1').value = phoneParts[0];
					document.getElementById('emp_phone1').readOnly = true;
					document.getElementById('emp_phone2').value = phoneParts[1];
					document.getElementById('emp_phone2').readOnly = true;
					document.getElementById('emp_phone3').value = phoneParts[2];
					document.getElementById('emp_phone3').readOnly = true;

					const emailParts = empData.EMP_EMAIL.split('@');
					document.getElementById('email1').value = emailParts[0];
					document.getElementById('email1').readOnly = true;
					document.getElementById('email2').value = emailParts[1];
					document.getElementById('email2').readOnly = true;

					document.getElementById('sample6_postcode').value = empData.EMP_PC;
					document.getElementById('sample6_postcode').readOnly = true;
					document.getElementById('sample6_address').value = empData.EMP_ADD;
					document.getElementById('sample6_address').readOnly = true;
					document.getElementById('sample6_detailAddress').value = empData.EMP_DA;
					document.getElementById('sample6_detailAddress').readOnly = true;
				}, 200); // select, input이 다 그려진 후에 값 설정
			}

			// 모달 finally show
			modal.show();
		}
		
//		//tr클릭 시 
			grid.on('click', async (ev) => {
				// todo 나중에 empnum 이외에도 추가 하기 
				if (ev.columnName === 'empNum') {
					const rowData = grid.getRow(ev.rowKey); //ev.rowKey는 사용자가 클릭한 그리드의 행 인덱스 
					// grid.getRow()는 해당 rowKey에 해당하는 전체 행 데이터를 객체로 리턴
					console.log('rowData= ', rowData);// 제대로 됨
					
					const empNum = rowData.empNum; //empNum만 빼오기 
					
					const response = await fetch(`/SOLEX/emp/codes/${empNum}`);
					console.log('response = ' , response);// ok
					
				
					const empData = await response.json();
					console.log('empData = ', empData);
					openModal(empData);
		    	}
			});
});












		

	
	
	
