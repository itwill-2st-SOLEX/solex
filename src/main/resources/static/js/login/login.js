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
            localStorage.setItem("empNum", empNo);
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
});
