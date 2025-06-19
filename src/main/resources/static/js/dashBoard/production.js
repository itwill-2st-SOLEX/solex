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
new Chart(lineCtx, {
	type: 'line',
	data: {
		labels: ['1월', '2월', '3월', '4월', '5월', '6월'],
		datasets: [{
			label: '생산량 추이',
			data: [100, 120, 90, 140, 130, 150],
			fill: false,
			borderColor: '#4e73df',
			backgroundColor: '#4e73df',
			pointRadius: 5,
			pointBackgroundColor: '#fff',
			pointBorderColor: '#4e73df'
		}]
	},
	options: {
		responsive: true,
		maintainAspectRatio: false,
		plugins: {
			legend: { position: 'top' },
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
				ticks: { stepSize: 20 }
			}
		}
	}
});

const defectCtx = document.getElementById('defectChart').getContext('2d');
new Chart(defectCtx, {
	type: 'pie',
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
