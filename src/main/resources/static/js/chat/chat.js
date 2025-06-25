$(function() {
	const tabUsers = document.getElementById('tab-users');
	const tabChats = document.getElementById('tab-chats');

	const viewUsers = document.getElementById('view-users');
	const viewChats = document.getElementById('view-chats');
	const viewChatroom = document.getElementById('view-chatroom');

	let stompClient = null;
	let currentRoomId = null;
	let partnerId = null;

	// 탭 전환 이벤트
	tabUsers.addEventListener('click', () => {
		toggleTab('users');
	});

	tabChats.addEventListener('click', () => {
		toggleTab('chats');
		ChatList();
		hideChatBadge();
	});

	function toggleTab(tab) {
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

	// 채팅 목록에서 채팅방 열기 + 웹소켓 연결
	function openChatroom(name, targetId) {
		console.log("openChatroom 호출, name:", name, ", targetId:", targetId);
		partnerId = targetId; // 순수 사번만 받음 (ex: '79', 'EMP003' 등)
		currentRoomId = `room_${partnerId}`; // 여기서 room_ 붙임
		console.log("partnerId:", partnerId, ", currentRoomId:", currentRoomId);

		console.log("openChatroom called");
		console.log("partnerId:", partnerId);
		console.log("currentRoomId:", currentRoomId);

		document.getElementById('chatHeader').textContent = name;
		viewUsers.classList.add('hidden');
		viewChats.classList.add('hidden');
		viewChatroom.classList.remove('hidden');

		document.getElementById('chatMessages').innerHTML = '';

		$.ajax({
			url: `/SOLEX/chats/history/${partnerId}`,
			method: 'GET',
			dataType: 'json',
			success: function(messages) {
				messages.forEach(msg => renderMessage({
					sender: msg.SENDER_ID,
					content: msg.CONTENT
				}));
			},
			error: function() {
				console.error('이전 메시지 불러오기 실패');
			}
		});

		connectWebSocket(currentRoomId);
	}

	// 웹소켓 연결 함수
	function connectWebSocket(roomId) {
		currentRoomId = roomId;

		if (stompClient !== null) {
			stompClient.disconnect(); // 기존 연결 있으면 종료
		}

		const socket = new SockJS('/SOLEX/ws'); // 서버 addEndpoint("/ws")와 일치해야 함
		stompClient = Stomp.over(socket);

		stompClient.connect({}, function() {

			// 채팅방 구독
			stompClient.subscribe(`/topic/chatroom/${roomId}`, function(msg) {
				let message = JSON.parse(msg.body);
				
				renderMessage(message);
				
			// 현재 채팅방이 안 보이면 알림 띄우기
			   if (viewChatroom.classList.contains('hidden')) {
			     showChatBadge();
			   }
			});
		});
	}

	// 메시지 렌더링
	function renderMessage(message) {
		const chatMessages = document.getElementById('chatMessages');
		const msgDiv = document.createElement('div');

		const isMine = message.sender === empId;

		// 👉 클래스 한 번에 설정
		msgDiv.className = `message ${isMine ? 'sent' : 'received'}`;
		const wrapper = document.createElement('div');
		wrapper.className = `message-wrapper ${isMine ? 'sent' : 'received'}`;

		// 발신자 정보
		const senderDiv = document.createElement('div');
		senderDiv.className = 'sender';
		senderDiv.textContent = message.sender;

		// 말풍선 내용
		msgDiv.textContent = message.content;

		wrapper.appendChild(senderDiv);
		wrapper.appendChild(msgDiv);
		chatMessages.appendChild(wrapper);

		chatMessages.scrollTop = chatMessages.scrollHeight;
	}

	// 메시지 전송 (html에서 호출하기 때문에 window 붙임)
	window.sendMessage = function() {
		const input = document.getElementById('chatInput');
		const content = input.value.trim();
		console.log("sendMessage 호출, partnerId:", partnerId, "content:", content);
		if (!content || !stompClient || !currentRoomId) return;

		const message = {
			sender: empId,
			receiver: partnerId,
			content: content,
			roomId: currentRoomId,
			type: 'CHAT'
		};

		// 메세지 저장 및 전송
		stompClient.send('/app/chat.send', {}, JSON.stringify(message));
		input.value = '';
	}

	// 사원 목록 가져오기 + 렌더링
	function fetchUsersAndRender(filter = '') {
		$.ajax({
			url: '/SOLEX/chats/emp',
			method: 'GET',
			dataType: 'json',
			success: function(users) {
			debugger;
				renderUsers(users, filter);
			},
			error: function() {
				console.error('사원 목록을 불러오는데 실패했습니다.');
			}
		});
	}

	// 사원 목록 렌더링
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

	// 초기 호출
	fetchUsersAndRender();

	// 검색 input 이벤트
	document.getElementById('userSearchInput').addEventListener('input', function() {
		const keyword = this.value.trim();
		fetchUsersAndRender(keyword);
	});

	// 대화 목록 조회
	function ChatList() {
		$.ajax({
			url: '/SOLEX/chats/list',
			method: 'GET',
			dataType: 'json',
			success: function(chats) {
				const chatList = document.getElementById('chat-list');
				chatList.innerHTML = '';
				chats.forEach(chat => {
					// 내 사번과 비교해서 상대방 정보 찾기
					const isMeSender = String(chat.SENDER_ID) === String(empId);
					const partnerName = isMeSender ? chat.RECEIVER_NM : chat.SENDER_NM;
					const partnerId = isMeSender ? chat.RECEIVER_ID : chat.SENDER_ID;
					console.log("📌 partnerId:", partnerId);
					const li = document.createElement('li');
					li.innerHTML = `
						<div class="last">
					    	<strong>${partnerName}</strong><br/>
					    	<small>${chat.LAST_MESSAGE}</small>
					  	</div>
					  `;

					  li.addEventListener('click', () => {
					    console.log("Clicked partnerId:", partnerId);
					    openChatroom(partnerName, partnerId);
					  });
					chatList.appendChild(li);
				});
			},
			error: function() {
				console.error('대화 목록 불러오기 실패');
			}
		});
	}
	
//	전송 엔터
	document.getElementById('chatInput').addEventListener('keydown', function(e) {
	    if (e.key === 'Enter') {
	        e.preventDefault();  // 기본 엔터 동작 막기(줄바꿈 방지)
	        window.sendMessage();  // 메시지 전송 함수 호출
	    }
	});
});
