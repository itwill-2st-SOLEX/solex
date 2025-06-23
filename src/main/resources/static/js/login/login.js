$(function() {
	document.getElementById("loginBtn").addEventListener("click", function(e) {
		const empNo = document.getElementById("empNo").value;
		const password = document.getElementById("empPw").value;

		if (!empNo || !password) {
			e.preventDefault();
			alert("사번과 비밀번호를 모두 입력하세요.");
		}
		
		$.ajax({
			url: '/SOLEX/auth/login',
			type: 'POST',
			contentType: 'application/json',
			data: JSON.stringify({ emp_num: empNo, emp_pw: password }), 
			success: function(res) {
				console.log('성공:', res);
			},
			error: function(err) {
				console.error('에러:', err);
			}
		}); 

	});
});