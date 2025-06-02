$(function(){
	
	window.openregistration = function() {
	    $("#myModal").css("display", "block");
	};

	$(".registration").click(function(){
		alert("잘 됩니다/.");
		openregistration();
	})
	
	// 모달 바깥 부분 클릭 시 닫기 (선택 사항)
	$(window).click(function(event){
	    if ($(event.target).is("#myModal")) {
	        $("#myModal").css("display", "none");
	    }
	});

	
});
