document.addEventListener('DOMContentLoaded', () => {
	const calendar = new tui.Calendar('#calendar', {
        defaultView   : 'month',
        taskView      : true,
        useFormPopup  : true,
        useDetailPopup: true,
        //calendars     : [{ id:'todo', name:'To‑Do', backgroundColor:'#ffbb3b' }],
		template: {
		    popupIsAllday:       () => '종일 일정',
		    popupStateFree:      () => '🟢 개인',
		    popupStateBusy:      () => '🔴 전체',
		    titlePlaceholder:    () => '제목을 입력하세요',
		    locationPlaceholder: () => '장소를 입력하세요',
		    startDatePlaceholder:() => '시작',
		    endDatePlaceholder:  () => '종료',
		    popupSave:           () => '저장',
		    popupUpdate:         () => '수정',
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

