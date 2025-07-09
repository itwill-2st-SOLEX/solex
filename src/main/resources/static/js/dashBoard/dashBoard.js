$(function() {
	
	let type = null;
	// 최근 주문 요청현황
	recentOrderGrid();
	// 최근 생산 완료된 제품들
	recentFinishedList();
	// 페이지 맨 위 3개 요약카드
	dashboardSummary();

	// 인기 품목 도넛차트
	let today = new Date();
	let oneMonthAgo = new Date();
	oneMonthAgo.setMonth(today.getMonth() - 1);

	document.getElementById('startDate').value = oneMonthAgo.toISOString().split('T')[0];
	document.getElementById('endDate').value = today.toISOString().split('T')[0];

	// 기본값 도넛차트
	renderDonutChart(oneMonthAgo, today);

	// 조회 버튼 클릭시 함수 호출
	document.getElementById('filterBtn').addEventListener('click', () => {
		const start = new Date(document.getElementById('startDate').value);
		const end = new Date(document.getElementById('endDate').value);

		if (start > end) {
			alert('시작일이 종료일보다 늦을 수 없습니다.');
			return;
		}
		renderDonutChart(start, end);
	});

	// 생산량 추이 초기화
	const lineCtx = document.getElementById('lineChart').getContext('2d');
	window.lineChart = new Chart(lineCtx, {
		type: 'line',
		data: { labels: [], datasets: [] },
		options: {
			responsive: true,
			maintainAspectRatio: false,
			plugins: {
				legend: { display: true }
			},
			scales: {
				y: { beginAtZero: true }
			}
		}
	});

	// 페이지 로드 시 전체 생산량 추이 표시
	updateLineChart('monthly');

	// 월별 주간별 그래프 변경
	$('.toggle-btn').on('click', function() {
		$('.toggle-btn').removeClass('active');
		$(this).addClass('active');
		type = $(this).data('type');
		updateLineChart(type);
		
		console.log(type)
	});
	
	
/*	$('.chart-refresh').on('click', function() {
		type = $(this).data('type');
		if (type="monthly") {
			updateLineChart('monthly');
		} else if (type="weekly") {
			updateLineChart('weekly');
		}
	});
*/
});

// 3개 요약카드
async function dashboardSummary() {
	try {
		const response = await fetch('/SOLEX/dashboard/summary');
		if (!response.ok) throw new Error('서버 응답 실패');

		const data = await response.json();
		let yesterRate = data.yesterRate;
		let monthRate = data.monthRate;

		document.getElementById('yesterdayCount').textContent = (data.yesterCnt ?? 0).toLocaleString();
		document.getElementById('yesterdayRate').textContent =
			yesterRate === null ? '–' : `${yesterRate > 0 ? '+' : ''}${yesterRate}%`;

		document.getElementById('monthCount').textContent = (data.monthCnt ?? 0).toLocaleString();
		document.getElementById('monthRate').textContent =
			monthRate === null ? '–' : `${monthRate > 0 ? '+' : ''}${monthRate}%`;

		document.getElementById('defectRate').textContent = (data.defectCnt ?? 0) + '%';
	} catch (err) {
		console.error('🚨 요약 카드 데이터 불러오기 실패:', err);
	}
}

// 상품별 3개 요약 카드
async function updateSummaryCards(prdCode, prdNm) {
	try {
		const response = await fetch(`/SOLEX/dashboard/summary/${prdCode}`);
		if (!response.ok) throw new Error('서버 응답 실패');

		const data = await response.json();

		// 텍스트 라벨 동적 변경
		document.getElementById('yesterdayLabel').textContent = `${prdNm} 전일 생산량`;
		document.getElementById('monthLabel').textContent = `${prdNm} 당월 누적 생산`;
		document.getElementById('defectLabel').textContent = `${prdNm} 당월 불량률`;

		// 값 세팅
		document.getElementById('yesterdayCount').textContent = (data.yesterCnt ?? 0).toLocaleString();
		document.getElementById('yesterdayRate').textContent =
			data.yesterRate === null ? '–' : `${data.yesterRate > 0 ? '+' : ''}${data.yesterRate}%`;

		document.getElementById('monthCount').textContent = (data.monthCnt ?? 0).toLocaleString();
		document.getElementById('monthRate').textContent = 
			data.monthRate === null ? '–' : `${data.monthRate > 0 ? '+' : ''}${data.monthRate}%`;

		document.getElementById('defectRate').textContent = (data.defectCnt ?? 0) + '%';

	} catch (err) {
		console.error('📊 요약 카드(상품별) 로딩 실패:', err);
	}
}

// 생산량 추이 그래프
async function fetchLineChartData(type, prdCode = null, prdNm = null) {
	const url = new URL('/SOLEX/dashboard/productions/trend', window.location.origin);
	url.searchParams.append('type', type);

	if (prdCode) url.searchParams.append('prdCode', prdCode);

	try {
		const response = await fetch(url);
		if (!response.ok) throw new Error('서버 응답 실패');
		const json = await response.json();

		let labels = json.map(item => item.LABEL);
		let data = json.map(item => item.TOTAL_CNT);

		return {
			labels: labels,
			datasets: [{
				label: prdNm ? `${prdNm} 생산량` : '전체 생산량',
				data: data,
				borderColor: '#4e73df',
				backgroundColor: '#4e73df',
				fill: false,
				pointBackgroundColor: '#fff',
				pointBorderColor: '#4e73df',
				pointRadius: 5,
				pointHoverRadius: 7
			}]
		};
	} catch (err) {
		console.error('📉 꺾은선 그래프 데이터 로딩 실패:', err);
		return {
			labels: [],
			datasets: [{
				label: '생산량',
				data: [],
				borderColor: '#ccc'
			}]
		};
	}
}
// 그래프 갱신하는 함수
async function updateLineChart(type, prdCode = null, prdNm) {
	const newData = await fetchLineChartData(type, prdCode, prdNm);
	lineChart.data = newData;
	lineChart.update();
}

