$(function() {
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
		
		//tr클릭 시 
		grid.on('click', (ev) => {
			if (ev.columnName === 'empNum') {
				const rowData = grid.getRow(ev.rowKey);
				console.log(rowData.empNum);
//				openModal(rowData.empNum);
			const modalElement = document.getElementById('exampleModal2');
			
			const modal = new bootstrap.Modal(modalElement);
			modal.show();
	    	}
		});
	
});


document.addEventListener('DOMContentLoaded', function(){

	const modal = document.getElementById('exampleModal');
	modal.addEventListener('show.bs.modal', async function(){
		
		// 모달 바디 컨테이너
		const modalBody = modal.querySelector('.modal-body');
		
		// 모달 열릴 때마다 기존 내용 제거
		   modalBody.innerHTML = '';

		// 폼 생성 후에 select 박스에 옵션을 추가해야함 
		const form = document.createElement('form');
		form.setAttribute('id', 'joinForm');
		form.setAttribute('method', 'post');
		form.setAttribute('action', '/emp/registration');
		
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
	});
});























//let categoryOptions = {};
//let positionOptions = {};
//let departmentOptions = {};
//let teamOptions = {};
//let stsOptions = {};
//
////검색기능 
//const currentURL = location.href;
//const url = new URL(currentURL);
//const params = new URLSearchParams(url.search);












