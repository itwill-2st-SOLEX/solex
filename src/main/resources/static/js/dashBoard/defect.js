// ✅ 숫자 지표 카드 설정
document.getElementById('todayCount').innerText = '6,452';
document.getElementById('todayRate').innerText = '+5.39%';

document.getElementById('monthCount').innerText = '42,502';
document.getElementById('monthRate').innerText = '-0.65%';

document.getElementById('defectRate').innerText = '2.29%';
document.getElementById('defectRateTrend').innerText = '+2.29%';

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
			y: {
				beginAtZero: true
			}
		}
	}
});

// ✅ 토글 버튼 이벤트
document.querySelectorAll('.toggle-btn').forEach(btn => {
	btn.addEventListener('click', () => {
		document.querySelectorAll('.toggle-btn').forEach(b => b.classList.remove('active'));
		btn.classList.add('active');
		const type = btn.dataset.type;
		lineChart.data = getLineChartData(type);
		lineChart.update();
	});
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

// ✅ 당월 생산량 (막대 그래프)
new Chart(document.getElementById('productionChart'), {
	type: 'bar',
	data: {
		labels: ['A 제품', 'B 제품', 'C 제품', 'D 제품'],
		datasets: [{
			label: '생산량',
			data: [120, 95, 150, 80],
			backgroundColor: '#4e73df',
			borderRadius: 8,
			barThickness: 40
		}]
	},
	options: {
		responsive: true,
		maintainAspectRatio: false,
		plugins: {
			legend: { display: false }
		},
		scales: {
			y: { beginAtZero: true }
		}
	}
});

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

// ✅ 최근 생산내역 테이블 데이터 세팅
const orderTable = document.getElementById('orderTable');
const orders = [
	{ name: '거래처 A', date: '2025-06-18', qty: 4200, status: '완료' },
	{ name: '거래처 B', date: '2025-06-17', qty: 3100, status: '진행중' },
	{ name: '거래처 C', date: '2025-06-16', qty: 2800, status: '완료' },
	{ name: '거래처 D', date: '2025-06-15', qty: 1950, status: '지연' }
];

orders.forEach(order => {
	const row = `
    <tr>
      <td>${order.name}</td>
      <td>${order.date}</td>
      <td>${order.qty.toLocaleString()}</td>
      <td>${order.status}</td>
    </tr>
  `;
	orderTable.insertAdjacentHTML('beforeend', row);
});

const recentFinishedList = [
  { name: '릴 케이스 13', time: '2025-06-19 13:00' },
  { name: '패킹 지지대', time: '2025-06-19 10:20' },
  { name: '기어 커버 A', time: '2025-06-18 16:50' }
];

const recentUl = document.querySelector('.recent-finished-list');
recentFinishedList.forEach(item => {
  const li = `
    <li>
      <strong>${item.name}</strong>
      <span class="time">${item.time} 생산 완료</span>
    </li>
  `;
  recentUl.insertAdjacentHTML('beforeend', li);
});
