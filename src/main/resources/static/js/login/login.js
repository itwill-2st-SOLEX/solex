$(function() {
	document.getElementById("loginBtn").addEventListener("click", function(e) {
		const empNo = document.getElementById("empNo").value;
		const password = document.getElementById("empPw").value;

		if (!empNo || !password) {
			e.preventDefault();
			alert("사번과 비밀번호를 모두 입력하세요.");
		}

	});
});