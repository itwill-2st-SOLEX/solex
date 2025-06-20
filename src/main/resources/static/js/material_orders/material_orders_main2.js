document.addEventListener('DOMContentLoaded', function(){
	// 현재 페이지 
	let currentPage = 0;
	
	// 무한스크롤 보일 행 수
	const pageSize = 30;
	
	// tui 그리드 가져오기
	const grid = new tui.Grid({
		
		//그리드 들고와서 el에 넣고
		el: document.getElementById('grid'),
		
		//데이터 빈 배열로 만들고
		data : [],
		//높이는 600, 높이는 500(바디하이트), 자동넓이 트루, 컬럼들 채우기
		height : 600,
		bodyHeight : 500,
		autoWidth : true,
		columns: [
			//헤더, 네임, 얼라인(센터)
			{header: '발주ID', name : 'mat_ord_id', align: 'center'},
			{header: '자재ID', name : 'mat_id', align: 'center'},
			{header: '요청자ID', name : 'emp_id', align: 'center'},
			{header: '발주설명', name : 'mat_comm', align: 'center'},
			{header: '발주 요청일', name : 'mat_reg_date', align: 'center'},
			{header: '예상 입고일', name : 'mat_eta_date', align: 'center'},
			{header: '실제 입고일', name : 'mat_ata_date', align: 'center'},
			{header: '최종 수정일', name : 'mat_lmd_date', align: 'center'},
			{header: '승인/반려', name : 'mat_ok', align: 'center'},
			
		]
	
	}); //tui 그리드 가져오기 끝 
	
	//자재 발주 목록 조회
	
	
	// 발주등록 버튼
	document.getElementById('RegisterModalBtn').addEventListener('click', function(){
		openModal();
	})
	
	//async로 모달 열고
	async function openModal(){
		
		//exampleModal modalElement로 받아오고, modalElement는 부트스트랩에서 모달로 들고와서 모달에 넣기
		const modalElement = document.getElementById('exampleModal');
		const modal = new bootStrap.Modal(modalElement);
		
		// 모달 바디는 모달요소에서 쿼리셀렉터로 모달바디 가져오깃!! 모달제목은 exampleModalLabel 아이디 가져와서 넣기
		const modalBody = modalElement.querySelector('.modal-body');
		const modalTitle = document.getElementById('exampleModalLabel');
		
		// 모달 열릴때마다 기존 내용 제거
		modalBody.innerHTML = '';
		
		// 안에 내용 틀 js 형식으로 가져오기 
		let div1 = document.createElement('div'); //div라는 요소를 만들어
		div1.className = 'mb-3';
		div1.innerHTML =`
			<label>발주ID</label>
			<input type="text" class="form-control d-inline-block w-25" name="mat_id" required>
		`;
		// form에 집어 넣어
		form.appendChild(div1);
		
		
		//최종 폼 삽입
		modalBody.appendChild(form);
		
	}// 모달 내부 끝
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
}); //domContentLoaded