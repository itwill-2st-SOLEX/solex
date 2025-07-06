// 현재 날짜로 초기화
let currentMonth = dayjs();
let loginEmp = null;
let calendar = null;

let monthLabel;
let prevMonthBtn;
let nextMonthBtn;

document.addEventListener('DOMContentLoaded', async () => {
    monthLabel = document.getElementById('monthLabel');
    prevMonthBtn = document.getElementById('prevMonthBtn');
    nextMonthBtn = document.getElementById('nextMonthBtn');

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

    try {
        const res = await fetch('/SOLEX/main/api/loginEmp');
        loginEmp = await res.json();

        console.log('loginEmp:', loginEmp);
        /* loginEmp 세팅 완료 후 달력 초기화 및 표시 */
        initCalendar();
        updateCalendarAndLabel();
    } catch (e) {
        console.error('loginEmp 조회 실패', e);
        alert('로그인 정보를 가져오지 못했습니다.');
    }
});

function initCalendar() {
    calendar = new tui.Calendar('#calendar', {
        defaultView: 'month',
        taskView: true,
        useFormPopup: true,
        useDetailPopup: true,
        language: 'ko',
        calendars: [
            {
                id: 'personal',
                name: '개인',
                color: '#000',
                backgroundColor: '#ffbb3b',
                dragBackgroundColor: 'rgba(255,187,59,0.6)',
                borderColor: '#111111',
                isDraggable: false,
                isResizable: false
            },
            {
                id: 'team',
                name: '팀',
                color: '#fff',
                backgroundColor: '#00a9ff',
                dragBackgroundColor: 'rgba(0,169,255,0.6)',
                borderColor: '#111111',
                isDraggable: false,
                isResizable: false
            },
            {
                id: 'company',
                name: '회사',
                color: '#fff',
                backgroundColor: '#ff5583',
                dragBackgroundColor: 'rgba(255,85,131,0.6)',
                borderColor: '#111111',
                isDraggable: false,
                isResizable: false
            },
			{
			    id: 'leave',
			    name: '연차',
			    color: '#333',
			    backgroundColor: '#b7f3c4',           // 초록 계열 예시
			    dragBackgroundColor: 'rgba(40,167,69,0.6)',
			    borderColor: '#1e7e34',
			    isDraggable: false,
			    isResizable: false
			}
        ],
        // 일정 등록 커스터마이징 템플릿
        template: {
            popupisAllday: () => '종일',
            popupStateFree: () => '중요', // Free = 중요 표시
            popupStateBusy: () => '일반',
            popupUpdate: () => '저장',
            popupEdit: () => '변경',
            popupDelete: () => '삭제',
            titlePlaceholder: () => '일정을 입력하세요',
            startDatePlaceholder: () => '시작',
            endDatePlaceholder: () => '종료',
            popupSave: () => '저장',
            popupUpdate: () => '수정',
            popupDetailLocation: () => '',
            popupDetailTitle: ({ title }) =>
                `<strong style="color:#111; font-size: 1.5em; display: block; margin-bottom: 5px;">${title}</strong>`,
            popupDetailAttendees: ({ attendees = [], raw = {} } = {}) => {
                if (attendees.length === 0) return '';
                const { id, name } = attendees[0];
                const { depNm = '', teamNm = '', posNm = '' } = raw;
                return `
                    <div class="tui-popup-detail-item">
                        <i class="toastui-calendar-ic-user"></i>
                        <span style="font-weight:500;">작성자</span> : ${depNm} ${teamNm} ${name} ${posNm}
                    </div>`;
            },
            // 일정 상세보기 날짜 표시
            popupDetailDate: ({ start, end, isAllday }) => {
                const startDate = new Date(start.getTime());
                const endDate = new Date(end.getTime());
                let dateStr;

                if (isAllday) {
                    // 종일 일정: 날짜만, 종일 표시 포함
                    const startFmt = startDate.toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' });
                    const endFmt = endDate.toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' });
                    dateStr = startFmt;
                    if (startFmt !== endFmt) dateStr += ` ~ ${endFmt}`;
                    dateStr += ' (종일)';
                } else {
                    // 시간 포함 표시
                    const startDateTimeFmt =
                        startDate.toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' }) + ' ' +
                        startDate.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false });
                    const endDateTimeFmt =
                        endDate.toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' }) + ' ' +
                        endDate.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false });

                    dateStr = startDateTimeFmt === endDateTimeFmt ? startDateTimeFmt : `${startDateTimeFmt} ~ ${endDateTimeFmt}`;
                }

                return `<div class="tui-popup-detail-date">
                            <i class="tui-icon tui-calendar-icon"></i> 
                            <span style="font-size: 1.18em;">${dateStr}</span>
                        </div>`;
            },
            // 일정 상세보기 캘린더 구분 표시
            popupDetailCalendar: (schedule) => {
                let calendarColor = '#333';
                let fontWeight = 'normal';

                switch (schedule.calendarId) {
                    case 'personal':
                        calendarColor = '#00a9ff';
                        fontWeight = '700';
                        break;
                    case 'team':
                        calendarColor = '#ffbb3b';
                        fontWeight = 'bold';
                        break;
                    case 'company':
                        calendarColor = '#ff5583';
                        fontWeight = 'bold';
                        break;
                }

                return `<div class="tui-popup-detail-calendar calendar-name-display" style="color: ${calendarColor}; font-weight: ${fontWeight}; font-size: 1.1em;">
                            <i class="tui-icon tui-view-v-icon"></i> ${schedule.calendarName}
                        </div>`;
            },
            popupDetailState: ({ state }) => {
                const isImportant = state === 'Free'; // Free = 중요
                const label = isImportant ? '중요' : '일반';
                const color = isImportant ? '#ef3e3e' : '#444';
                return `<span class="state-badge" style="color:${color};">${label}</span>`;
            },
            // 중요 일정 별 표시 (시간별, 종일)
            time(schedule) {
                if (schedule.isAllday) {
                    return `${schedule.state === 'Free' ? '<span style="color:gold;margin-right:3px;">⭐</span>' : ''}${schedule.title}`;
                }
                const star = schedule.state === 'Free' ? '<span style="color:gold;margin-right:3px;">⭐</span>' : '';
                const startTime = new Date(schedule.start.getTime());
                const timeStr = startTime.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false });
                return `${star}<span class="tui-calendar-dot"></span> ${timeStr} ${schedule.title}`;
            },
            allday(schedule) {
                const star = schedule.state === 'Free' ? '<span style="color:gold;margin-right:3px;">⭐</span>' : '';
                return `${star}${schedule.title}`;
            },
            // 달력 월 그리드 일정 표시
            monthGridSchedule(schedule) {
                const star = schedule.state === 'Free' ? '<span style="color:gold;margin-right:3px;">★</span>' : '';
                let timeStr = '';
                if (!schedule.isAllday) {
                    const startTime = new Date(schedule.start.getTime());
                    timeStr = `<span class="tui-calendar-dot"></span> ${startTime.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false })}`;
                }
                return `${star}${timeStr} ${schedule.title}`;
            }
        }
    });


    // 일정 이동 및 크기 조절 비활성화 (이벤트 취소)
    calendar.on('beforeEventMove', () => false);
    calendar.on('beforeEventResize', () => false);

    /* ---------- 새 일정 생성 처리 ---------- */
    calendar.on('beforeCreateEvent', async ev => {
        const body = {
            calTitle: ev.title,
            calCate: ev.calendarId.toUpperCase(),
            calIsAllDay: ev.isAllday ? 'Y' : 'N',
            calIsImportant: ev.state === 'Free' ? 'Y' : 'N',
            calStartDate: dateFormat(ev.start.toDate()),
            calEndDate: dateFormat(ev.end.toDate())
        };

        const res = await fetch('/SOLEX/main/api/calendar', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });

        if (!res.ok) {
            alert('일정 저장 실패');
            console.error(await res.text());
            return;
        }

        const saved = await res.json(); // { calId: 123, ... }
        console.log('saved:', saved);

        // 서버에서 받은 calId로 캘린더에 일정 즉시 추가
        calendar.createEvents([{
            ...ev,
            id: String(saved.calId),
            empId: loginEmp.empId,
            isReadOnly: false,
            raw: { empId: loginEmp.empId },
            calendarId: ev.calendarId
        }]);
    });

    /* ---------- 일정 수정 처리 ---------- */
    calendar.on('beforeUpdateEvent', async ({ event, changes }) => {
		if(event.isReadOnly) {
		        alert('이 일정은 수정할 수 없습니다.');
		        return false;  // 캔슬
		    }
			
        const data = {
            calId: event.id,
            calTitle: changes.title ?? event.title,
            calCate: event.calendarId.toUpperCase(),
            calIsAllDay: (changes.isAllday ?? event.isAllday) ? 'Y' : 'N',
            calIsImportant: (changes.state ?? event.state) === 'Free' ? 'Y' : 'N',
            calStartDate: dateFormat((changes.start ?? event.start).toDate()),
            calEndDate: dateFormat((changes.end ?? event.end).toDate())
        };

        console.log(data);

        const res = await fetch(`/SOLEX/main/api/calendar/${event.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        if (!res.ok) {
            alert('일정 수정 실패');
            console.error(await res.text());
            return;
        }

        // 변경 사항 화면 즉시 반영
        calendar.updateEvent(event.id, event.calendarId, changes);
    });

    /* ---------- 일정 삭제 처리 ---------- */
    calendar.on('beforeDeleteEvent', async ({ id }) => {
		const ev = calendar.getEvent(id);
		    if(ev.isReadOnly) {
		        alert('이 일정은 삭제할 수 없습니다.');
		        return false;
		    }

        const res = await fetch(`/SOLEX/main/api/calendar/${id}`, {
            method: 'DELETE'
        });

        if (!res.ok) {
            alert('일정 삭제 실패');
            console.error(await res.text());
            return;
        }

        // 삭제 후 전체 일정 다시 불러오기
        await loadMonthlyData();
    });

    updateCalendarAndLabel();
}

// TUI Calendar와 dayjs 기반 월 표시 동기화 및 일정 데이터 로드
function updateCalendarAndLabel() {
    calendar.setDate(currentMonth.toDate());
    monthLabel.textContent = `${currentMonth.year()}년 ${currentMonth.month() + 1}월`;
    loadMonthlyData();
}

// 날짜 포맷 함수: Oracle 처리에 안전한 "YYYY-MM-DD HH:mm:ss" 형태 반환
function dateFormat(date) {
    return dayjs(date).format('YYYY-MM-DD HH:mm:ss');
}

// 해당 월의 일정 데이터를 서버에서 가져와 캘린더에 표시
async function loadMonthlyData() {
    if (!calendar) {
        console.warn('calendar가 아직 초기화되지 않았습니다.');
        return;
    }

    const start = currentMonth.startOf('month').format('YYYY-MM-DD HH:mm:ss');
    const end = currentMonth.endOf('month').add(1, 'day').format('YYYY-MM-DD HH:mm:ss');

    const res1 = await fetch(`/SOLEX/main/api/calendar?start=${start}&end=${end}`);
    const res2 = await fetch(`/SOLEX/main/api/leave?start=${start}&end=${end}`);

    if (!res1.ok) {
        console.error(await res.text());
        return;
    }

	const calEvents = await res1.json();
	const leaveEvents = await res2.json();

    /* 회사·팀·개인별로 필터링 처리 (클라이언트) */
    const { empId: myId, empDepCd: myDep, empTeamCd: myTeam } = loginEmp;

    const visible = calEvents.filter(ev => {
        if (ev.calCate === 'COMPANY') return true;
        if (ev.calCate === 'TEAM') return ev.depCd === myDep && ev.teamCd === myTeam;
        return ev.empId === myId; // PERSONAL 일정만 표시
    });

    calendar.clear();

    calendar.createEvents(visible.map(ev => ({
        id: String(ev.calId),
        calendarId: ev.calCate.toLowerCase(),
        title: ev.calTitle,
        start: new Date(ev.calStartDate),
        end: new Date(ev.calEndDate),
        isAllday: ev.calIsAllDay === 'Y',
        state: ev.calIsImportant === 'Y' ? 'Free' : 'Busy',
        isReadOnly: ev.empId !== loginEmp.empId,
        attendees: [{
            id: ev.empId,
            name: ev.empNm,
            type: 'required'
        }],
        raw: {
            empId: ev.empId,
            depNm: ev.depNm,
            teamNm: ev.teamNm,
            posNm: ev.posNm
        }
    })));
	
	calendar.createEvents(leaveEvents.map(ev => ({
	        id: `leave-${ev.calId}`,
	        calendarId: 'leave',
	        title: ev.empNm + ev.posNm + " " +ev.calTitle,
	        start: new Date(ev.calStartDate),
	        end: new Date(ev.calEndDate),
	        //isAllday: ev.calIsAllDay === 'Y',
	        //state: ev.calIsImportant === 'Y' ? 'Free' : 'Busy',
	        isReadOnly: true,
	        attendees: [{
	            id: ev.empId,
	            name: ev.empNm,
	            type: 'required'
	        }],
	        raw: {
	            empId: ev.empId,
	            depNm: ev.depNm,
	            teamNm: ev.teamNm,
	            posNm: ev.posNm
	        }
	    })));
}
