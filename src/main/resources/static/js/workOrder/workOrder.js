$(function() {
	let currentPage = 0;
	const pageSize = 20;

	const grid = new tui.Grid({
		el: document.getElementById('grid'),
		bodyHeight: 580,
		scrollY: true,
		data: [],
		rowHeaders: ['checkbox'],
		header: {
			height: 80,
			complexColumns: [
				{
					header: '옵션',
					name: 'optionGroup',
					childNames: ['prd_color', 'prd_size', 'prd_height']
				}
			]
		},
		columns: [
			{ header: '주문 상세 번호', name: 'odd_id', align: 'center' },
			{ header: '제품코드', name: 'prd_code', align: 'center', filter: 'select' },
			{ header: '제품명', name: 'prd_nm', align: 'center', filter: 'select' },
			{ header: '진행현황', name: 'odd_sts', align: 'center', sortable: 'true', className: 'clickable-cell' },
			{ header: '생산수량', name: 'odd_cnt', align: 'center', filter: 'select' },
			{ header: '제품컬러', name: 'prd_color', align: 'center', filter: 'select' },
			{ header: '제품 사이즈', name: 'prd_size', align: 'center', filter: 'select' },
			{ header: '굽 높이', name: 'prd_height', align: 'center', filter: 'select' },
			{ header: '납품 예정일', name: 'ord_end_date', align: 'center', sortable: 'true' },
			{ header: '창고 배정', name: 'warehouse_btn', align: 'center' }
		]
	});

	async function loadDrafts(page) {
		try {
			const response = await fetch(`/SOLEX/workOrders/list?page=${page}&size=${pageSize}`);
			const rawData = await response.json();
			const data = rawData.map(row => ({
				odd_id: row.ODD_ID,
				prd_code: row.PRD_CODE,
				prd_nm: row.PRD_NM,
				odd_sts: row.ODD_STS,
				odd_cnt: row.ODD_CNT,
				prd_color: row.PRD_COLOR,
				prd_size: row.PRD_SIZE,
				prd_height: row.PRD_HEIGHT,
				ord_end_date: row.ORD_END_DATE,
				warehouse_btn: row.ODD_STS === '작업 완료'
					? `<button class="btn btn-sm btn btn-warning assign-btn" data-ord-id="${row.ODD_ID}"> 창고배정</button>`
					: ''
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
		if (ev.columnName === 'odd_sts') {
			const rowData = grid.getRow(ev.rowKey);
			if (rowData.odd_sts === '작업 대기') {
				openWorkModal(rowData.prd_code, rowData.odd_id, rowData.odd_cnt);
			} else {
				alert('작업 대기 상태에서만 작업 지시를 할 수 있습니다.');
			}
		}
	});
	// 창고배정 버튼 클릭시
	document.getElementById('grid').addEventListener('click', function(e) {
		if (e.target.classList.contains('assign-btn')) {
			const oddId = e.target.dataset.oddId;
			openAssignWarehouse(oddId);
		}
	});
});

// 진행현황 모달
function openWorkModal(prd_code, odd_id, odd_cnt) {
	$.ajax({
		url: `/SOLEX/workOrders/${prd_code}`,
		type: 'GET',
		success: function(res) {
			debugger;
			// 1. 공정별 그룹화 (step_seq 기준)
			const grouped = {};

			res.forEach(item => {
				const seq = item.STEP_SEQ;
				if (!grouped[seq]) {
					grouped[seq] = {
						name: item.PROCESS_NAME,
						availableTeams: [],
						prd_code: item.PRD_CODE,
						prc_id: item.PRC_ID,
						odd_cnt: odd_cnt
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
					availableTeams: grouped[seq].availableTeams,
					prd_code: grouped[seq].prd_code,
					prc_id: grouped[seq].prc_id,
					odd_cnt: grouped[seq].odd_cnt,
					odd_id: odd_id
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
	document.getElementById('submitWorkOrder').addEventListener('click', function() {
		let steps = document.querySelectorAll('.timeline-step');
		let prdCd = document.getElementById('hidden-prd-cd').value;
		let oddId = document.getElementById('hidden-odd-id').value;
		let oddCnt = document.getElementById('hidden-odd-cnt').value;
		let payload = [];

		let valid = true;

		for (let i = 0; i < steps.length; i++) {
			let select = steps[i].querySelector(`select[id="team-${i}"]`);
			let prcId = document.getElementById(`hidden-prc-id-${i}`).value;
			let teamCode = select.value;

			// 유효성
			if (!teamCode) {
				alert(`${i + 1}단계에서 팀을 선택해주세요.`);
				valid = false;
				break;
			}

			payload.push({
				prdCd: prdCd,
				oddId: oddId,
				prcId: prcId,
				oddCnt: oddCnt,
				stepSeq: i + 1,
				teamCode: teamCode
			});
		};

		if (!valid) return;

		$.ajax({
			url: '/SOLEX/workOrders',
			type: 'POST',
			contentType: 'application/json',
			data: JSON.stringify(payload),
			success: function() {
				alert('작업 지시 등록 성공!');
				$('#WorkModal').modal('hide');
				location.reload();
			},
			error: function(err) {
				console.error('등록 에러:', err);
				alert('작업 지시 등록 실패!');
			}
		});
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
				
				<input type="hidden" id="hidden-prd-cd" value="${process.prd_code}" />
				<input type="hidden" id="hidden-odd-id" value="${process.odd_id}" />
				<input type="hidden" id="hidden-prc-id-${index}" value="${process.prc_id}" />
				<input type="hidden" id="hidden-odd-cnt" value="${process.odd_cnt}" />
			</div>
		`;
		debugger;
		container.appendChild(step);
	});
}
// 창고 전역변수
let warehouses = [];

function fetchWarehouses(callback) {
	$.ajax({
		url: '/SOLEX/workOrders/warehouses',
		method: 'GET',
		success: function(data) {
			warehouses = groupWarehouses(data);
			if (callback) callback();
		},
		error: function(xhr, status, error) {
			console.error('🚨 창고 데이터 로딩 실패:', error);
			alert('창고 정보를 불러올 수 없습니다.');
		}
	});
}

// 서버에서 받아온 평탄화된 데이터를 창고별로 그룹핑하는 함수
function groupWarehouses(data) {
	const grouped = {};

	data.forEach(item => {
		const whsNm = item.WHS_NM;
		if (!grouped[whsNm]) {
			grouped[whsNm] = {
				id: whsNm, // 실제로는 DB에서 창고 ID 받아서 여기에 넣는게 좋음
				name: whsNm,
				pc: item.WHS_PC,
				add: item.WHS_ADD,
				da: item.WHS_DA,
				teams: []
			};
		}
		grouped[whsNm].teams.push({
			name: item.ARE_NM,
			max: item.ARE_MAX,
			currentCount: item.WHS_HIS_CNT || 0
		});
	});

	return Object.values(grouped);
}
// 검색어를 기준으로 창고 목록 필터링 및 렌더링
function renderWarehouseList(filterText = '') {
	const listEl = document.getElementById('warehouseList');
	listEl.innerHTML = '';

	const filtered = warehouses.filter(w =>
		w.name.includes(filterText) || w.pc.toString().includes(filterText)
	);

	if (filtered.length === 0) {
		listEl.innerHTML = '<p class="text-center text-muted">검색 결과가 없습니다.</p>';
		return;
	}

	filtered.forEach((w, i) => {
		const btn = document.createElement('button');
		btn.className = 'list-group-item list-group-item-action';
		btn.textContent = `${w.name} (${w.pc})`;
		btn.onclick = () => selectWarehouse(i);
		listEl.appendChild(btn);
	});
}

function selectWarehouse(index) {
	const warehouse = warehouses[index];

	document.getElementById('warehouseName').textContent = warehouse.name;
	document.getElementById('warehouseLocation').textContent = warehouse.add + ' ' + warehouse.da;

	const teamSelect = document.getElementById('warehouseZone');
	teamSelect.innerHTML = '<option value="">창고구역을 선택하세요</option>';

	warehouse.teams.forEach(team => {
		const opt = document.createElement('option');
		opt.value = team.name;
		opt.textContent = `${team.name} (최대: ${team.max}, 현재: ${team.currentCount})`;
		teamSelect.appendChild(opt);
	});

	document.getElementById('selectedWarehouseId').value = warehouse.id;
}

// 모달 열기 함수
function openAssignWarehouse(oddId) {
	document.getElementById('warehouseSearch').value = '';

	document.getElementById('selectedWarehouseId').value = '';
	document.getElementById('selectedOddId').value = oddId;

	document.getElementById('warehouseName').textContent = '-';
	document.getElementById('warehouseLocation').textContent = '-';
	document.getElementById('warehouseZone').innerHTML = '<option value="">창고구역을 선택하세요</option>';

	// AJAX로 창고 데이터를 불러온 후 렌더링
	fetchWarehouses(() => {
		renderWarehouseList();
	});

	const modal = new bootstrap.Modal(document.getElementById('AssignWarehouseModal'));
	modal.show();
}

// 검색 input 이벤트
document.getElementById('warehouseSearch').addEventListener('input', (e) => {
	const keyword = e.target.value.trim();
	renderWarehouseList(keyword);
});

// 등록 버튼 이벤트
document.getElementById('submitWarehouseAssign').addEventListener('click', () => {
	const warehouseId = document.getElementById('selectedWarehouseId').value;
	const team = document.getElementById('warehouseZone').value;
	const oddId = document.getElementById('selectedOddId').value;

	if (!warehouseId) {
		alert('창고를 선택해주세요.');
		return;
	}
	if (!team) {
		alert('구역을 선택해주세요.');
		return;
	}

	// 여기에 ajax 호출 넣으면 됨
	console.log('창고배정 등록 데이터', { oddId, warehouseId, team });
	alert('창고배정 등록 완료! (테스트용)');

	// 모달 닫기
	const modalEl = document.getElementById('AssignWarehouseModal');
	const modal = bootstrap.Modal.getInstance(modalEl);
	modal.hide();

	// 이후 추가 처리 (리로드 등) 필요 시 작성
});