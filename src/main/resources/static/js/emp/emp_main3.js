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
	async function loadDrafts(page) {
			try {
				const response = await fetch(`/SOLEX/emp/empList?page=${page}&size=${pageSize}`);
	      		const rawData = await response.json();
	      		const data = rawData.map(row => ({
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
			page === 0 ? grid.resetData(data) : grid.appendRows(data);
	      	currentPage++;

	      	if (data.length < pageSize) grid.off("scrollEnd");
	    	} catch (error) {
	      		console.error('사원 목록 조회 실패:', error);
	    	}
	  	}

	  	loadDrafts(currentPage);
		grid.on('scrollEnd', () =>  loadDrafts(currentPage));
		


		document.getElementById('RegisterModalBtn').addEventListener('click', function() {
			  openModal(); // 등록
			});
			
			async function openModal(empData) {
			    const modalElement = document.getElementById('exampleModal');
			    const modal = new bootstrap.Modal(modalElement);
			    const modalBody = modalElement.querySelector('.modal-body');

		// 모달 열릴 때마다 기존 내용 제거
		modalBody.innerHTML = '';

		// 폼 생성 후에 select 박스에 옵션을 추가해야함 
		const form = document.createElement('form');
		form.setAttribute('id', 'joinForm');
		form.setAttribute('method', 'post');
		form.setAttribute('action', empData ? '/emp/update' : '/emp/registration');
		
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
		  <select name="emp_pos_cd" id="emp_pos_cd" class="form-select">
		    <option value="">-- 직급을 선택하세요 --</option>
		  </select>
		
		  <span>팀</span>
		  <select name="emp_team_cd" id="emp_team_cd" class="form-select">
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
		
		// 최종 폼 삽입
		modalBody.appendChild(form);
		
		
		try {
			const response = await fetch('http://localhost:8080/SOLEX/emp/codes');
			const codeList = await response.json();
					
			//select 박스에 option 추가 
	        codeList.forEach(code => {
		         const detId = code.DET_ID;
		         const detNm = code.DET_NM;
				
		         if (detId.startsWith('cat_')) {
		           addOption('empCatCd', detId, detNm);
		         } else if (detId.startsWith('pos_')) {
		           addOption('emp_pos_cd', detId, detNm);
		         } else if (detId.startsWith('dep_')) {
		           addOption('empDepCd', detId, detNm);
		         } else if (detId.startsWith('team_')) {
		           addOption('emp_team_cd', detId, detNm);
		         }
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
	}
		//tr클릭 시 
			grid.on('click', (ev) => {
				if (ev.columnName === 'empNum') {
					const rowData = grid.getRow(ev.rowKey);
					const modalElement = document.getElementById('exampleModal');

					const modal = new bootstrap.Modal(modalElement);
					modal.show();
		    	}
			});
});












		

	
	
	
