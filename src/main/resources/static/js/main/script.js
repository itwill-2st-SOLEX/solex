
//현재 날짜로 초기화
let currentMonth = dayjs();

document.addEventListener('DOMContentLoaded', () => {
	
	//캘린더 설정
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
				backgroundColor: '#ffbb3b', 
	        	dragBackgroundColor: 'rgba(255,187,59,0.6)',
				borderColor: '#111111',
				isDraggable: false,
				isResizable: false
	      	},
	      	{
	        	id  : 'team',
				name: '팀',
	        	color: '#fff',
				backgroundColor: '#00a9ff',
	       		dragBackgroundColor: 'rgba(0,169,255,0.6)',
				borderColor: '#111111',
				isDraggable: false,
				isResizable: false
	      	},
	      	{
	        	id  : 'company',
				name: '회사',
	        	color: '#fff',
				backgroundColor: '#ff5583',
	        	dragBackgroundColor: 'rgba(255,85,131,0.6)',
				borderColor: '#111111',
				isDraggable: false,
				isResizable: false
	      	}
	    ],

    /* 일정 등록 커스터마이징 */
    template: {
      popupisAllday       : () => '종일',
      popupStateFree      : () => '중요', //화면표시 순서때문에 Free를 중요로 설정함
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


      // 등록한 일정 상세보기
      popupDetailDate: ({ start, end, isAllday }) => {
          const startDate = new Date(start.getTime());
          const endDate = new Date(end.getTime());
			
          let dateStr;
		  
          if (isAllday ) {
              // 종일 일정인 경우: 날짜만 표시하고 "종일" 텍스트 추가
              const startFmt = startDate.toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' });
              const actualEndDate = new Date(endDate.getTime());
              const endFmt = actualEndDate.toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' });

              dateStr = `${startFmt}`;
              if (startFmt !== endFmt) { // 시작 날짜와 종료 날짜가 다를 경우에만 ~ 종료 날짜 표시
                  dateStr += ` ~ ${endFmt}`;
              }
              dateStr += ` (종일)`;
          } else {
              // 시간 표시 형식 설정
              const startDateTimeFmt = startDate.toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' }) + ' ' +
                                       startDate.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false });
              const endDateTimeFmt = endDate.toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' }) + ' ' +
                                     endDate.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false });

              if (startDateTimeFmt === endDateTimeFmt) {
                  // 시작 시간과 종료 시간이 동일하면 시작 시간만 표시
                  dateStr = startDateTimeFmt;
              } else {
                  // 시작 시간과 종료 시간이 다르면 둘 다 표시
                  dateStr = `${startDateTimeFmt} ~ ${endDateTimeFmt}`;
              }
          }
          return `<div class="tui-popup-detail-date"><i class="tui-icon tui-calendar-icon"></i> <span style="font-size: 1.2em;">${dateStr}</span></div>`;
      },
		
	  //일정 상세 보기에서 구분 넣기
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
	     const color = isImportant ? '#ef3e3e' : '#262626';  
	     return `
	       <span class="state-badge"
	             style="font-weight: 700; color:${color};">${label}</span>`;
	   },
	   
	   
      // 중요 일정에 별 표시
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

      // 달력 화면 표시 형식 설정
      monthGridSchedule(schedule) {
        const star = schedule.state === 'Free' ? '<span style="color:gold;margin-right:3px;">★</span>' : '';
        let timeStr = '';
        if (!schedule.isAllday) {
            const startTime = new Date(schedule.start.getTime());

			timeStr = startTime.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false });
            timeStr = `<span class="tui-calendar-dot"></span> ${timeStr}`;
        }
        return `${star}${timeStr} ${schedule.title}`;
      },

    }
  });

  /* ---------- 3. 새 일정 생성 (이전과 동일) ----------------------------------- */
  calendar.on('beforeCreateEvent', ({ title, start, end, isAllday, calendarId, state }) => {


    // Explicitly adjust start/end times if it's an all-day event
    let finalStart = start;
    let finalEnd = end;
    let finalCategory = isAllday ? 'allday' : 'time';

    calendar.createEvents([{
      id         : String(Date.now()),
      calendarId : calendarId,
      title,
      start      : finalStart,
      end        : finalEnd,
      isAllday, // 이 값은 팝업에서 넘어온 isAllday 값을 그대로 사용
      category   : finalCategory,
      state      : state,
	  isDraggable: false,
	  isResizable: false
    }]);
  });

  /* ---------- 4. 팝업에서 ‘수정’ 저장 (이전과 동일) --------------------------- */
  calendar.on('beforeUpdateEvent', ({ event, changes }) => {
	console.log(changes)
    // 드래그 또는 리사이즈에 의해 start 또는 end가 변경되면 업데이트를 막음
/*    if (changes.start || changes.end) {
        return;
    }
*/
    // isAllday 속성이 변경될 경우 category도 함께 업데이트
    if (typeof changes.isAllday !== 'undefined') {
        if (changes.isAllday) {
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
  
   // 공지사항 -----------------------------------------------------------------------------
   document.getElementById('noticeList')
           .addEventListener('click', async (e) => {
     const link = e.target.closest('.notice-link');
     if (!link) return;             // 클릭한 게 링크가 아니면 무시
     e.preventDefault();            // 페이지 이동 막기

     const id = link.closest('.notice-item').dataset.id;

     try {
         const res  = await fetch(`/SOLEX/notice/api/${id}`);
         if (!res.ok) throw new Error(res.status);
         const data = await res.json();

         showNoticeModal('view', data);   // notice.js에 이미 구현됨

     } catch (err) {
         console.error('공지 상세 조회 실패', err);
         alert('공지사항을 불러오지 못했습니다.');
     }
   });
   
   // 결재목록 -----------------------------------------------------------------------------
      document.getElementById('approvalList')
              .addEventListener('click', async (e) => {
        const item  = e.target.closest('.document-item');
		
        if (!item) return;             // 클릭한 게 링크가 아니면 무시
        e.preventDefault();            // 페이지 이동 막기
		
		const row = { doc_id: item.dataset.id };     // 문서 번호
		const docTypeCode = item.dataset.type;  // 문서 유형 코드

		openDetailModal(row, docTypeCode);
      });

});

// 상세조회 모달
// 기안서 종류별 동적 화면 구성
	const formTemplates = {
		"doc_type_01": `
  			<div class="doc-type01">
  				<div id="emp-nm" class="mb-3">
  					<label class="form-label">사번</label>
					<input type="text" class="form-control" id="docEmp_id" name="emp_id" />
					<input type="hidden" name="emp_id">
  				</div>
				<div id="emp-nms" class="mb-3">
					<label class="form-label">성명</label>
					<input type="text" id="docEmp_nm" class="form-control" name="emp_nm" />
				</div>
  			</div>
  			<div class="doc-type01">
  				<div id="dept-nm" class="mb-3">
  					<label class="form-label">부서</label>
  					<input type="text" class="form-control" id="docdept_nm" name="emp_dep_nm" />
  				</div>
  				<div id="dept-teams" class="mb-3">
  					<label class="form-label">팀</label>
  					<input type="text" class="form-control" id="docdept_team" name="emp_team_nm" />
  				</div>
  			</div>
			<div class="doc-type01">
				<div id="job-posits" class="mb-3">
					<label class="form-label">직급</label>
					<input type="text" class="form-control" id="docdept_position" name="emp_pos_nm"/>
				</div>
				<div id="dates" class="date mb-3">
					<label class="form-label">날짜</label>
					<input type="text" id="dateRange" class="form-control" name="dbdaterange" placeholder="휴가기간 선택">
					<input type="hidden" name="lea_start_date" id="startDate">
					<input type="hidden" name="lea_end_date" id="endDate">
				</div>
			</div>
  			<div class="btn-group" role="group" aria-label="반차 연차 선택">
  				<input type="radio" class="btn-check" name="lea_type" id="businessTrip" value="반차" checked>
  				<label class="btn btn-purple" for="businessTrip">반차</label>
  				
  				<input type="radio" class="btn-check" name="lea_type" id="fieldWork" value="연차">
  				<label class="btn btn-purple" for="fieldWork">연차</label>
  			</div>
  			<div class="mb-3">
  				<label class="form-label">제목</label>
  				<input type="text" class="form-control" id="docTitle" name="lea_tt" placeholder="50자내로 입력"  maxlength="50"/>
  			</div>
  			<div class="mb-3">
  				<label class="form-label">사유</label>
  				<textarea class="form-control" id="docContent" name="lea_con" rows="4"></textarea>
  			</div>
  		`,

		"doc_type_02": `
			<div class="doc-type05">
				<div id="emp-id" class="mb-3">
					<label class="form-label">사번</label>
					<input type="text" class="form-control" id="docEmp_id" name="emp_id" />
					<input type="hidden" name="emp_id">
				</div>
				<div id="emp-nms" class="mb-3">
					<label class="form-label">성명</label>
					<input type="text" id="docEmp_nm" class="form-control" name="emp_nm"/>
				</div>
			</div>
			<div class="doc-type05">
				<div id="dept-nms" class="mb-3">
					<label class="form-label">부서</label>
					<input type="text" id="docdept_nm" class="form-control" name="emp_dep_nm" />
				</div>
				<div id="dept-teams" class="mb-3">
					<label class="form-label">팀</label>
					<input type="text" id="docdept_team" class="form-control" name="emp_team_nm"/>
				</div>
			</div>
			<div id="job-posit" class="mb-3">
				<label class="form-label">직급</label>
				<input type="text" class="form-control" id="docdept_position" name="emp_pos_nm" />
			</div>
			<div class="btn-group" role="group" aria-label="출장 외근 선택">
			  <input type="radio" class="btn-check" name="bus_type" value="출장" id="businessTrip" checked>
			  <label class="btn btn-purple" for="businessTrip">출장</label>

			  <input type="radio" class="btn-check" name="bus_type" value="외근" id="fieldWork">
			  <label class="btn btn-purple" for="fieldWork">외근</label>
			</div>
			<div class="doc-type05">
				<div id="date" class="mb-3">
					<label class="form-label">기간</label>
					<input type="text" id="dateRange" class="form-control" name="dbdaterange" placeholder="출장/외근 날짜 선택">
					<input type="hidden" name="bus_start_time" id="startDate">
					<input type="hidden" name="bus_end_time" id="endDate">
				</div>
				<div id="cost-detail" class="mb-3">
					<label class="form-label">경비내역</label>
					<input type="text" id="bus_cost" name="bus_cost" class="form-control" />
				</div>
			</div>
			<div class="mb-3">
				<label class="form-label">세부 업무 내용</label>
				<textarea class="form-control" id="docContents" name="bus_con" rows="4"></textarea>
			</div>
  		`,
		"doc_type_03": `
			<div class="doc-type03">
				<div id="emp-id" class="mb-3">
					<label class="form-label">사번</label>
					<input type="text" class="form-control" id="docEmp_id" name="emp_id"/>
					<input type="hidden" name="emp_id">
				</div>
				<div id="emp-nms" class="mb-3">
					<label class="form-label">성명</label>
					<input type="text" class="form-control" id="docEmp_nm" name="emp_nm" />
				</div>
			</div>
			<div class="doc-type03">
				<div id="dept-nms" class="mb-3">
					<label class="form-label">부서</label>
					<input type="text" class="form-control" id="docdept_nm" name="emp_dep_nm" />
				</div>
				<div id="curr-team" class="team mb-3">
					<label class="form-label">팀</label>
					<input type="text" class="form-control" id="docdept_team" name="emp_team_nm"/>
				</div>
			</div>
			<div class="doc-type03">
				<div id="job-posit" class="mb-3">
					<label class="form-label">직급</label>
					<input type="text" class="form-control" id="docdept_position" name="emp_pos_nm" />
				</div>
				<div id="last-day" class="mb-3">
					<label class="form-label">사직 희망일</label>
					<input type="text" id="dateRange" class="form-control" name="dbdaterange" placeholder="퇴사 예정일 선택">
					<input type="hidden" name="res_start_date" id="startDate">
				</div>
			</div>
			<div class="mb-3">
				<label class="form-label">사직사유</label>
				<textarea class="form-control" id="resContent" name="res_con" rows="4"></textarea>
			</div>
			<div class="text-center">
				<h3 class="form-label">위와 같이 사직하고자 하니 허가하여 주시기 바랍니다.</h3>
			</div>
  		`
	};
	
	async function openDetailModal(row, docTypeCode) {
		document.querySelector("#detailModal .modal-body").innerHTML = formTemplates[docTypeCode];
		// 항상 비활성화
		const form = document.querySelector("#detailModal .modal-body");
		form.querySelectorAll("input, textarea, select").forEach(el => {
			el.disabled = true;
		});

		try {
			const response = await fetch(`/SOLEX/approval/select/detail/${row.doc_id}?doc_type_code=${docTypeCode}`);
			if (!response.ok) throw new Error("상세 조회 실패");

			const data = await response.json();

			// 일반 input, textarea, select 값 주입
			for (const [key, value] of Object.entries(data)) {
				const el = form.querySelector(`[name="${key.toLowerCase()}"]`);
				if (el) el.value = value;
			}
			const nameList = (data.APL_EMP_POS_NM || "").split(",");
			const statusList = (data.APL_STS || "").split(",");
			const timeList = (data.APL_ACTION_TIME || "").split(",");
			// thead 구성
			const theadRow = document.querySelector(".approval-line thead tr");
			theadRow.innerHTML = "";

			const headLabel = document.createElement("th");
			headLabel.innerText = " ";
			theadRow.appendChild(headLabel);

			nameList.forEach(pos => {
				const th = document.createElement("th");
				th.innerText = pos;
				theadRow.appendChild(th);
			});

			// tbody 구성
			const tbody = document.querySelector(".approval-line tbody");
			tbody.innerHTML = "";
			const rowEl = document.createElement("tr");
			const bodyLabel = document.createElement("td");
			bodyLabel.innerText = "결재";
			rowEl.appendChild(bodyLabel);
//			const returnReason = data.APL_RREMARK || "";
			
			// 반려 사유 textarea 추가
			if (data.APL_STS && data.APL_STS.includes("반려") && data.APL_RREMARK) {
				const form = document.querySelector("#detailModal .modal-body");
				if (form && !document.querySelector("#returnReason")) {
					const returnDiv = document.createElement("div");
					returnDiv.className = "mb-3 return-reason-area";

					returnDiv.innerHTML = `
						<label class="form-label text-red">반려 사유</label>
						<textarea class="form-control" id="returnReason" name="return_reason" rows="3" disabled>${data.APL_RREMARK}</textarea>
					`;

					form.appendChild(returnDiv);
				}
			}
			for (let i = 0; i < nameList.length; i++) {
				const td = document.createElement("td");
				const status = statusList[i] || "대기";
				const time = timeList[i] || "-";

				let statusClass = "";
				if (status === "승인") statusClass = "text-blue";
				else if (status === "반려") statusClass = "text-red";

				td.innerHTML = `
				  <span class="${statusClass}"> ${status}<br>${time}</span>
				`;
				rowEl.appendChild(td);
			}


			tbody.appendChild(rowEl);

			// 모달 오픈
			document.querySelectorAll('.modal-backdrop').forEach(bd => bd.remove());
			const modal = new bootstrap.Modal(document.getElementById('detailModal'));
			modal.show();
		} catch (err) {
			console.error("상세 조회 중 에러:", err);
			alert("상세 조회에 실패했습니다.");
		}
	}
	
