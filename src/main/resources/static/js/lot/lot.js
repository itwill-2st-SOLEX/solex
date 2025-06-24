document.addEventListener('DOMContentLoaded', function() {

	$(function() {
		$('#lotTree').jstree({
		  'core': {
		    'data': [
		      {
		        "text": "LOT-20250624-W19-P001-10",
		        "icon": "fa fa-cog",
		        "children": [ 
					{ 
						"text": "LOT-20250624-CUTTING-",
						"icon": "fa fa-cog",
						"children": [
							{ "text": "A09깔창" },
							{ "text": "원단7B" }
						] 
					},
					{ "text": "봉재", "icon": "fa fa-cog" },
					{ "text": "성형", "icon": "fa fa-cog" },
					{ "text": "접착", "icon": "fa fa-cog" },
					{ "text": "조립", "icon": "fa fa-cog" },
					{ "text": "스탬핑", "icon": "fa fa-cog" },
					{ "text": "마감", "icon": "fa fa-cog" }
				 ]
		      },
		      {
		        "text": "20250416-W4-Q093-1 - 스니커즈",
		        "icon": "fa fa-scissors",
				"children": [
					{
						"text": "재단",
						"icon": "fa fa-cog",
						"children" : [
							{ "text": "CUTTING" },
							{ "text": "2025-06-24 ~ 2025-06-25" },
							{ "text": "서강현 / 75" },
							{ "text": "인조가죽 오버레이 / 1500" },
							{ "text": "설비-005A" },
							{ "text": "생산수량 : 1500, 불량수량 : 32" },
							{ "text": "생산완료" }
						]
					},
					{ "text": "봉제", "icon": "fa fa-cog" },
					{ "text": "성형", "icon": "fa fa-cog" },
					{ "text": "접착", "icon": "fa fa-cog" },
					{ "text": "안감/장식부착", "icon": "fa fa-cog" },
					{ "text": "조립", "icon": "fa fa-cog" },
					{ "text": "스탬핑", "icon": "fa fa-cog" },
					{ "text": "자수", "icon": "fa fa-cog" },
					{ "text": "마감", "icon": "fa fa-cog" },
				]
		      }
		    ]
		  }
		});
	});
	
});