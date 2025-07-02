const calendar = new tui.Calendar('#calendar', {
        defaultView   : 'month',
        taskView      : true,
        useFormPopup  : true,
        useDetailPopup: true,
        calendars     : [{ id:'todo', name:'To‑Do', backgroundColor:'#ffbb3b' }]
        });

        // 팝업에서 "저장" 눌렀을 때 호출됨
        calendar.on('beforeCreateEvent', ({ title, start, end, isAllDay }) => {
            // 달력에 바로 추가
            calendar.createEvents([
            {
                id        : String(Date.now()), // 임시 ID
                calendarId: 'todo',
                title     : title,
                start     : start,
                end       : end,
                isAllDay  : isAllDay,
                category  : isAllDay ? 'allday' : 'time'
            }
            ]);
        });

        /* ── 디테일 팝업 → ‘수정’ 후 저장 ------------------------- */
        calendar.on('beforeUpdateEvent', ({ event, changes }) => {
        calendar.updateEvent(event.id, event.calendarId, changes);
        });

        /* ── 디테일 팝업 → ‘삭제’ ------------------------------- */
        calendar.on('beforeDeleteEvent', ({ id, calendarId }) => {
        calendar.deleteEvent(id, calendarId);
        });











/*document.addEventListener('DOMContentLoaded', () => {
  const $ = (sel) => document.querySelector(sel);

  // 공지사항
  fetch('/api/notices/recent?count=3')
    .then(res => res.json())
    .then(data => {
      $('#noticeList').innerHTML = data.map(n =>
        `<li><a href="/notice/${n.id}" target="_blank">${n.title}</a></li>`
      ).join('');
    });

  // 매출액
  fetch('/api/sales/month')
    .then(res => res.json())
    .then(({ amount, month }) => {
      $('#monthlySales').textContent = `${amount.toLocaleString()} 원`;
      $('#salesPeriod').textContent = `${month} 기준`;
    });

  // 인기 상품
  fetch('/api/products/popular?limit=5')
    .then(res => res.json())
    .then(list => {
      $('#popularProducts').innerHTML = list.map(p =>
        `<li>${p.name} (${p.count}개)</li>`
      ).join('');
    });

  // 결재 목록
  fetch('/api/approvals/pending')
    .then(res => res.json())
    .then(data => {
      $('#approvalList').innerHTML = data.map(item =>
        `<li><a href="/approval/${item.id}" target="_blank">${item.title}</a></li>`
      ).join('');
    });

  // 즐겨찾기
  fetch('/api/menus/favorites')
    .then(res => res.json())
    .then(list => {
      $('#favoriteMenus').innerHTML = list.map(m =>
        `<li><a href="${m.url}" target="_blank">${m.name}</a></li>`
      ).join('');
    });

  // Toast UI Calendar 설정
  const MOCK_CALENDARS = [
    {
      id: '1',
      name: '업무 일정',
      backgroundColor: '#03bd9e',
      borderColor: '#03bd9e',
    },
    {
      id: '2',
      name: '회의',
      backgroundColor: '#00a9ff',
      borderColor: '#00a9ff',
    },
  ];

  const cal = new tui.Calendar('#app', {
    defaultView: 'month',
    calendars: MOCK_CALENDARS,
    useCreationPopup: true,    // 일정 생성 팝업 활성화
    useDetailPopup: true,      // 일정 상세보기 팝업 활성화
    template: {
      popupIsAllday: () => '종일',
      popupStateFree: () => '🟢 Free',
      popupStateBusy: () => '🔴 Busy',
      titlePlaceholder: () => '제목 입력',
      startDatePlaceholder: () => '시작일',
      endDatePlaceholder: () => '종료일',
      popupSave: () => '저장',
      popupUpdate: () => '수정',
      popupEdit: () => '편집',
      popupDelete: () => '삭제',
      popupDetailTitle: (data) => `일정: ${data.title}`,
    },
  });

  
  

  // 달력 버튼 이벤트
  $('.today').onclick = () => { cal.today(); updateRange(); };
  $('.prev').onclick = () => { cal.prev(); updateRange(); };
  $('.next').onclick = () => { cal.next(); updateRange(); };

  function updateRange() {
    const start = cal.getDateRangeStart();
    const end = cal.getDateRangeEnd();
    $('.navbar--range').textContent = `${start.getFullYear()}-${start.getMonth() + 1} ~ ${end.getFullYear()}-${end.getMonth() + 1}`;
  }

  updateRange();
  
  function updateRange() {
    // 현재 보이는 날짜 가져오기
    const currentDate = cal.getDate();
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth() + 1;

    // 원하는 형식으로 출력: 예) 2025년 7월
    document.querySelector('.navbar--range').textContent = `${year}년 ${month}월`;
  }
});
*/