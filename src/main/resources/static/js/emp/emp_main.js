let categoryOptions = {};
let positionOptions = {};
let departmentOptions = {};
let teamOptions = {};
let stsOptions = {};

//검색기능 
const currentURL = location.href;
const url = new URL(currentURL);
const params = new URLSearchParams(url.search);

function loadEmpList() {
	$.ajax({
	   url: "/SOLEX/emp/listJson",
	   type: "get",
	   dataType: "json",
	   success: function(data){
	     console.log("listJson data = ", data);
	     const empList = data.empList;
	     const tableBody = $("#empTable tbody");
	     tableBody.empty();  // 초기화

	     empList.forEach(function(emp){
	       const row = $("<tr>");

	       // 사번
	      row.append($("<td class='empNum'>").text(emp.empNum));

		   // 카테고리 select
		   const catSelect = createSelectBox(categoryOptions, emp.empCatCd ? emp.empCatCd.trim() : null);
          row.append($("<td>").append(catSelect));

          // 부서 select
		  const depSelect = createSelectBox(departmentOptions, emp.empDepCd ? emp.empDepCd.trim() : null);
          row.append($("<td>").append(depSelect));

          // 팀 select
		  const teamSelect = createSelectBox(teamOptions, emp.empTeamCd ? emp.empTeamCd.trim() : null);
          row.append($("<td>").append(teamSelect));
		  
          // 직급 select
		  const posSelect = createSelectBox(positionOptions, emp.empPosCd ? emp.empPosCd.trim() : null);
          row.append($("<td>").append(posSelect));
		  
          // 사원명
          row.append($("<td>").text(emp.empNm));

          // 연락처
          row.append($("<td>").text(emp.empPhone));

          // 입사일
          row.append($("<td>").text(formatDate(emp.empHire)));

          // 재직상태 select
		  const stsSelect = createSelectBox(stsOptions, emp.empStsCd ? emp.empStsCd.trim() : null);
          row.append($("<td>").append(stsSelect));
		  
	      // 테이블에 추가
	      tableBody.append(row);
		   
//		   // ### 여기서 강제 선택 시도 (디버깅용) ###
//          // 각 select 요소에 특정 클래스나 ID를 부여하여 직접 선택하는 것이 더 안정적일 수 있습니다.
//          // 일단은 `catSelect` 객체 자체에 .val()을 다시 시도
//          const currentCatValue = emp.empCatCd ? emp.empCatCd.trim() : null;
//          if (currentCatValue) {
//              catSelect.val(currentCatValue);
//              // 혹시 모르니 다시 한번 selected 확인
//              console.log(`강제 선택 후: ${emp.empNum.trim()}의 카테고리 selected val = `, catSelect.val());
//          }
//          // 다른 select들도 동일하게 적용
//          const currentDepValue = emp.empDepCd ? emp.empDepCd.trim() : null;
//          if (currentDepValue) { depSelect.val(currentDepValue); }
//          const currentTeamValue = emp.empTeamCd ? emp.empTeamCd.trim() : null;
//          if (currentTeamValue) { teamSelect.val(currentTeamValue); }
//          const currentPosValue = emp.empPosCd ? emp.empPosCd.trim() : null;
//          if (currentPosValue) { posSelect.val(currentPosValue); }
	     });

	     // 변경 이벤트 바인딩
	     $("#empTable input").change(requestUpdate);
	     $("#empTable select").change(requestUpdate);
	   },
	   error: function(xhr, status, error){
	     console.error("AJAX Error (empList):", status, error);
	   }
	 });
 }

 
 
 function createSelectBox(optionMap, selectedValue) {
 	  const select = $("<select>");
	  
// 	  console.log("반환직전 createSelectBox 호출됨 = ", selectedValue);
	  select.find('option:selected').each(function() {
//	       console.log("  선택된 옵션 값:", $(this).val(), "텍스트:", $(this).text());
	   });
	   
 	  $.each(optionMap, function(code, label){
		
// 		console.log("  옵션 비교: code =", code, "(Type:", typeof code, ") vs selectedValue =", selectedValue, "(Type:", typeof selectedValue, ") -> ", code === selectedValue);
 	    const option = $("<option>")
 	      .val(code)
 	      .text(label)
 	      .prop("selected", code === selectedValue);
 	    select.append(option);
 	  });
 	  
 	  return select;
}

