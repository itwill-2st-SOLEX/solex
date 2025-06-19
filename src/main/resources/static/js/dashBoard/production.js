const productionCtx = document.getElementById('productionChart').getContext('2d');
new Chart(productionCtx, {
	type: 'bar',
	data: {
		labels: ['제품A', '제품B', '제품C', '제품D'],
		datasets: [{
			label: '생산량',
			data: [120, 90, 150, 80],
			backgroundColor: '#4e73df',
			borderRadius: 8,
			barThickness: 40
		}]
	},
	options: {
		responsive: true,
		maintainAspectRatio: false,
		plugins: {
			legend: { display: false },
			title: {
				display: false
			},
			tooltip: {
				backgroundColor: '#f8f9fc',
				titleColor: '#333',
				bodyColor: '#333',
				borderColor: '#ddd',
				borderWidth: 1
			}
		},
		scales: {
			y: {
				beginAtZero: true,
				ticks: { stepSize: 50 }
			}
		}
	}
});
const lineCtx = document.getElementById('lineChart').getContext('2d');

// 초기 차트 생성
const lineChart = new Chart(lineCtx, {
	type: 'line',
	data: getLineChartData('monthly'),
	options: {
		responsive: true,
		maintainAspectRatio: false,
		plugins: {
			legend: { position: 'top' }
		},
		scales: {
			y: { beginAtZero: true }
		}
	}
});

// 버튼 클릭 시 데이터 변경
document.querySelectorAll('.toggle-btn').forEach(btn => {
	btn.addEventListener('click', () => {
		// 버튼 스타일 변경
		document.querySelectorAll('.toggle-btn').forEach(b => b.classList.remove('active'));
		btn.classList.add('active');

		const type = btn.dataset.type; // monthly, weekly, daily
		const newData = getLineChartData(type);
		lineChart.data = newData;
		lineChart.update();
	});
});

// 데이터셋 함수
function getLineChartData(type) {
	if (type === 'monthly') {
		return {
			labels: ['1월', '2월', '3월', '4월', '5월', '6월'],
			datasets: [{
				label: '생산량',
				data: [100, 120, 90, 140, 130, 150],
				borderColor: '#4e73df',
				backgroundColor: '#4e73df',
				fill: false
			}]
		};
	} else if (type === 'weekly') {
		return {
			labels: ['1주', '2주', '3주', '4주'],
			datasets: [{
				label: '생산량',
				data: [320, 410, 380, 390],
				borderColor: '#36b9cc',
				backgroundColor: '#36b9cc',
				fill: false
			}]
		};
	} else if (type === 'daily') {
		return {
			labels: ['월', '화', '수', '목', '금', '토', '일'],
			datasets: [{
				label: '생산량',
				data: [50, 60, 55, 70, 65, 40, 30],
				borderColor: '#f6c23e',
				backgroundColor: '#f6c23e',
				fill: false
			}]
		};
	}
}

const defectCtx = document.getElementById('defectChart').getContext('2d');
new Chart(defectCtx, {
	type: 'doughnut',
	data: {
		labels: ['불량A', '불량B', '불량C'],
		datasets: [{
			data: [30, 20, 10],
			backgroundColor: ['#f6c23e', '#e74a3b', '#36b9cc'],
			hoverOffset: 10
		}]
	},
	options: {
		responsive: true,
		maintainAspectRatio: false,
		plugins: {
			legend: { position: 'bottom' },
			tooltip: {
				backgroundColor: '#f8f9fc',
				titleColor: '#333',
				bodyColor: '#333',
				borderColor: '#ddd',
				borderWidth: 1
			}
		}
	}
});
