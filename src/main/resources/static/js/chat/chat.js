$(function() {
	const tabUsers = document.getElementById('tab-users');
	const tabChats = document.getElementById('tab-chats');

	const viewUsers = document.getElementById('view-users');
	const viewChats = document.getElementById('view-chats');
	const viewChatroom = document.getElementById('view-chatroom');

	// 대화 목록 더미 (필요하면 이 부분도 비동기로 변경 가능)
	const chats = [
		{ name: '홍길동', lastMessage: '결재했습니다!' },
		{ name: '김민수', lastMessage: '수정해둘게요.' }
	];

	// 탭 전환 이벤트
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

	// 메시지 전송 (전역 함수)
	window.sendMessage = function() {
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

	// 사원 목록 가져로기 렌더링
	function fetchUsersAndRender(filter = '') {
		$.ajax({
			url: '/SOLEX/chats/emp',  // 실제 사원 목록 API 주소로 변경하세요
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

	// 사원 목록 렌더링 함수
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
				li.addEventListener('click', () => openChatroom(user.EMP_NM));
				userList.appendChild(li);
			});
	}

	// 초기 호출 (필터 없이 전체 사원 목록 로드)
	fetchUsersAndRender();

	// 검색 input 이벤트
	document.getElementById('userSearchInput').addEventListener('input', function () {
		const keyword = this.value.trim();
		fetchUsersAndRender(keyword);
	});
});
