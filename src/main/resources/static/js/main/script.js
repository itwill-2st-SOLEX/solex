document.addEventListener('DOMContentLoaded', () => {
	const calendar = new tui.Calendar('#calendar', {
        defaultView   : 'month',
        taskView      : true,
        useFormPopup  : true,
        useDetailPopup: true,
        //calendars     : [{ id:'todo', name:'To‑Do', backgroundColor:'#ffbb3b' }],
		template: {
            popupIsAllday:       () => '종일 일정',
            // 이 부분을 원래대로 돌려놓거나 원하는 텍스트를 넣으세요.
            // 이렇게 해야 팝업 상단의 select box가 보입니다.
            popupStateFree:      () => '🟢 개인',
            popupStateBusy:      () => '🔴 전체',
            titlePlaceholder:    () => '제목을 입력하세요',
            // locationPlaceholder는 CSS로 숨기므로 여기서 비워도 되지만,
            // 필드 자체가 사라지므로 이 템플릿의 영향은 적습니다.
            locationPlaceholder: () => '',
            startDatePlaceholder:() => '시작',
            endDatePlaceholder:  () => '종료',
            popupSave:           () => '저장',
            popupUpdate:         () => '수정',
            popupDetailLocation: () => '', // 디테일 팝업에서도 location을 숨기려면 이 템플릿도 빈 문자열로.
            // 디테일 팝업 타이틀을 굵게 + 색상
            popupDetailTitle: ({ title }) =>
              `<strong style="color:#2d7efc">${title}</strong>`
		  }
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
});

