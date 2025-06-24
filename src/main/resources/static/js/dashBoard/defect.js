$(function () {
  // ✅ 숫자 지표 카드 설정
  $('#todayCount').text('6,452');
  $('#todayRate').text('+5.39%');
  $('#monthCount').text('42,502');
  $('#monthRate').text('-0.65%');
  $('#defectRate').text('2.29%');
  $('#defectRateTrend').text('+2.29%');

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
  $('.toggle-btn').on('click', function () {
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

  // ✅ 최근 생산내역 (TUI Grid 사용)
  const grid = new tui.Grid({
    el: document.getElementById('orderGrid'),
    bodyHeight: 300,
    rowHeaders: ['rowNum'],
    columns: [
      { header: '거래처', name: 'client', align: 'center' },
      { header: '요청일', name: 'requestDate', align: 'center' },
      { header: '수량', name: 'quantity', align: 'center' },
      { header: '상태', name: 'status', align: 'center' }
    ],
    data: [
      { client: '삼성전자', requestDate: '2025-06-20', quantity: 100, status: '완료' },
      { client: 'LG화학', requestDate: '2025-06-19', quantity: 80, status: '대기' }
    ]
  });

  // ✅ 최근 생산 완료 리스트 동적 삽입
  const recentFinishedList = [
    { name: '릴 케이스 13', time: '2025-06-19 13:00' },
    { name: '패킹 지지대', time: '2025-06-19 10:20' },
    { name: '기어 커버 A', time: '2025-06-18 16:50' }
  ];

  recentFinishedList.forEach(item => {
    const li = `
      <li>
        <strong>${item.name}</strong>
        <span class="time">${item.time} 생산 완료</span>
      </li>
    `;
    $('.recent-finished-list').append(li);
  });
});
