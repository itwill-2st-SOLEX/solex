$(function(){
		//date 파싱
		function formatDate(dateString){
			const date = new Date(dateString);
			const year = date.getFullYear();
			const month = String(date.getMonth() + 1).padStart(2,'0');
			const day = String(date.getDate()).padStart(2,'0');
			return `${year}-${month}-${day}`;
		}

	$.ajax({
	  url: "/SOLEX/hr/listJson", // context path 포함
	  type: "get",
	  dataType: "json",
	  success: function(data){
	    console.log("data = ", data);
	    const empList = data.empList;
	    const tableBody = $("#empTable tbody");
		
		
		
		//목록 가져오기 - 부서
		const departmentOptions = {
		  "DEP_ERP_01": "영업부",
		  "DEP_ERP_02": "인사부",
		  "DEP_ERP_03": "개발부",
		  "DEP_ERP_04": "마케팅부"
		};
		
		//목록 가져오기 - 직급
		const depPostionOptions ={
			"POS_01" : "사장",
			"POS_02" : "이사",
			"POS_03" : "부장",
			"POS_04" : "팀장",
			"POS_05" : "사원",
		};
		
	    empList.forEach(function(emp){
	      const row = $("<tr>");

	      // 사번
	      const empNumCell = $("<td class='empNum'>").text(emp.empNum);
	      row.append(empNumCell);

	      // 부서
		  const depIdSelect = $("<select>").attr("name", "depId");
		  $.each(departmentOptions, function(code, label) {
			  const option = $("<option>")
			    .val(code)
			    .text(label)
			    .prop("selected", code === emp.depId);
			  depIdSelect.append(option);
		  });
		 row.append($("<td>").append(depIdSelect));

	      // 직급
	      const depPositionSelect = $("<select>").attr("name", "depId");
		  $.each(depPostionOptions, function(code, label) {
			  const option = $("<option>")
			    .val(code)
			    .text(label)
			    .prop("selected", code === emp.depPosition);
			  depPositionSelect.append(option);
		  });
		 row.append($("<td>").append(depPositionSelect));

	      // 사원명
	      const empNmCell = $("<td class='empNm'>").text(emp.empNm);
	      row.append(empNmCell);

	      // 연락처
	      const empPhoneCell = $("<td class='empPhone'>").text(emp.empPhone);
	      row.append(empPhoneCell);

	      // 입사일
	      const empHireCell = $("<td class='empHire'>").text(formatDate(emp.empHire));
	      row.append(empHireCell);

	      // 재직상태
	      const empStsCell = $("<td class='empSts'>").text(emp.empSts); // ✅ 클래스명도 수정
	      row.append(empStsCell);
		  
	      // 마지막에 row를 테이블에 추가
	      tableBody.append(row);
	    });
		
		
		$("#empTable input").change(requestUpdate);
		$("#empTable select").change(requestUpdate);
	  },
	  error: function(xhr, status, error){
	    console.error("AJAX Error:", status, error);
	  }
	});
	
	function requestUpdate(){
		console.log("변경됨되밍~~~~~~~~~~");
		const changedEmpName = $(this).attr("name");
		const changedEmpValue = $(this).val();
		
		console.log("변경할 항목몀= " + changedEmpName); 
		console.log("변경할 값 + " + changedEmpValue); 
		
		const changedEmpNum = $(this).closest("tr").find(".id").text();
		console.log("change num = " + changedEmpId);
		
		//변경 데이터를 객체로 생성해 ajax 요청시 json 형식으로 전달
		const requestEmp = {
				id : changedEmpId,
				name : changedEmpName,
				value : changedEmpValue,
		} 
	}
	
	//검색기능 
	const currentURL = location.href;
	const url = new URL(currentURL);
	const params = new URLSearchParams(url.search);
});
