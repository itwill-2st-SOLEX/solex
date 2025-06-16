document.addEventListener("DOMContentLoaded", function () {
    var chart_config = {
        chart: {
            container: "#orgCard", // 조직도가 그려질 div ID
            levelSeparation: 30,
            siblingSeparation: 12,
            subTeeSeparation: 50,
            nodeAlign: "BOTTOM",
            connectors: {
                type: "step",
                style: {
                    "stroke-width": 2,
                    "stroke": "#ccc"
                }
            },
            node: { HTMLclass: "node-style" }
        },

        // 루트 노드부터 아래로 나열
		nodeStructure: {
		    text: { name: "CEO", title: "홍길동" },
		    children: [
		      {
		        text: { name: "ERP이사", title: "이순신" },
		        children: [
		          {
		            text: { name: "인사부", title: "이준수" },
					stackChildren: true,
		            children: [
		              { text: { name: "인사1팀", title: "박준호" } },
		              { text: { name: "인사2팀", title: "강준혁" } },
		              { text: { name: "인사3팀", title: "이종훈" } }
		            ]
		          },
		          {
		            text: { name: "개발부", title: "김강훈" },
					stackChildren: true,
		            children: [
		              { text: { name: "개발1팀", title: "김준수" } },
		              { text: { name: "개발2팀", title: "임유정" } },
		              { text: { name: "개발3팀", title: "정윤주" } }
		            ]
		          }
		        ]
		      },
			  {
  		        text: { name: "MES이사", title: "강감찬" },
  		        children: [
  		          {
  		            text: { name: "생산부", title: "김세종" },
  					stackChildren: true,
  		            children: [
  		              { text: { name: "생산1팀", title: "김철수" } },
  		              { text: { name: "생산2팀", title: "이준혁" } },
  		              { text: { name: "생산3팀", title: "임유나" } }
  		            ]
  		          },
  		          {
  		            text: { name: "자재부", title: "윤동주" },
  					stackChildren: true,
  		            children: [
  		              { text: { name: "자재1팀", title: "강철수" } },
  		              { text: { name: "자재2팀", title: "이종석" } },
  		              { text: { name: "자재3팀", title: "이지은" } }
  		            ]
  		          }
  		        ]
  		      }
		    ]
		  }
    };

    new Treant(chart_config);
});
