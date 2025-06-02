
	let currentPage = 0;	//표시하려는 페이지 번호
	const pageSize = 20;	//한 화면에 표시할 행의 개수
	const gridHeight=700;		//그리드 높이
	
	// ToastUI 표 만들기
	const grid = new tui.Grid({
	    el: document.getElementById('grid'),
	    bodyHeight: gridHeight,
		scrollY: true,     // ← 명시적으로 설정
		scrollX: false,
	    data: [],
	    columns: [
	        //{ header: '번호', name: 'notId' },
	        { header: '제목', name: 'notTt', sortable: true },
	        { header: '부서', name: 'detNm', sortable: true },
			{ header: '이름', name: 'empNm', sortable: true },
	        { header: '등록일', name: 'notRegDate', sortable: true }
	    ],
	    rowHeaders: ['rowNum']
	});
	
	//게시글 목록 가져오기(무한스크롤) - 비동기
	async function noticeList(page) {
	    try {
			//'/SOLEX/api/notice?page=' + page + '&size=' + pageSize
	        const res = await fetch(`/SOLEX/api/notice?page=${page}&size=${pageSize}`);
	        const data = await res.json();
			
	        const gridData = data.map(n => ({
				notId: n.NOT_ID,
				notTt: n.NOT_TT,	//제목
				notCon: n.NOT_CON,
	            detNm: n.DET_NM,	//부서
				empNm: n.EMP_NM,	//이름       
	            notRegDate: n.NOT_REG_DATE	//등록일
	        }));
			
	        if (page === 0) {
	            // 첫 페이지는 그리드 초기화
	            grid.resetData(gridData);
	        } else {
	            // 다음 페이지 데이터는 기존 데이터에 추가
	            grid.appendRows(gridData);
	        }

	        // 다음 페이지 증가
	        currentPage++;

	        // 만약 데이터가 pageSize보다 작으면 더이상 로딩X
	        if (data.length < pageSize) {
	            grid.off('scrollEnd'); // 무한스크롤 종료
	        }

	    } catch (e) {
	        console.error('fetch 에러 : ', e);
	    }
	}

	// 초기 데이터 로드
	window.addEventListener('DOMContentLoaded', () => {
	    noticeList(currentPage);
	});

	// 스크롤 끝나면 다음 페이지 로드
	grid.on('scrollEnd', () => {
		console.log('스크롤 끝!');

	    noticeList(currentPage);
	});
	
	//게시글 목록 표시 무한 스크롤 적용 끝

	
	//게시글 제목 클릭하면 상세내용 표시 - 비동기	
	grid.on('click', async (ev) => {
	    if (ev.columnName === 'notTt') {
	        const row = grid.getRow(ev.rowKey);
	        const noticeId = row.notId; // 공지사항 ID (백엔드에서 넘겨주는 값 필요)

	        try {
	            const res = await fetch(`/SOLEX/api/notice/${noticeId}`);
	            const noticeDetail = await res.json();
				
	            // 모달 또는 alert 등으로 내용 보여주기
	            showNoticeDetailModal(noticeDetail);
	        } catch (e) {
	            console.error('공지사항 상세 조회 실패: ', e);
	        }
	    }
	});
	
	// 상세내용 모달창 표시
	function showNoticeDetailModal(data) {
		const modalContainer = document.getElementById('exampleModal');

		  modalContainer.innerHTML = `
		  <div class="modal fade" id="exampleModalInner" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="false">
		  		  <div class="modal-dialog modal-dialog-scrollable modal-lg">
		  		    <div class="modal-content">
		  		      <div class="modal-header">
		  		        <h5 class="modal-title" id="exampleModalLabel">공지사항</h5>
		  		        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
		  		      </div>
		  		      <div class="modal-body big-box">
		  		      
		  		      
		  		        <div class="notice-detail">
		  				  <div class="notice-header">
		  				    <h4 class="notice-title" id="exampleModalLabel">${data.NOT_TT}</h4>
		  				    <ul class="notice-meta">
		  				      <li><strong>부서명 </strong> <span id="modalDept">${data.DET_NM}</span></li>
		  				      <li><strong>작성자 </strong> <span id="modalWriter"> ${data.EMP_NM}</span></li>
		  				      <li><strong>등록일 </strong> <span id="modalDate">${data.NOT_REG_DATE}</span></li>
		  				    </ul>
		  				  </div>
		  				  <div class="notice-content" id="modalContent">
		  				    ${data.NOT_CON?.replace(/\n/g, '<br>') || '내용 없음'}
		  				  </div>
		  				</div>

		  		      </div>
		  		      <div class="modal-footer">
		  		        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
		  		        <button type="button" class="btn btn-primary">Save changes</button>
		  		      </div>
		  		    </div>
		  		  </div>
		  `;

		  // 모달 엘리먼트 선택
		   const modalEl = document.getElementById('exampleModalInner');

		   // 부트스트랩 모달 인스턴스 생성 후 show()
		   const bsModal = new bootstrap.Modal(modalEl);
		   bsModal.show();
		  
		/*//모달창 선택
		const modalEl = document.getElementById('exampleModal');
		
		//부트스트랩 모달 인스턴스 생성
		const bsModal = new bootstrap.Modal(modalEl);
		
		//제목과 내용 표시
		document.getElementById('exampleModalLabel').textContent = data.NOT_TT;
		document.querySelector('#exampleModal .modal-body').textContent = data.NOT_CON;
		
		// Bootstrap 방식으로 모달 띄우기
		bsModal.show(); */
		
	}
	
	//모달창 표시
	function showNoticeNewModal() {
		
		//모달창 선택
		const modalEl = document.getElementById('exampleModal');
		
		//부트스트랩 모달 인스턴스 생성
		const bsModal = new bootstrap.Modal(modalEl);
		
				
		// Bootstrap 방식으로 모달 띄우기
		bsModal.show(); 
		
	}
   			
