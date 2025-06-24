$(function() {

	const tabUsers = document.getElementById('tab-users');
	const tabChats = document.getElementById('tab-chats');

	const viewUsers = document.getElementById('view-users');
	const viewChats = document.getElementById('view-chats');
	const viewChatroom = document.getElementById('view-chatroom');

	// 더미 사원 데이터
	const users = [
		{ name: '배지영', dept: '영업팀' },
		{ name: '홍길동', dept: '기획팀' },
		{ name: '김민수', dept: '개발팀' }
	];

	// 더미 대화 목록
	const chats = [
		{ name: '홍길동', lastMessage: '결재했습니다!' },
		{ name: '김민수', lastMessage: '수정해둘게요.' }
	];



	// 탭 전환
	tabUsers.addEventListener('click', () => {
		toggleTab('users');
	});

	tabChats.addEventListener('click', () => {
		toggleTab('chats');
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

	// 사원 목록 출력
	const userList = document.getElementById('user-list');
	users.forEach(user => {
		const li = document.createElement('li');
		li.textContent = `${user.dept} ${user.name}`;
		li.addEventListener('click', () => openChatroom(user.name));
		userList.appendChild(li);
	});

	// 대화 목록 출력
	const chatList = document.getElementById('chat-list');
	chats.forEach(chat => {
		const li = document.createElement('li');
		li.innerHTML = `<strong>${chat.name}</strong><br/><small>${chat.lastMessage}</small>`;
		li.addEventListener('click', () => openChatroom(chat.name));
		chatList.appendChild(li);
	});

	// 채팅방 열기
	function openChatroom(name) {
		document.getElementById('chatHeader').textContent = `${name}`;
		viewUsers.classList.add('hidden');
		viewChats.classList.add('hidden');
		viewChatroom.classList.remove('hidden');

		const chatMessages = document.getElementById('chatMessages');
		chatMessages.innerHTML = `
	      <div class="message received">안녕하세요. ${name}입니다.</div>
	      <div class="message sent">반갑습니다!</div>
	    `;
	}


	// 메시지 전송
	function sendMessage() {
		const input = document.getElementById('chatInput');
		const text = input.value.trim();
		if (text) {
			const msg = document.createElement('div');
			msg.className = 'message sent';
			msg.textContent = text;
			document.getElementById('chatMessages').appendChild(msg);
			input.value = '';
		}
	}

	// 사원 목록 출력
	function renderUsers() {
		const userList = document.getElementById('user-list');
		userList.innerHTML = '';

		users.forEach(user => {
			const li = document.createElement('li');
			li.innerHTML = `
		      <i class="bx bx-user" style="font-size: 30px; color: #3b82f6;"></i>
		      <strong>${user.name} 님</strong> <small>(${user.dept})</small>
		    `;
			// 클릭 시 채팅방 열기
			li.addEventListener('click', () => {
				openChatroom(user.name);
			});

			userList.appendChild(li);
		});
	}
	renderUsers();
});