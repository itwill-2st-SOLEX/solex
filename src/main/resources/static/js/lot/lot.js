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
	
	// 저장 테스트
	document.getElementById('saveLotBtn').addEventListener('click', () => {
	    const prdLotCode = document.getElementById('prdLotCode').value;
	    const oddId = document.getElementById('oddId').value;
	    const prdLotStatus = document.getElementById('prdLotStatus').value;
	    const startDate = document.getElementById('startDate').value;
	    const endDate = document.getElementById('endDate').value;
	    const sort = document.getElementById('sort').value;

	    const data = {
	        prd_lot_code: prdLotCode,
	        odd_id: oddId,
	        prd_lot_status: prdLotStatus,
	        prd_lot_start_date: startDate,
	        prd_lot_end_date: endDate,
	        prd_lot_sort: sort
	    };

	    fetch('/SOLEX/lot/product/save', {
	        method: 'POST',
	        headers: {
	            'Content-Type': 'application/json'
	        },
	        body: JSON.stringify(data)
	    })
	    .then(res => {
	        if (!res.ok) throw new Error('저장 실패');
	        return res.text();
	    })
	    .then(result => {
	        alert('저장 완료: ' + result);
	    })
	    .catch(err => {
	        console.error(err);
	        alert('오류 발생: ' + err.message);
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
	}).on('select_node.jstree', function(e, data) {	// 행 클릭 시 상세조회
		const nodeId = data.node.id;

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
			success: function(detailData) {
				const html = showLotDetail(detailData);
				$('#lotDetail').html(html);
			}
		});
	});

}

// 각 항목별 상세조회
function showLotDetail(data) {
	const type = data.type;

	// 모든 섹션 숨김
	document.querySelectorAll('.detail-section').forEach(el => el.style.display = 'none');

	if (type === 'product') {
		document.getElementById('detail-product').style.display = 'block';
		document.getElementById('lotCode').textContent = data.lotCode;
		document.getElementById('orderName').textContent = data.orderName;
		document.getElementById('orderNum').textContent = data.orderNum;
		document.getElementById('productName').textContent = data.productName;
		document.getElementById('productCode').textContent = data.productCode;
		document.getElementById('productType').textContent = data.productType;
		document.getElementById('size').textContent = data.size;
		document.getElementById('color').textContent = data.color;
		document.getElementById('height').textContent = data.height;
		document.getElementById('status').textContent = data.status;
		document.getElementById('startDate').textContent = formatDate(data.startDate);
		document.getElementById('endDate').textContent = formatDate(data.endDate);
	} else if (type === 'process') {
		document.getElementById('detail-process').style.display = 'block';
		document.getElementById('processName').textContent = data.processName;
		document.getElementById('processCode').textContent = data.processCode;
		document.getElementById('operatorName').textContent = data.operatorName;
		document.getElementById('operatorNum').textContent = data.operatorNum;
		document.getElementById('processStartDate').textContent = formatDate(data.processStartDate);
		document.getElementById('processEndDate').textContent = formatDate(data.processEndDate);
		document.getElementById('successCount').textContent = data.successCount;
		document.getElementById('failCount').textContent = data.failCount;
		document.getElementById('usedEquipmentName').textContent = data.usedEquipmentName;
		document.getElementById('usedEquipmentCode').textContent = data.usedEquipmentCode;
	} else if (type === 'material') {
		document.getElementById('detail-material').style.display = 'block';
		document.getElementById('materialLot').textContent = data.materialLot;
		document.getElementById('materialName').textContent = data.materialName;
		document.getElementById('materialCode').textContent = data.materialCode;
		document.getElementById('materialCount').textContent = data.materialCount;
		document.getElementById('materialDate').textContent = formatDate(data.materialDate);
		document.getElementById('materialPartner').textContent = data.materialPartner;
		document.getElementById('materialManager').textContent = data.materialManager;
		document.getElementById('materialPhone').textContent = data.materialPhone;
	} else if (type === 'equipment') {
		document.getElementById('detail-equipment').style.display = 'block';
		document.getElementById('equipmentName').textContent = data.equipmentName;
		document.getElementById('equipmentCode').textContent = data.equipmentCode;
		document.getElementById('equipmentPartner').textContent = data.equipmentPartner;
		document.getElementById('equipmentManager').textContent = data.equipmentManager;
		document.getElementById('equipmentPhone').textContent = data.equipmentPhone;
		document.getElementById('usedProcessName').textContent = data.usedProcessName;
		document.getElementById('usedProcessCode').textContent = data.usedProcessCode;
	}

}

// 날짜 포맷터
function formatDate(dateString) {
	if (!dateString) return '';
	const date = new Date(dateString);
	if (isNaN(date.getTime())) return ''; // 유효하지 않은 날짜일 경우
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, '0');
	const day = String(date.getDate()).padStart(2, '0');
	return `${year}-${month}-${day}`;
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