$(function() {
	let currentPage = 0;
	const pageSize = 20;

	const grid = new tui.Grid({
		el: document.getElementById('grid'),
		bodyHeight: 600,
		scrollY: true,
		data: [],
		columns: [
			{ header: '주문 번호', name: 'ord_id', align: 'center' },
			{ header: '제품코드', name: 'prd_cd', align: 'center', filter: 'select' },
			{ header: '제품명', name: 'prd_nm', align: 'center', filter: 'select' },
			{ header: '진행현황', name: 'prd_sts', align: 'center', sortable: 'true', className: 'clickable-cell' },
			{ header: '제품컬러', name: 'prd_color', align: 'center', filter: 'select' },
			{ header: '제품 사이즈', name: 'prd_size', align: 'center', filter: 'select' },
			{ header: '굽 높이', name: 'prd_height', align: 'center', filter: 'select' },
			{ header: '납품 예정일', name: 'ord_end_date', align: 'center', sortable: 'true' }

		]
	});
	async function loadDrafts(page) {
		try {
			const response = await fetch(`/SOLEX/workOrders/list?page=${page}&size=${pageSize}`);
			const rawData = await response.json();
			const data = rawData.map(row => ({
				ord_id: row.ORD_ID,
				prd_cd: row.PRD_CD,
				prd_nm: row.PRD_NM,
				prd_sts: row.PRD_STS,
				prd_color: row.PRD_COLOR,
				prd_size: row.PRD_SIZE,
				prd_height: row.PRD_HEIGHT,
				ord_end_date: row.ORD_END_DATE
			}));
			page === 0 ? grid.resetData(data) : grid.appendRows(data);
			currentPage++;

			if (data.length < pageSize) grid.off("scrollEnd");
		} catch (error) {
			console.error('기안서 목록 조회 실패:', error);
		}
	}

	loadDrafts(currentPage);

	grid.on('scrollEnd', () => loadDrafts(currentPage));

	// 진행현황 클릭시 모달 띄움
	grid.on('click', (ev) => {
		if (ev.columnName === 'prd_sts') {
			const rowData = grid.getRow(ev.rowKey);
			openWorkModal(rowData.prd_cd);
		}
	});
});

function openWorkModal(prd_cd) {
	$.ajax({
		url: `/SOLEX/workOrders/${prd_cd}`,
		type: 'GET',
		success: function(res) {
			// 1. 공정별 그룹화 (step_seq 기준)
			const grouped = {};

			res.forEach(item => {
				const seq = item.STEP_SEQ;
				if (!grouped[seq]) {
					grouped[seq] = {
						name: item.PROCESS_NAME,
						availableTeams: []
					};
				}
				grouped[seq].availableTeams.push({
					id: item.TEAM_CODE,
					name: item.TEAM_NAME 
				});
			});

			// 2. 배열로 변환 + 정렬
			const processList = Object.keys(grouped)
				.sort((a, b) => Number(a) - Number(b))
				.map(seq => ({
					name: grouped[seq].name,
					availableTeams: grouped[seq].availableTeams
				}));

			// 3. 렌더링
			renderProcessSteps(processList);

			const modal = new bootstrap.Modal(document.getElementById('WorkModal'));
			modal.show();
		},
		error: function(err) {
			console.error('에러:', err);
		}
	});
	
	// 작업지시 등록 버튼 클릭시
	// [TODO]
	document.getElementById('submitWorkOrder').addEventListener('click', function() {
		const steps = document.querySelectorAll('.timeline-step');
		const selectedTeams = [];
		
		// 유효성
		let valid = true;
		if (!teamCode) {
			alert(`${index + 1}단계에서 팀을 선택해주세요.`);
			valid = false;
			return;
		}
		
		selectedTeams.push({
			stepSeq: index + 1,
			teamCode: teamCode
		});
	});
	
	if (!valid) return;
	
	// 여기서 prd_cd 같이 넘겨줘야 함 (어디서든 가져오거나 파라미터로 받아올 수 있음)
	const prdCd = document.getElementById('hidden-prd-cd').value; // 예시용

	$.ajax({
		url: '/SOLEX/workOrders',
		type: 'POST',
		contentType: 'application/json',
		data: JSON.stringify({
			prdCd: prdCd,
			teams: selectedTeams
		}),
		success: function(res) {
			alert('작업 지시 등록 성공!');
			// 모달 닫기 등 추가 처리
		},
		error: function(err) {
			console.error('등록 에러:', err);
			alert('작업 지시 등록 실패!');
		}
	});
}

// 모달 렌더링 함수
function renderProcessSteps(processList) {
	const container = document.getElementById('process-steps-container');
	container.innerHTML = '';

	// 단계별 원 색상
	const stepColors = [
		'#d6e6ff', '#cce0ff', '#b3d1ff', '#99c2ff', '#80b3ff',
		'#66a3ff', '#4d94ff', '#3385ff', '#1a75ff', '#0d6efd'
	];

	processList.forEach((process, index) => {
		const step = document.createElement('div');
		step.classList.add('timeline-step');

		const color = stepColors[index] || stepColors[stepColors.length - 1];

		step.innerHTML = `
			<div class="timeline-icon" style="background-color: ${color};">
				${index + 1}
			</div>
			<div class="timeline-content">
				<div class="step-title">${process.name}</div>
				<label for="team-${index}">작업팀 선택</label>
				<select class="form-select" id="team-${index}" name="team-${index}">
					<option value="">-- 팀 선택 --</option>
					${process.availableTeams.map(team =>
					`<option value="${team.id}">${team.name}</option>`).join('')}
				</select>
			</div>
		`;
		container.appendChild(step);
	});
}