//
//function loadEmpList() {
//	$.ajax({
//	   url: "/SOLEX/emp/listJson",
//	   type: "get",
//	   dataType: "json",
//	   success: function(data){
//	     console.log("listJson data = ", data);
//	     const empList = data.empList;
//		 console.log("@@@@@@@@@@empLIst = " , empList);
//	     const tableBody = $("#empTable tbody");
//	     tableBody.empty();  // 초기화
//	
//	     empList.forEach(function(emp){
//	       const row = $("<tr>");
//		   
//		   
//	       // 사번
//	      row.append($("<td class='empNum'>").text(emp.empNum));
//
//		   // 카테고리 select
//		   const catSelect = createSelectBox(categoryOptions, emp.empCatCd ? emp.empCatCd.trim() : null);
//          row.append($("<td>").append(catSelect));
//
//          // 부서 select
//		  const depSelect = createSelectBox(departmentOptions, emp.empDepCd ? emp.empDepCd.trim() : null);
//          row.append($("<td>").append(depSelect));
//
//          // 팀 select
//		  const teamSelect = createSelectBox(teamOptions, emp.empTeamCd ? emp.empTeamCd.trim() : null);
//          row.append($("<td>").append(teamSelect));
//		  
//          // 직급 select
//		  const posSelect = createSelectBox(positionOptions, emp.empPosCd ? emp.empPosCd.trim() : null);
//          row.append($("<td>").append(posSelect));
//		  
//          // 사원명
//          row.append($("<td>").text(emp.empNm));
//
//          // 연락처
//          row.append($("<td>").text(emp.empPhone));
//
//          // 입사일
//          row.append($("<td>").text(formatDate(emp.empHire)));
//
//          // 재직상태 select
//		  const stsSelect = createSelectBox(stsOptions, emp.empStsCd ? emp.empStsCd.trim() : null);
//          row.append($("<td>").append(stsSelect));
//		  
//	      // 테이블에 추가
//	      tableBody.append(row);
//		   
//	     });
//
//	     // 변경 이벤트 바인딩
//	     $("#empTable input").change(requestUpdate);
//	     $("#empTable select").change(requestUpdate);
//	   },
//	   error: function(xhr, status, error){
//	     console.error("AJAX Error (empList):", status, error);
//	   }
//	 });
// }
//
// 
// 
// function createSelectBox(optionMap, selectedValue) {
// 	  const select = $("<select>");
//	  
//// 	  console.log("반환직전 createSelectBox 호출됨 = ", selectedValue);
//	  select.find('option:selected').each(function() {
////	       console.log("  선택된 옵션 값:", $(this).val(), "텍스트:", $(this).text());
//	   });
//	   
// 	  $.each(optionMap, function(code, label){
//		
// 	    const option = $("<option>")
// 	      .val(code)
// 	      .text(label)
// 	      .prop("selected", code === selectedValue);
// 	    select.append(option);
// 	  });
// 	  
// 	  return select;
//}
//
//
//
//// 코드 값을 실제 이름으로 변환하는 로직
//function convertCodeToName(codeValue) {
//    // 실제 이름은 서버에서 가져온 별도의 맵이 필요할 수 있습니다.
//    switch (codeValue) {
//        case "cat_00": return "공통";
//        case "cat_01": return "ERP";
//        case "cat_02": return "MES";
//    
//        case "pos_01": return "사장";
//        case "pos_02": return "이사";
//        case "pos_03": return "부장";
//        case "pos_04": return "팀장";
//        case "pos_05": return "사원";
//    
//        case "dep_erp_01": return "영업부";
//        case "dep_erp_02": return "인사부";
//        case "dep_erp_03": return "개발부";
//        case "dep_erp_04": return "마케팅부";
//        case "dep_mes_01": return "생산부";
//        case "dep_mes_02": return "자재부";
//        case "dep_mes_03": return "창고부";
//
//        case "team_01": return "1팀";
//        case "team_02": return "2팀";
//        case "team_03": return "3팀";
//		
//		case "sts_01": return "재직";
//		case "sts_02": return "휴직";
//		case "sts_03": return "퇴직";
//		
//
//        default: return codeValue; // 매핑되지 않은 코드는 그냥 코드 값으로 표시
//    }
//}
//
//function openModal(empNum) {
//	debugger;
//	$.ajax({
//		url: "/SOLEX/emp/",
//	    type: "get",
//	    dataType: "json",
//	    success: function(data){
//	    
//		}
//	});
//}
////date 파싱
//function formatDate(dateString){
//	const date = new Date(dateString);
//	const year = date.getFullYear();
//	const month = String(date.getMonth() + 1).padStart(2,'0');
//	const day = String(date.getDate()).padStart(2,'0');
//	return `${year}-${month}-${day}`;
//}
//
//function requestUpdate(){
//	console.log("변경됨~~~~~~~~~~");
//	const changedEmpName = $(this).attr("name");
//	const changedEmpValue = $(this).val();
//	
//	console.log("변경할 항목몀= " + changedEmpName); 
//	console.log("변경할 값 + " + changedEmpValue); 
//	
//	const changedEmpNum = $(this).closest("tr").find(".id").text();
//	console.log("change num = " + changedEmpNum);
//	
//	//변경 데이터를 객체로 생성해 ajax 요청시 json 형식으로 전달
//	const requestEmp = {
//			id : changedEmpNum,
//			name : changedEmpName,
//			value : changedEmpValue,
//	} 
//}
//	// --------------------------------------------- 공통코드 가져오기 --------------------------------------------------
//
//
//$.ajax({
//  url: "/SOLEX/emp/codelistJson", 
//  type: "get",
//  dataType: "json",
//  success: function(data){
//	  console.log("공통 코드 원본 데이터: ", data); 
//
//	        const empCodeList = data.empCodeList;
//
//	        empCodeList.forEach(codeItem => { 
//	            for (const key in codeItem) {
//	                if (codeItem.hasOwnProperty(key)) { // 해당 속성이 객체 자신의 속성인지 확인
//	                    const value = codeItem[key]; // 속성 값 (예: "cat_00", "pos_01")
//
//	                    // key(속성 이름)를 기준으로 어떤 종류의 코드인지 판단
//	                    if (key === "empCatCd") {
//	                        // codeId는 속성 값 자체이고, codeName은 실제 이름으로 변환
//	                        categoryOptions[value] = convertCodeToName(value); // 예시: "cat_00" -> "카테고리 00"
//	                    } else if (key === "empPosCd") {
//	                        positionOptions[value] = convertCodeToName(value);
//	                    } else if (key === "empDepCd") {
//	                        departmentOptions[value] = convertCodeToName(value);
//	                    } else if (key === "empTeamCd") {
//	                        teamOptions[value] = convertCodeToName(value);
//	                    } else if (key === "empStsCd") {
//	                        stsOptions[value] = convertCodeToName(value);
//	                    }
//	                }
//	            }
//	        });
//
//        console.log("Category Options: ", categoryOptions);
//        console.log("Position Options: ", positionOptions);
//        console.log("Department Options: ", departmentOptions);
//        console.log("Team Options: ", teamOptions);// 제대로 됨
//        console.log("StsOptions: ", stsOptions);
//		loadEmpList();
//    },
//    error: function(xhr, status, error){
//        console.error("공통 코드 불러오기 실패:", status, error);
//    }
//});

		

	
	
	
	
	

