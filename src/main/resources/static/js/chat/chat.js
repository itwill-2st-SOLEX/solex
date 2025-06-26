$(function() {
	console.log("로그인한 사용자 empId:", empId);
	initTabEvents();
	initSearchEvent();
	initEnterKeySend();
	checkboxEvent();
	fetchUsersAndRender();

	// 채팅방 나가기
	document.getElementById('singleTrash').addEventListener('click', leaveChatRoom);
});

// 전역 상태
let stompClient = null;
let currentRoomId = null;
let partnerId = null;

// 탭 전환 이벤트 등록
function initTabEvents() {
	const tabUsers = document.getElementById('tab-users');
	const tabChats = document.getElementById('tab-chats');

	tabUsers.addEventListener('click', () => toggleTab('users'));
	tabChats.addEventListener('click', () => {
		toggleTab('chats');
		fetchChatList();
		hideChatBadge();
	});
}

// 검색 input 이벤트
function initSearchEvent() {
	document.getElementById('userSearchInput').addEventListener('input', function() {
		const keyword = this.value.trim();
		fetchUsersAndRender(keyword);
	});
}

// 채팅 입력창 엔터 이벤트
function initEnterKeySend() {
	document.getElementById('chatInput').addEventListener('keydown', function(e) {
		if (e.key === 'Enter') {
			e.preventDefault();
			sendMessage();
		}
	});
}

// 탭 전환 처리
function toggleTab(tab) {
	const tabUsers = document.getElementById('tab-users');
	const tabChats = document.getElementById('tab-chats');
	const viewUsers = document.getElementById('view-users');
	const viewChats = document.getElementById('view-chats');
	const viewChatroom = document.getElementById('view-chatroom');

	tabUsers.classList.remove('active');
	tabChats.classList.remove('active');
	viewUsers.classList.add('hidden');
	viewChats.classList.add('hidden');
	viewChatroom.classList.add('hidden');

	if (tab === 'users') {
		tabUsers.classList.add('active');
		viewUsers.classList.remove('hidden');
	} else {
		tabChats.classList.add('active');
		viewChats.classList.remove('hidden');
	}
}

// 사원 목록 출력
function fetchUsersAndRender(filter = '') {
	$.ajax({
		url: '/SOLEX/chats/emp',
		method: 'GET',
		dataType: 'json',
		success: function(users) {
			renderUsers(users, filter);
		},
		error: function() {
			console.error('사원 목록을 불러오는데 실패했습니다.');
		}
	});
}

// 필터링 후 사용자 목록 렌더링
function renderUsers(users, filter = '') {
	filter = filter.toLowerCase();
	const userList = document.getElementById('user-list');
	userList.innerHTML = '';

	users
		.filter(user =>
			user.EMP_NM.toLowerCase().includes(filter) ||
			user.DEP.toLowerCase().includes(filter) ||
			user.POS.toLowerCase().includes(filter)
		)
		.forEach(user => {
			const li = document.createElement('li');
			li.innerHTML = `
				<i class="bx bx-user" style="margin-right: 10px; color: #3b82f6; font-size: 20px;"></i>
				<strong>${user.EMP_NM}</strong> <small>${user.POS} (${user.DEP})</small>
			`;
			li.addEventListener('click', () => openChatroom(user.EMP_NM, user.EMP_CD));
			userList.appendChild(li);
		});
}

// 대화 목록 조회
function fetchChatList() {
	$.ajax({
		url: '/SOLEX/chats/list',
		method: 'GET',
		dataType: 'json',
		success: function(chats) {
			const chatList = document.getElementById('chat-list');
			chatList.innerHTML = '';

			chats.forEach(chat => {
				const isMeSender = String(chat.SENDER_ID) === String(empId);
				const partnerName = isMeSender ? chat.RECEIVER_NM : chat.SENDER_NM;
				const partnerId = isMeSender ? chat.RECEIVER_ID : chat.SENDER_ID;

				const li = document.createElement('li');
				li.innerHTML = `
					<label style="display: flex; align-items: center; gap: 10px; border-bottom: 2px solid #d1d5db; cursor: pointer;">
						<input type="checkbox" class="chat-check"  data-partner-id="${partnerId}" onclick="event.stopPropagation()"/>
						<div class="last">
							<strong>${partnerName}</strong><br/>
							<small>${chat.LAST_MESSAGE}</small>
						</div>
					</label>
				`;
				li.addEventListener('click', () => openChatroom(partnerName, partnerId));
				chatList.appendChild(li);
			});

			document.getElementById('masterCheck').checked = false;
		},
		error: function() {
			console.error('대화 목록 불러오기 실패');
		}
	});
}

