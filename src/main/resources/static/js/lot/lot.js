document.addEventListener('DOMContentLoaded', function() {

	// 셀렉트 박스 초기 세팅
	loadSelectBox('#productCategorySelect', '/SOLEX/lot/productType/list', '제품 유형');
	loadSelectBox('#productTypeSelect', '/SOLEX/lot/lotStatus/list', '생산 상태');
	loadFilteredLotTree();
	
	// Enter 키로 검색
	$('#searchInput').on('keydown', function(e) {
	    if (e.keyCode === 13) {
	        loadFilteredLotTree();
	    }
	});
	
	// 행 클릭 시 상세조회
	$('#lotTree').on('select_node.jstree', function (e, data) {
		const nodeId = data.node.id;
		
		// 중간 분기 노드는 조회하지 않음
		if (
			nodeId.endsWith('_prc') ||
			nodeId.endsWith('_mat') ||
			nodeId.endsWith('_eqp')
		) {
			return;
		}

		$.ajax({
			url: '/SOLEX/lot/detail',
			data: { id: nodeId },
			success: function (detailData) {
				const html = formatLotDetailHtml(detailData);
				$('#lotDetail').html(html);
			}
		});
	});
	
});

// LOT계층 트리구조 생성
function loadFilteredLotTree() {
	const keyword = $('#searchInput').val().trim();
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
				const params = {
					id: parentId,
					lotCode: keyword,
					lotStatus: status,
					prdType: type
				};
				$.ajax({
					url: '/SOLEX/lot/list',
					data: params,
					success: function(data) {
						callback.call(this, data);
					}
				});
			}
		}
	});
	
}

// 각 항목별 상세조회
function formatLotDetailHtml(data) {
	const type = data.type; // 'product', 'process', 'material', 'equipment'
	let html = '';

	if (type === 'product') {
		html += `<div><strong>LOT 코드:</strong> ${data.lotCode}</div>`;
		html += `<div><strong>제품명:</strong> ${data.productName}</div>`;
		html += `<div><strong>제품코드:</strong> ${data.productCode}</div>`;
		html += `<div><strong>제품유형:</strong> ${data.productType}</div>`;
		html += `<div><strong>사이즈:</strong> ${data.size}</div>`;
		html += `<div><strong>색상:</strong> ${data.color}</div>`;
		html += `<div><strong>굽 높이:</strong> ${data.height}</div>`;
		html += `<div><strong>생산상태:</strong> ${data.status}</div>`;
		html += `<div><strong>생산시작일자:</strong> ${data.startDate}</div>`;
		html += `<div><strong>생산종료일자:</strong> ${data.endDate}</div>`;
	} else if (type === 'process') {
		html += `<div><strong>공정명:</strong> ${data.processName}</div>`;
		html += `<div><strong>공정코드:</strong> ${data.processCode}</div>`;
		html += `<div><strong>시작일:</strong> ${data.startDate}</div>`;
		html += `<div><strong>종료일:</strong> ${data.endDate}</div>`;
		html += `<div><strong>담당자명:</strong> ${data.operatorName}</div>`;
		html += `<div><strong>담당자 사번:</strong> ${data.operatorNum}</div>`;
	} else if (type === 'material') {
		html += `<div><strong>자재명:</strong> ${data.materialName}</div>`;
		html += `<div><strong>자재코드:</strong> ${data.materialCode}</div>`;
		html += `<div><strong>투입수량:</strong> ${data.quantity}</div>`;
		html += `<div><strong>투입일:</strong> ${data.date}</div>`;
		html += `<div><strong>거래처명:</strong> ${data.clientName}</div>`;
		html += `<div><strong>거래처 담당자:</strong> ${data.clientManager}</div>`;
		html += `<div><strong>담당자 연락처:</strong> ${data.managerNumber}</div>`;
	} else if (type === 'equipment') {
		html += `<div><strong>설비명:</strong> ${data.equipmentName}</div>`;
		html += `<div><strong>설비코드:</strong> ${data.equipmentCode}</div>`;
		html += `<div><strong>사용시간:</strong> ${data.usageHours}h</div>`;
	}

	return html;
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