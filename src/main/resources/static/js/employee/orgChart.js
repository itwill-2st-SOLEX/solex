document.addEventListener("DOMContentLoaded", function () {
    fetch("/SOLEX/employee/orgchart/tree")
        .then(response => response.json())
        .then(config => {
            new Treant(config);
        })
        .catch(error => {
            console.error("조직도 불러오기 실패", error);
        });
});
