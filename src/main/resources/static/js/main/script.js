// dayjs 객체는 DOMContentLoaded 이벤트 리스너 외부에서 선언하여 전역적으로 접근 가능하게 합니다.
// 초기값으로 현재 날짜를 설정합니다.
let currentMonth = dayjs();

document.addEventListener('DOMContentLoaded', () => {
  /* ---------- 1. 캘린더 초기화 ----------------------------------- */
  const calendar = new tui.Calendar('#calendar', {
    defaultView   : 'month',
    taskView      : true,
    useFormPopup  : true,
    useDetailPopup: true,
	language      : 'ko',
    calendars: [
      {
        id  : 'personal',
		name: '개인',
        color: '#000',
		backgroundColor: '#00a9ff',
        dragBackgroundColor: 'rgba(0,169,255,0.6)',
		borderColor: '#00a9ff',
		isDraggable: false,
		isResizable: false
      },
      {
        id  : 'team',
		name: '팀',
        color: '#000',
		backgroundColor: '#ffbb3b',
        dragBackgroundColor: 'rgba(255,187,59,0.6)',
		borderColor: '#ffbb3b',
		isDraggable: false,
		isResizable: false
      },
      {
        id  : 'company',
		name: '회사',
        color: '#000',
		backgroundColor: '#ff5583',
        dragBackgroundColor: 'rgba(255,85,131,0.6)',
		borderColor: '#ff5583',
		isDraggable: false,
		isResizable: false
      }
    ],

    /* ---------- 2. 템플릿 : Busy → ★ 아이콘, 시간 표시 커스터마이징 ----------------------- */
    template: {
      popupIsAllday       : () => '종일',
      popupStateFree      : () => '중요',
      popupStateBusy      : () => '일반',
	  popupUpdate		  : () => '저장',
	  popupEdit			  : () => '변경',
	  popupDelete		  : () => '삭제',
      titlePlaceholder    : () => '일정을 입력하세요',
      startDatePlaceholder: () => '시작',
      endDatePlaceholder  : () => '종료',
      popupSave           : () => '저장',
      popupUpdate         : () => '수정',
      popupDetailLocation : () => '',

      popupDetailTitle: ({ title }) =>
          `<strong style="color:#111; font-size: 1.5em; display: block; margin-bottom: 5px;">${title}</strong>`,


      // *** popupDetailDate: 시간 일정일 경우 항상 시간을 표시하도록 변경 ***
      popupDetailDate: ({ start, end, isAllDay }) => {
          const startDate = new Date(start.getTime());
          const endDate = new Date(end.getTime());

          let dateStr;
          if (isAllDay) {
              // 종일 일정인 경우: 날짜만 표시하고 "종일" 텍스트 추가
              const startFmt = startDate.toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' });
              const actualEndDate = new Date(endDate.getTime());
              actualEndDate.setDate(actualEndDate.getDate() - 1);
              const endFmt = actualEndDate.toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' });

              dateStr = `${startFmt}`;
              if (startFmt !== endFmt) { // 시작 날짜와 종료 날짜가 다를 경우에만 ~ 종료 날짜 표시
                  dateStr += ` ~ ${endFmt}`;
              }
              dateStr += ` (종일)`;
          } else {
              // 시간 일정인 경우: 날짜와 시간을 항상 표시 (00:00 포함)
              const startDateTimeFmt = startDate.toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' }) + ' ' +
                                       startDate.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false });
              const endDateTimeFmt = endDate.toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' }) + ' ' +
                                     endDate.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false });

              if (startDateTimeFmt === endDateTimeFmt) {
                  // 시작 시간과 종료 시간이 동일하면 시작 시간만 표시 (예: 2025.07.03 09:00)
                  dateStr = startDateTimeFmt;
              } else {
                  // 시작 시간과 종료 시간이 다르면 둘 다 표시 (예: 2025.07.03 09:00 ~ 10:00)
                  dateStr = `${startDateTimeFmt} ~ ${endDateTimeFmt}`;
              }
          }
          return `<div class="tui-popup-detail-date"><i class="tui-icon tui-calendar-icon"></i> <span style="font-size: 1.2em;">${dateStr}</span></div>`;
      },

      popupDetailCalendar: (schedule) => {
          const calendarName = schedule.calendarName;
          let calendarColor = '#333';
          let fontWeight = 'normal';

          if (schedule.calendarId === 'personal') {
              calendarColor = '#00a9ff';
              fontWeight = '700';
          } else if (schedule.calendarId === 'team') {
              calendarColor = '#ffbb3b';
              fontWeight = 'bold';
          } else if (schedule.calendarId === 'company') {
              calendarColor = '#ff5583';
              fontWeight = 'bold';
          }

          return `<div class="tui-popup-detail-calendar calendar-name-display" style="color: ${calendarColor}; font-weight: ${fontWeight}; font-size: 1.1em;">
                      <i class="tui-icon tui-view-v-icon"></i> ${calendarName}
                  </div>`;
      },

	  popupDetailState: ({ state }) => {
	     const isImportant = state === 'Free';       // Free = 중요
	     const label = isImportant ? '중요' : '일반';
	     const color = isImportant ? '#ef3e3e' : '#262626';  // 오렌지 / 회색
	     return `
	       <span class="state-badge"
	             style="font-weight: 700; color:${color};">${label}</span>`;
	   },
	   
	   
      // *** time 템플릿: 시간 일정일 경우 항상 시간을 표시하도록 변경 ***
      time(schedule) {
        if (schedule.isAllDay) {
            return `${schedule.state === 'Free' ? '<span style="color:gold;margin-right:3px;">★</span>' : ''}${schedule.title}`;
        }
        const star = schedule.state === 'Free' ? '<span style="color:gold;margin-right:3px;">★</span>' : '';
        const startTime = new Date(schedule.start.getTime());
        // 00:00이더라도 시간을 표시
        const timeStr = startTime.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false });
        return `${star}<span class="tui-calendar-dot"></span> ${timeStr} ${schedule.title}`;
      },

      allday(schedule) {
        const star = schedule.state === 'Free' ? '<span style="color:gold;margin-right:3px;">★</span>' : '';
        return `${star}${schedule.title}`;
      },

      // *** monthGridSchedule 템플릿: 시간 일정일 경우 항상 시간을 표시하도록 변경 ***
      monthGridSchedule(schedule) {
        const star = schedule.state === 'Free' ? '<span style="color:gold;margin-right:3px;">★</span>' : '';
        let timeStr = '';
        if (!schedule.isAllDay) {
            const startTime = new Date(schedule.start.getTime());
            // 00:00이더라도 시간을 표시
            timeStr = startTime.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false });
            timeStr = `<span class="tui-calendar-dot"></span> ${timeStr}`;
        }
        return `${star}${timeStr} ${schedule.title}`;
      },

    }
  });

  /* ---------- 3. 새 일정 생성 (이전과 동일) ----------------------------------- */
  calendar.on('beforeCreateEvent', ({ title, start, end, isAllDay, calendarId, state, triggerEventName }) => {
    console.log("새로 생성될 이벤트 상태:", state, "트리거:", triggerEventName);

    if (triggerEventName === 'dragnw') {
        console.log("새 일정 드래그 생성이 차단되었습니다.");
        return;
    }

    // Explicitly adjust start/end times if it's an all-day event
    let finalStart = start;
    let finalEnd = end;
    let finalCategory = isAllDay ? 'allday' : 'time';

    if (isAllDay) {
        // 종일 일정의 경우, 시작 시간을 해당 날짜의 00:00으로,
        // 종료 시간을 다음 날의 00:00으로 정규화합니다 (TUI Calendar의 종일 일정 처리 방식).
        finalStart = dayjs(start).startOf('day').toDate();
        finalEnd = dayjs(end).add(1, 'day').startOf('day').toDate();
    }

    calendar.createEvents([{
      id         : String(Date.now()),
      calendarId : calendarId,
      title,
      start      : finalStart,
      end        : finalEnd,
      isAllDay, // 이 값은 팝업에서 넘어온 isAllDay 값을 그대로 사용
      category   : finalCategory,
      state      : state,
	  isDraggable: false,
	  isResizable: false
    }]);
  });

  /* ---------- 4. 팝업에서 ‘수정’ 저장 (이전과 동일) --------------------------- */
  calendar.on('beforeUpdateEvent', ({ event, changes }) => {
    // 드래그 또는 리사이즈에 의해 start 또는 end가 변경되면 업데이트를 막음
    if (changes.start || changes.end) {
        return;
    }

    // isAllDay 속성이 변경될 경우 category도 함께 업데이트
    if (typeof changes.isAllDay !== 'undefined') {
        if (changes.isAllDay) {
            changes.category = 'allday';
            // 종일 일정으로 변경될 경우, 시간도 해당 날짜의 00:00으로 정규화
            if (changes.start) {
                changes.start = dayjs(changes.start).startOf('day').toDate();
            } else { // start가 변경되지 않았다면 기존 이벤트의 시작 날짜를 사용
                changes.start = dayjs(event.start.getTime()).startOf('day').toDate();
            }
            if (changes.end) {
                changes.end = dayjs(changes.end).add(1, 'day').startOf('day').toDate();
            } else { // end가 변경되지 않았다면 기존 이벤트의 종료 날짜를 사용
                changes.end = dayjs(event.end.getTime()).add(1, 'day').startOf('day').toDate();
            }
        } else {
            changes.category = 'time';
            // 종일 일정이 아닌 경우 (시간 일정), 시간은 그대로 유지 (TUI Calendar가 처리)
            // (00:00일 경우에도 표시)
        }
    }

    calendar.updateEvent(event.id, event.calendarId, changes);
  });

  /* ---------- 5. 팝업에서 ‘삭제’ ------------------------------- */
  calendar.on('beforeDeleteEvent', ({ id, calendarId }) => {
    calendar.deleteEvent(id, calendarId);
  });

  //요일 한글로 표시
  	calendar.setOptions({
  	  month: {
  	    dayNames: ['일', '월', '화', '수', '목', '금', '토'],
  	  },
  	});
  	

  // 함수 정의: TUI Calendar와 dayjs 기반의 월 표시를 동기화
  function updateCalendarAndLabel() {

	  const firstDay = currentMonth.startOf('month');
      calendar.setDate(currentMonth.toDate());
      monthLabel.textContent = `${currentMonth.year()}년 ${currentMonth.month() + 1}월`;
      loadMonthlyData();
  }

  // HTML 요소 참조
  const monthLabel = document.getElementById('monthLabel');
  const prevMonthBtn = document.getElementById('prevMonthBtn');
  const nextMonthBtn = document.getElementById('nextMonthBtn');


  // 이전 월 선택 버튼 이벤트
  prevMonthBtn.addEventListener('click', () => {
      currentMonth = currentMonth.subtract(1, 'month');
      updateCalendarAndLabel();
  });

  // 다음 월 선택 버튼 이벤트
  nextMonthBtn.addEventListener('click', () => {
	  currentMonth = currentMonth.add(1, 'month');
	  updateCalendarAndLabel();
  });

  // 초기 로드 시 캘린더와 월 라벨 업데이트
  updateCalendarAndLabel();

  // loadMonthlyData 함수가 정의되어 있지 않으므로 임시로 빈 함수 선언
  function loadMonthlyData() {
      console.log(`${currentMonth.year()}년 ${currentMonth.month() + 1}월의 데이터를 로드합니다.`);
  }
  

});