// 최근 생산 완료된 제품들
async function recentFinishedList() {
	try {
		const response = await fetch('/SOLEX/dashboard/completed');
		if (!response.ok) throw new Error('서버 응답 실패');

		const data = await response.json();

		const container = document.querySelector('.recent-finished-list');
		container.innerHTML = '';

		data.forEach(item => {
			const li = document.createElement('li');
			
			li.className = 'prd-card';
			li.innerHTML = `
		    <strong>${item.PRD_NM}, ${item.PRD_COLOR} ${item.PRD_SIZE} ${item.PRD_HEIGHT}cm</strong>
		    <span class="time">${item.HIS_DATE} ${item.ODD_STS}</span>
		  `;
			// 해당 제품의 PRD_CODE로 데이터 갱신
			li.addEventListener('click', () => {
				let activeType = $('.toggle-btn.active').data('type') || 'monthly';
				updateLineChart(activeType, item.PRD_CODE, item.PRD_NM);
				updateSummaryCards(item.PRD_CODE, item.PRD_NM);
			});

			container.appendChild(li);
		});
	} catch (err) {
		console.error('🚨 최근 생산 완료 리스트 불러오기 실패:', err);
	}
}
// 주문 요청현황
async function recentOrderGrid() {
	const grid = new tui.Grid({
		el: document.getElementById('orderGrid'),
		bodyHeight: 300,
		rowHeaders: ['rowNum'],
		header: {
			height: 80,
			complexColumns: [
				{
					header: '옵션',
					name: 'optionGroup',
					childNames: ['PRD_COLOR', 'PRD_SIZE', 'PRD_HEIGHT']
				}
			]
		},
		columns: [
			{ header: '거래처', name: 'CLI_NM', align: 'center' },
			{ header: '주문상품', name: 'PRD_NM', align: 'center', width: 150 },
			{ header: '색상', name: 'PRD_COLOR', align: 'center' },
			{ header: '사이즈', name: 'PRD_SIZE', align: 'center', width: 80 },
			{ header: '굽높이', name: 'PRD_HEIGHT', align: 'center', width: 80 },
			{ header: '수량', name: 'ODD_CNT', align: 'center' },
			{ header: '주문일시', name: 'ORD_REG_DATE', align: 'center', width: 130 },
			{ header: '상태', name: 'ODD_STS', align: 'center' }
		],
		data: []
	});

	try {
		const response = await fetch('/SOLEX/dashboard/orders');
		if (!response.ok) throw new Error('서버 응답 실패');

		const data = await response.json();
		grid.resetData(data);
	} catch (error) {
		console.error('🚨 그리드 데이터 로딩 실패:', error);
		alert('데이터를 불러오는 데 실패했습니다.');
	}
}

let donutChart;

// 인기 품목 도넛차트
async function renderDonutChart(startDate, endDate) {
	try {
		const params = new URLSearchParams({
			startDate: startDate.toISOString().split('T')[0],
			endDate: endDate.toISOString().split('T')[0]
		});

		const response = await fetch(`/SOLEX/dashboard/popular?${params}`);
		if (!response.ok) throw new Error('서버 응답 실패');

		const data = await response.json();

		const noDataMessage = document.getElementById('noDataMessage');
		const chartCanvas = document.getElementById('donutChart');

		// 데이터 없을 때
		if (!data || data.length === 0) {
			if (donutChart) {
				donutChart.destroy(); // 기존 차트 제거
				donutChart = null;
			}
			chartCanvas.style.display = "none";
			noDataMessage.style.display = "block";
			return;
		}

		let values = data.map(item => item.ORDER_QUANTITY);
		let total = values.reduce((sum, val) => sum + val, 0);

		let labels = data.map(item => {
			const percentage = ((item.ORDER_QUANTITY / total) * 100).toFixed(1);
			return `${item.PRD_NM} (${item.PRD_CODE}) - ${percentage}%`;
		});

		if (donutChart) donutChart.destroy();

		chartCanvas.style.display = "block";
		noDataMessage.style.display = "none";

		donutChart = new Chart(chartCanvas, {
			type: 'doughnut',
			data: {
				labels: labels,
				datasets: [{
					data: values,
					backgroundColor: ['#36b9cc', '#1cc88a', '#f6c23e', '#e74a3b', '#858796'],
					hoverOffset: 12
				}]
			},
			options: {
				responsive: true,
				maintainAspectRatio: false,
				plugins: {
					legend: {
						position: 'bottom',
						labels: {
							boxWidth: 14,
							padding: 12
						}
					}
				}
			}
		});
	} catch (err) {
		console.error('🚨 도넛 차트 로딩 오류:', err);
	}
}
