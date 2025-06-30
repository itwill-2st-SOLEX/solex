$(function() {
	// 최근 주문 요청현황
	recentOrderGrid();
	// 최근 생산 완료된 제품들
	recentFinishedList();
	// 페이지 맨 위 3개 요약카드
	dashboardSummary();
	// 인기 품목
	renderDonutChart();
	// ✅ 숫자 지표 카드 설정
	$('#defectRate').text('2.29%');

	// ✅ 생산량 추이 꺾은선 그래프 (Chart.js)
	const lineCtx = document.getElementById('lineChart').getContext('2d');
	let lineChart = new Chart(lineCtx, {
		type: 'line',
		data: getLineChartData('monthly'),
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

	// ✅ 토글 버튼 이벤트
	$('.toggle-btn').on('click', function() {
		$('.toggle-btn').removeClass('active');
		$(this).addClass('active');
		const type = $(this).data('type');
		lineChart.data = getLineChartData(type);
		lineChart.update();
	});

	// ✅ 꺾은선 그래프 데이터 함수
	function getLineChartData(type) {
		const base = {
			labels: [],
			datasets: [{
				label: '생산량',
				data: [],
				borderColor: '#4e73df',
				backgroundColor: '#4e73df',
				fill: false,
				pointBackgroundColor: '#fff',
				pointBorderColor: '#4e73df',
				pointRadius: 5,
				pointHoverRadius: 7
			}]
		};

		if (type === 'monthly') {
			base.labels = ['1월', '2월', '3월', '4월', '5월', '6월'];
			base.datasets[0].data = [1000, 1200, 980, 1250, 1320, 1450];
		} else if (type === 'weekly') {
			base.labels = ['1주', '2주', '3주', '4주'];
			base.datasets[0].data = [310, 450, 380, 390];
		} else if (type === 'daily') {
			base.labels = ['월', '화', '수', '목', '금', '토', '일'];
			base.datasets[0].data = [50, 60, 55, 70, 65, 40, 30];
		}

		return base;
	}

	// ✅ 도넛 차트 (품목별 비율)
	new Chart(document.getElementById('donutChart'), {
		type: 'doughnut',
		data: {
			labels: ['Segment A', 'Segment B', 'Segment C'],
			datasets: [{
				data: [45, 35, 20],
				backgroundColor: ['#36b9cc', '#1cc88a', '#f6c23e'],
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

		//		document.getElementById('defectRate').textContent = (data.defectRate ?? 0) + '%';
		//		document.getElementById('defectRateTrend').textContent = formatRate(data.defectRateTrend);
		debugger;
	} catch (err) {
		console.error('🚨 요약 카드 데이터 불러오기 실패:', err);
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

// 최근 생산 완료된 제품들
async function recentFinishedList() {
	try {
		const response = await fetch('/SOLEX/dashboard/completed');
		if (!response.ok) throw new Error('서버 응답 실패');

		const data = await response.json();

		const container = document.querySelector('.recent-finished-list');
		container.innerHTML = '';

		data.forEach(item => {
			const li = `
				<li class="prd-card">
					<strong>${item.PRD_NM}, ${item.PRD_COLOR} ${item.PRD_SIZE} ${item.PRD_HEIGHT}cm</strong>
					<span class="time">${item.ORD_MOD_DATE} ${item.ODD_STS}</span>
				</li>
			`;
			container.insertAdjacentHTML('beforeend', li);
		});
	} catch (err) {
		console.error('🚨 최근 생산 완료 리스트 불러오기 실패:', err);
	}
}

//async function renderDonutChart() {
//	try {
//		const response = await fetch('/SOLEX/dashboard/popularItems');
//		if (!response.ok) throw new Error('서버 응답 실패');
//
//		const data = await response.json(); // [{ label: 'A', value: 100 }, ...] 형태라고 가정
//
//		const labels = data.map(item => item.label);
//		const values = data.map(item => item.value);
//
//		new Chart(document.getElementById('donutChart'), {
//			type: 'doughnut',
//			data: {
//				labels: labels,
//				datasets: [{
//					data: values,
//					backgroundColor: ['#36b9cc', '#1cc88a', '#f6c23e', '#e74a3b', '#858796'],
//					hoverOffset: 12
//				}]
//			},
//			options: {
//				responsive: true,
//				maintainAspectRatio: false,
//				plugins: {
//					legend: {
//						position: 'bottom',
//						labels: {
//							boxWidth: 14,
//							padding: 12
//						}
//					}
//				}
//			}
//		});
//	} catch (error) {
//		console.error('🚨 도넛 차트 데이터 로딩 실패:', error);
//	}
//}