// 코드 값을 실제 이름으로 변환하는 로직
function convertCodeToName(codeValue) {
    // 예시: "cat_00" -> "정규직", "pos_01" -> "사원" 등으로 매핑하는 로직
    // 실제 이름은 서버에서 가져온 별도의 맵이 필요할 수 있습니다.
    // 여기서는 단순히 값을 보기 좋게 변환하는 예시입니다.
    switch (codeValue) {
        case "cat_00": return "공통";
        case "cat_01": return "ERP";
        case "cat_02": return "MES";
    
        case "pos_01": return "사장";
        case "pos_02": return "이사";
        case "pos_03": return "부장";
        case "pos_04": return "팀장";
        case "pos_05": return "사원";
    
        case "dep_erp_01": return "영업부";
        case "dep_erp_02": return "인사부";
        case "dep_erp_03": return "개발부";
        case "dep_erp_04": return "마케팅부";
        case "dep_mes_01": return "생산부";
        case "dep_mes_02": return "자재부";
        case "dep_mes_03": return "창고부";

        case "team_01": return "1팀";
        case "team_02": return "2팀";
        case "team_03": return "3팀";
		
		case "sts_01": return "재직";
		case "sts_02": return "휴직";
		case "sts_03": return "퇴직";
		

        default: return codeValue; // 매핑되지 않은 코드는 그냥 코드 값으로 표시
    }
}

//date 파싱
function formatDate(dateString){
	const date = new Date(dateString);
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2,'0');
	const day = String(date.getDate()).padStart(2,'0');
	return `${year}-${month}-${day}`;
}

function requestUpdate(){
	console.log("변경됨되밍~~~~~~~~~~");
	const changedEmpName = $(this).attr("name");
	const changedEmpValue = $(this).val();
	
	console.log("변경할 항목몀= " + changedEmpName); 
	console.log("변경할 값 + " + changedEmpValue); 
	
	const changedEmpNum = $(this).closest("tr").find(".id").text();
	console.log("change num = " + changedEmpNum);
	
	//변경 데이터를 객체로 생성해 ajax 요청시 json 형식으로 전달
	const requestEmp = {
			id : changedEmpNum,
			name : changedEmpName,
			value : changedEmpValue,
	} 
}
	// --------------------------------------------- 공통코드 가져오기 --------------------------------------------------


$.ajax({
  url: "/SOLEX/emp/codelistJson", 
  type: "get",
  dataType: "json",
  success: function(data){
	  console.log("공통 코드 원본 데이터: ", data); 

	        const empCodeList = data.empCodeList;

	        empCodeList.forEach(codeItem => { 
	            for (const key in codeItem) {
	                if (codeItem.hasOwnProperty(key)) { // 해당 속성이 객체 자신의 속성인지 확인
	                    const value = codeItem[key]; // 속성 값 (예: "cat_00", "pos_01")

	                    // key(속성 이름)를 기준으로 어떤 종류의 코드인지 판단
	                    if (key === "empCatCd") {
	                        // codeId는 속성 값 자체이고, codeName은 실제 이름으로 변환
	                        categoryOptions[value] = convertCodeToName(value); // 예시: "cat_00" -> "카테고리 00"
	                    } else if (key === "empPosCd") {
	                        positionOptions[value] = convertCodeToName(value);
	                    } else if (key === "empDepCd") {
	                        departmentOptions[value] = convertCodeToName(value);
	                    } else if (key === "empTeamCd") {
	                        teamOptions[value] = convertCodeToName(value);
	                    } else if (key === "empStsCd") {
	                        stsOptions[value] = convertCodeToName(value);
	                    }
	                }
	            }
	        });

        console.log("Category Options: ", categoryOptions);
        console.log("Position Options: ", positionOptions);
        console.log("Department Options: ", departmentOptions);
        console.log("Team Options: ", teamOptions);// 제대로 됨
        console.log("stsOptions: ", stsOptions);
		loadEmpList();
    },
    error: function(xhr, status, error){
        console.error("공통 코드 불러오기 실패:", status, error);
    }
});

		

	
	
	
	
	

