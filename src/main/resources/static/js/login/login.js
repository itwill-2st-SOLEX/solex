$(function() {
    document.getElementById("loginBtn").addEventListener("click", function(e) {
        const empNo = document.getElementById("empNo").value;
        const password = document.getElementById("empPw").value;
        const saveEmp = document.getElementById("saveEmpNum").checked;

        if (!empNo || !password) {
            e.preventDefault();
            alert("사번과 비밀번호를 모두 입력하세요.");
            return;
        }

        if (saveEmp) {
            localStorage.setItem("savedEmpNum", empNo);
        } else {
            localStorage.removeItem("savedEmpNum");
        }
    });

    // 페이지 로드 시 저장된 사번 있으면 자동 입력
    const savedEmpNum = localStorage.getItem("savedEmpNum");
    if (savedEmpNum) {
        document.getElementById("empNo").value = savedEmpNum;
        document.getElementById("saveEmpNum").checked = true;
    }
	
	  // 역할별 자동 로그인 버튼 처리
	  document.querySelectorAll(".admin-login-buttons .right-btn").forEach((btn) => {
	    btn.addEventListener("click", function () {
	      const role = this.dataset.role;
	      let empNo = "", empPw = "";

	      switch (role) {
	        case "employee":
	          empNo = "20240122";
	          empPw = "930705";
	          break;
	        case "manager":
	          empNo = "20240001";
	          empPw = "921205";
	          break;
	        case "admin":
	          empNo = "20140001";
	          empPw = "850401";
	          break;
	      }
	      // 자동 입력
	      document.getElementById("empNo").value = empNo;
	      document.getElementById("empPw").value = empPw;
	      document.getElementById("saveEmpNum").checked = false;

	      // 로그인 버튼 강제 클릭
	      document.getElementById("loginBtn").click();
	    });
	  });
});
