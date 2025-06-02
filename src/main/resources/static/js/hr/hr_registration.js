$("form").on("submit", function(){
	let email = $("#email1").val() + "@" + $("#email2").val();
	$("input[name=email]").remove();
	$("form").prepend('<input type="hidden" name="email" value="' + email + '">');
});

$(".cancel").on("click", function(){
	
});

$(function(){
//	alert("제대로 됐나 ㅠ");
});

//-----------------------------주소api------------------------------------------------
document.querySelector("#btnSearchAddress").onclick = function() {
   new daum.Postcode({ // postcode.v2.js 에서 제공하는 daum.Postcode 객체 생성
    // 주소 검색 창에서 주소 검색 후 검색된 주소를 사용자가 클릭 시
    // oncomplete 이벤트에 의해 이벤트 뒤의 익명함수가 자동으로 호출됨
           // 사용자가 클릭한 주소 정보가 익명함수 파라미터 data 로 전달됨
           // => 주의! 이 익명함수는 개발자가 호출하는 것이 아니라
           //    API 에 의해 자동으로 호출됨
           //    (어떤 동작 수행 후 자동으로 호출되는 함수를 콜백(callback) 함수라고 함)
       oncomplete: function(data) {
           // 클릭(선택)된 주소 정보(객체)가 익명함수 파라미터 data 에 저장되어 있음
//            console.log(data);
           // data 객체 접근을 위해 data.xxx 형식으로 주소 상세정보 접근 가능
           // ---------------------------------------------------------------
           // 1) 우편번호(= postcode 이지만, 최근 국가기초구역번호로 변경 = zonecode 사용)
           document.joinForm.postcode.value = data.zonecode;
   
    // 2) 기본주소(address 속성값)
//            document.joinForm.address1.value = data.address;
   
    // 만약, 해당 주소에 건물명(buildingName 속성값)이 존재할 경우(널스트링 아님)
    // 기본주소 뒤에 건물명을 결합하여 출력
    // ex) 기본주소 : 부산광역시 부산진구 동천로109
    //     건물명 : 삼한골든게이트
    //     => 부산광역시 부산진구 동천로109 (삼한골든게이트)
    let address = data.address; // 기본 주소 저장
   
    if(data.buildingName != "") { // 건물명이 존재할 경우 판별
    address += " (" + data.buildingName + ")"; // 건물명 결합
    }
   
    document.joinForm.address1.value = address; // 기본 주소 출력
   
    // 상세주소 입력 항목(name 속성 address2)에 커서 요청
    document.joinForm.address2.focus();
       }
   }).open(); // 주소검색창 표시(새 창으로 열림)
}

