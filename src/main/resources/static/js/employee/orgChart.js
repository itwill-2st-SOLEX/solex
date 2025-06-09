document.addEventListener("DOMContentLoaded", function () {
    var chart_config = {
        chart: {
            container: "#orgCard", // 조직도가 그려질 div ID
            levelSeparation: 30,
            siblingSeparation: 12,
            subTeeSeparation: 12,
            nodeAlign: "BOTTOM",
            connectors: {
                type: "step",
                style: {
                    "stroke-width": 2,
                    "stroke": "#ccc"
                }
            },
            node: {
                HTMLclass: "node-style"
            }
        },

        // 루트 노드부터 아래로 나열
        nodeStructure: {
            text: { name: "홍사장", title: "CEO" },
			HTMLclass: "ceo",
            children: [
                {
                    text: { name: "이이사", title: "ERP이사" },
					HTMLclass: "erpDirector",
                    children: [
                        {
                            text: { name: "엄부장", title: "영업부장" },
							HTMLclass: "erpManager",
                            children: [
                                {
									text: { name: "영업1팀장", title: "영업1팀장" },
									HTMLclass: "teamManager"
								},
								{
									text: { name: "영업2팀장", title: "영업2팀장" },
									HTMLclass: "teamManager"
								}
                            ]
                        },
                        {
                            text: { name: "인부장", title: "인사부장" },
							HTMLclass: "erpManager",
							children: [
								{ text: { name: "인사1팀장", title: "인사1팀장"}},
								{ text: { name: "인사2팀장", title: "인사2팀장"}}
							]
                        },
						{
                            text: { name: "박부장", title: "개발부장" },
							HTMLclass: "erpManager",
							children: [
								{ text: { name: "개발1팀장", title: "개발1팀장"}},
								{ text: { name: "개발2팀장", title: "개발2팀장"}}
							]
                        },
						{
                            text: { name: "마부장", title: "마케팅부장" },
							HTMLclass: "erpManager",
							children: [
								{ text: { name: "마1팀장", title: "마케팅1팀장"}},
								{ text: { name: "마2팀장", title: "마케팅2팀장"}}
							]
                        }
                    ]
                },
                {
                    text: { name: "임이사", title: "MES이사" },
					HTMLclass: "mesDirector",
					children: [
						{
							text: { name: "손부장", title: "생산부장"},
							HTMLclass: "mesManager",
							children: [
								{ text: {name: "생산1팀장", title: "생산1팀장"} },
								{ text: {name: "생산2팀장", title: "생산2팀장"} }
							]
						},
						{
							text: { name: "정부장", title: "자재부장"},
							HTMLclass: "mesManager",
							children: [
								{ text: {name: "자재1팀장", title: "자재1팀장"} },
								{ text: {name: "자재2팀장", title: "자재2팀장"} }
							]
						},
						{
							text: { name: "최부장", title: "창고부장"},
							HTMLclass: "mesManager",
							children: [
								{ text: {name: "창고1팀장", title: "창고1팀장"} },
								{ text: {name: "창고2팀장", title: "창고2팀장"} }
							]
						}
					]
                }
            ]
        }
    };

    new Treant(chart_config);
});
