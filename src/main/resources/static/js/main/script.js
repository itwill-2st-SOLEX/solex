document.addEventListener('DOMContentLoaded', () => {
	const calendar = new tui.Calendar('#calendar', {
        defaultView   : 'month',
        taskView      : true,
        useFormPopup  : true,
        useDetailPopup: true,
		calendars: [
		  /* 개인 일정 : 산뜻한 스카이블루 */
		  {
		    id: 'personal',
		    name: '개인',
		    color: '#ffffff',          // 글자색
		    bgColor: '#4DA3FF',        // 배경색
		    dragBgColor: 'rgba(77,163,255,0.6)', // 드래그 중 배경 반투명
		    borderColor: '#4DA3FF'
		  },

		  /* 팀 일정 : 밝은 코랄오렌지 */
		  {
		    id: 'team',
		    name: '팀',
		    color: '#ffffff',
		    bgColor: '#FF8A4D',
		    dragBgColor: 'rgba(255,138,77,0.6)',
		    borderColor: '#FF8A4D'
		  },

		  /* (선택) 회사 공용 : 부드러운 보라 */
		  {
		    id: 'company',
		    name: '회사',
		    color: '#ffffff',
		    bgColor: '#A787FF',
		    dragBgColor: 'rgba(167,135,255,0.6)',
		    borderColor: '#A787FF'
		  }
		],
		template: {
			        popupIsAllday:       () => '종일 일정',
			        popupStateFree:      () => '', // 상태 선택 셀렉트 박스 텍스트
			        popupStateBusy:      () => '', // 상태 선택 셀렉트 박스 텍스트
			        titlePlaceholder:    () => '일정을 입력하세요',
			        locationPlaceholder: () => '', // location 필드는 CSS로 숨기므로 템플릿은 비워둡니다.
			        startDatePlaceholder:() => '시작',
			        endDatePlaceholder:  () => '종료',
			        popupSave:           () => '저장',
			        popupUpdate:         () => '수정',
			        popupDetailLocation: () => '', // 디테일 팝업에서도 location을 숨기려면 이 템플릿도 빈 문자열로.
					
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

