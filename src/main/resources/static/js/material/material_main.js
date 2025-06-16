document.addEventListener('DOMContentLoaded', function(){
	
	let currentPage = 0;
	const pageSize = 30;

	const grid = new tui.Grid({
		
	    el: document.getElementById('grid'),

	    data: [], // 초기에는 빈 배열로 시작, scrollMoreClient 함수가 데이터를 채움
	    height: 600,
	    bodyHeight: 500,
	    autoWidth: true,
		
	    columns: [
	        { header: '자재ID', name: 'matId', align : 'center', sortable: true}, // 백엔드 DTO 필드명 (camelCase)
	        { header: '거래처ID', name: 'CliId', align : 'center', sortable: true}, // 백엔드 DTO 필드명 (camelCase)
	        { header: '자재코드', name: 'matCd', align : 'center', sortable: true}, // 백엔드 DTO 필드명 (camelCase)
	        { header: '자재명', name: 'matNm', align : 'center', filter: 'select'},
	        { header: '단위', name: 'matUnit', align : 'center', filter: 'select' },
	        { header: '가격', name: 'matPrice', align : 'center', filter: 'select'},
	        { header: '설명', name: 'matComm', align : 'center', filter: 'select'},
	        { header: '등록일', name: 'matRegDate', align : 'center' },
	        { header: '수정일', name: 'matDate', align : 'center' },
	        { header: '사용여부', name: 'empHire', align : 'center' , sortable: true}
	    ]
	});
	// 사원 목록 조회 
		async function loadDrafts(page) { //page번호를 인자로 받아 사원목록을 불러옴 (30개당 한페이지)
				try {
					const response = await fetch(`/SOLEX/material/materialList?page=${page}&size=${pageSize}`); // 백엔드api에 fetch요청 30명씩 끊어서 ... 
		      		const rawData = await response.json(); // 받은 데이터를 필요한 형태로 가공
		      		const data = rawData.map(row => ({ // 이게 서버에서 받아온 사원정보 리스트(배열) 이런식으로 들어있음 //
					// .map()함수는 배열의 요소를 다른형태로 바꿔서 새 배열을 만든다는데 뭔말;
					//row는 객체를 하나씩 꺼내서 사용할 필드만 골라 새 객체를 만들어 넣음 (=그리드에 넣을 데이터를 원하는 형태로 변환)
			        empNum: row.empNum,
					empCatCd: row.empCatCd, 
			        empDepCd: row.empDepCd,
			        empTeamCd: row.empTeamCd,
			        empPosCd: row.empPosCd,
					empNm: row.empNm,
					empPhone: row.empPhone,
					empHire: row.empHire,
					empStsCd: row.empStsCd
		      	}));

				//현재 페이지가 첫 페이진지(전자) 아닌지(후자) 판단 후 그리드에 데이터를 새로넣을지 : 붙일지 정하는 코드 

				page === 0 ? grid.resetData(data) : grid.appendRows(data);

				//페이지를 하나 불러왔으니 다음에 불러올때는 ++로 함 
		      	currentPage++;

				//데이터 길이보다 페이지 사이즈가 크면 스크롤 끝 
		      	if (data.length < pageSize) grid.off("scrollEnd");
		    	} catch (error) {
		      		console.error('사원 목록 조회 실패:', error);
		    	}
		  	}

		  	loadDrafts(currentPage); //최조 1페이지 로딩
			grid.on('scrollEnd', () =>  loadDrafts(currentPage)); // 스크롤 끝나면 다음 페이지 로딩

			// 등록 모달 열기 
			document.getElementById('RegisterModalBtn').addEventListener('click', function() {
				  openModal(); 

			});
			});
