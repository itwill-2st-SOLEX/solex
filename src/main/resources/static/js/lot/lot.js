document.addEventListener('DOMContentLoaded', function() {

	// 셀렉트 박스 초기 세팅
	loadSelectBox('#productCategorySelect', '/SOLEX/lot/productType/list', '제품 유형');
	loadSelectBox('#productTypeSelect', '/SOLEX/lot/lotStatus/list', '생산 상태');
	loadFilteredLotTree();
	document.getElementById('hierarchy').classList.add('active');
	
	// Enter 키로 검색
	$('#searchInput').on('keydown', function(e) {
	    if (e.keyCode === 13) {
	        loadFilteredLotTree();
	    }
	});
	
	// 탭 버튼 클릭 이벤트
	document.querySelectorAll('.tab-btn').forEach(btn => {
	    btn.addEventListener('click', function() {
	        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
	        this.classList.add('active');
	        document.querySelectorAll('.detail-area .sub-area').forEach(area => {
	            area.classList.remove('active');
	        });
	        const tabId = this.getAttribute('data-tab');
	        let targetId;
	        if (tabId === 'hierarchy-tab') targetId = 'hierarchy';
	        else if (tabId === 'process-tab') targetId = 'process-history';
	        else if (tabId === 'quality-tab') targetId = 'quality-history';
	        document.getElementById(targetId).classList.add('active');
	    });
	});

});

function loadFilteredLotTree() {
	const keyword = $('#searchInput').val();
	const status = $('#productTypeSelect').val();
	const type = $('#productCategorySelect').val();

	// 트리 다시 생성
	$('#lotTree').jstree('destroy'); // 기존 트리 제거
	$('#lotTree').jstree({
		'core': {
			'themes': {
		      'dots': false,
			  'icons': false
		    },
			'data': function(node, callback) {
				const parentId = node.id === '#' ? null : node.id;
				const baseParams = {
					id: parentId,
					lotCode: keyword,
					lotStatus: status,
					prdType: type
				};
				$.ajax({
					url: '/SOLEX/lot/list',
					data: baseParams,
					success: function(data) {
						callback.call(this, data);
					}
				});
			}
		}
	});
	
}

// 셀렉트 박스 초기화
function loadSelectBox(selectId, url, placeholderText) {
	fetch(url)
		.then(res => res.json())
		.then(data => {
			const $select = document.querySelector(selectId);
			$select.innerHTML = `<option value="">${placeholderText}</option>`;
			data.forEach(item => {
				const opt = document.createElement('option');
				opt.value = item.DET_ID;
				opt.text = item.DET_NM;
				$select.appendChild(opt);
			});
		});
}

// 초기화 버튼
function resetFilters() {
	$('#searchInput').val('');
	$('#productTypeSelect').val('');
	$('#productCategorySelect').val('');

	// 셀렉트박스 다시 로딩
	loadSelectBox('#productCategorySelect', '/SOLEX/lot/productType/list', '제품 유형');
	loadSelectBox('#productTypeSelect', '/SOLEX/lot/lotStatus/list', '생산 상태');

	// 트리 초기화
	loadFilteredLotTree();
}