// 채팅방 열기 + 메시지 불러오기
function openChatroom(name, targetId) {
	partnerId = targetId;
	currentRoomId = `room_${partnerId}`;

	document.getElementById('chatHeader').textContent = name;
	document.getElementById('view-users').classList.add('hidden');
	document.getElementById('view-chats').classList.add('hidden');
	document.getElementById('view-chatroom').classList.remove('hidden');
	document.getElementById('chatMessages').innerHTML = '';

	// 메세지 불러오기
	$.ajax({
		url: `/SOLEX/chats/history/${partnerId}`,
		method: 'GET',
		dataType: 'json',
		success: function(messages) {
			messages.forEach(msg => {
				const isMine = msg.SENDER_ID === empId;
				const isRead = msg.IS_READ === 'Y';
				renderMessage({
					senderName: isMine ? '나' : msg.SENDER_NM,
					content: msg.CONTENT
				}, isMine, isRead);
			});
		},
		error: function() {
			console.error('이전 메시지 불러오기 실패');
		}
	});

	// 읽음 처리
	$.ajax({
		url: '/SOLEX/chats',
		method: 'PATCH',
		contentType: 'application/json',
		data: JSON.stringify({
			roomId: currentRoomId,
			empId: empId
		}),
		success: function() {
			console.log('읽음 처리 완료');
		},
		error: function() {
			console.error('읽음 처리 실패');
		}
	});

	connectWebSocket(currentRoomId);
}

// 웹소켓 연결 및 메시지 수신 처리
function connectWebSocket(roomId) {
	if (stompClient !== null) {
		stompClient.disconnect();
	}

	const socket = new SockJS('/SOLEX/ws');
	stompClient = Stomp.over(socket);

	stompClient.connect({}, function() {
		stompClient.subscribe(`/topic/chatroom/${roomId}`, function(msg) {
			const message = JSON.parse(msg.body);

			const isMine = String(message.sender) === String(empId);

			renderMessage({
				senderName: isMine ? '나' : message.sender_nm,
				content: message.content
			}, isMine);

			const isChatroomHidden = document.getElementById('view-chatroom').classList.contains('hidden');
			const isOtherRoom = currentRoomId !== `room_${message.sender_id}`;

			if (isChatroomHidden || isOtherRoom) {
				showChatBadge();
			}
		});
	});
}

// 메시지 전송 함수
function sendMessage() {
	const input = document.getElementById('chatInput');
	const content = input.value.trim();

	if (!content || !stompClient || !currentRoomId) return;

	const message = {
		sender: empId,
		receiver: partnerId,
		content: content,
		roomId: currentRoomId,
		type: 'CHAT'
	};

	stompClient.send('/app/chat.send', {}, JSON.stringify(message));
	input.value = '';
}

// 메시지 렌더링
function renderMessage(message, isMine, isRead) {
	const chatMessages = document.getElementById('chatMessages');
	const wrapper = document.createElement('div');
	const msgDiv = document.createElement('div');
	const readStatusDiv = document.createElement('div');

	wrapper.className = `message-wrapper ${isMine ? 'sent' : 'received'}`;
	msgDiv.className = `message ${isMine ? 'sent' : 'received'}`;
	readStatusDiv.className = `read-status ${isRead ? '' : 'unread'}`;

	msgDiv.textContent = message.content;
	readStatusDiv.textContent = isRead ? '' : '안읽음';

	if (isMine) {
		// 내가 보낸 거: [안읽음] 말풍선
		wrapper.appendChild(readStatusDiv);
		wrapper.appendChild(msgDiv);
	} else {
		// 받은 거: 말풍선 [안읽음]
		wrapper.appendChild(msgDiv);
		wrapper.appendChild(readStatusDiv);
	}

	chatMessages.appendChild(wrapper);
	chatMessages.scrollTop = chatMessages.scrollHeight;
}


// 알림 뱃지 표시
function showChatBadge() {
	const badge = document.getElementById('chat-badge');
	if (badge) badge.classList.remove('hidden');
}

// 알림 뱃지 숨기기
function hideChatBadge() {
	const badge = document.getElementById('chat-badge');
	if (badge) badge.classList.add('hidden');
}

// 상단 체크박스와 하위 체크박스 동기화
function checkboxEvent() {
	const masterCheck = document.getElementById('masterCheck');

	// 마스터 체크박스 클릭 시 → 전체 체크 or 해제
	masterCheck.addEventListener('change', function() {
		const allChecks = document.querySelectorAll('.chat-check');
		allChecks.forEach(cb => cb.checked = masterCheck.checked);
	});

	// 각 하위 체크박스 변경 시 → 전부 체크되었는지 확인
	document.addEventListener('change', function(e) {
		if (e.target.classList.contains('chat-check')) {
			const all = document.querySelectorAll('.chat-check');
			const checked = document.querySelectorAll('.chat-check:checked');
			masterCheck.checked = all.length > 0 && all.length === checked.length;
		}
	});
}

// 채팅방 나가기
function leaveChatRoom() {
	const checked = document.querySelectorAll('.chat-check:checked');
	if (checked.length === 0) {
		alert('삭제할 채팅을 선택하세요.');
		return;
	}

	const partnerIds = Array.from(checked).map(cb => cb.dataset.partnerId);
	let deleteCount = 0;

	partnerIds.forEach(partnerId => {
		const roomId = `${partnerId}`;

		$.ajax({
			url: `/SOLEX/chats/${roomId}`,
			method: 'DELETE',
			contentType: 'application/json',
			data: JSON.stringify({
				partnerId: partnerId,
				empId: empId
			}),
			success: function() {
				deleteCount++;
				// 모든 삭제 요청이 끝나면 목록 새로고침
				if (deleteCount === partnerIds.length) {
					alert('채팅방을 나갔습니다.');
					fetchChatList();
					// 체크박스 초기화
					document.getElementById('masterCheck').checked = false;
				}
			},
			error: function() {
				console.error(`${partnerId}번 채팅방 삭제 실패`);
			}
		});
	});
}
