$(function() {
    // 현재 페이지
    let currentPage = 0;
    // 무한스크롤 시 한 번에 불러올 데이터 행 수
    const pageSize = 30;

    // 모달 엘리먼트와 인스턴스를 초기에 한 번만 생성하여 재사용합니다.
    const modalEl = document.getElementById('exampleModal');
    const approvalModal = new bootstrap.Modal(modalEl);

    // TUI 그리드 설정
    const grid = new tui.Grid({
        el: document.getElementById('grid'),
        data: [],
        height: 600,
        bodyHeight: 500,
        columns: [
            { header: '발주ID', name: 'matOrdId', align: 'center', width: 89, sortable: true },
            { header: '자재ID', name: 'matId', align: 'center', width: 99, sortable: true },
            { header: '요청자ID', name: 'empId', align: 'center', width: 99, sortable: true },
            { header: '발주설명', name: 'matComm', align: 'center', width: 650 },
            { header: '발주수량', name: 'matQty', align: 'center', width: 99},
            { header: '발주 요청일', name: 'matRegDate', align: 'center', width: 118, sortable: true },
            {
                header: '승인/반려',
                name: 'mat_ord_sts',
				sortable: true,
                align: 'center',
                width: 200,
				sortable: true,
                formatter: ({ value, rowKey }) => {
                    if (value === 'mat_ord_sts_01') {
                        return '<span class="text-primary fw-bold">승인</span>';
                    }
                    if (value === 'mat_ord_sts_02') {
                        return '<span class="text-danger fw-bold">반려</span>';
                    }
                    // 승인/반려되지 않은 항목에 대해서만 버튼을 표시합니다.
                    return `
                        <button class="btn btn-sm btn-outline-primary me-1" name="approval" data-row-key="${rowKey}">승인</button>
                        <button class="btn btn-sm btn-outline-secondary" name="deny" data-row-key="${rowKey}">반려</button>`;
                }
            }
        ],
        // 그리드 너비가 변경될 때 컬럼 너비를 자동으로 조절합니다.
        columnOptions: {
            resizable: true
        }
    });

    /**
     * 서버로부터 자재 발주 목록을 비동기적으로 불러와 그리드에 추가합니다.
     * @param {number} page - 불러올 페이지 번호.
     */
    async function loadMatList(page) {
        try {
            const response = await fetch(`/SOLEX/material_orders/materialList?page=${page}&size=${pageSize}`);
            if (!response.ok) {
                throw new Error(`서버 응답 오류: ${response.statusText}`);
            }
            
            const rawData = await response.json();
            
            // 서버 데이터를 그리드 형식에 맞게 변환합니다.
            const data = rawData.map(row => ({
                matOrdId: row.matOrdId,
                matId: row.matId,
                empId: row.empId,
                matComm: row.matComm,
                matQty: row.matQty,
                matRegDate: row.matRegDate,
                matEtaDate: row.matEtaDate,
                matAtaDate: row.matAtaDate,
                matlmddate: row.matlmddate,
                mat_ord_sts: row.matOrdSts 
            }));

            // 첫 페이지는 새로고침, 이후 페이지는 기존 데이터에 추가합니다.
            page === 0 ? grid.resetData(data) : grid.appendRows(data);
            
            // 마지막 페이지에 도달하면 스크롤 이벤트 리스너를 제거합니다.
            if (data.length < pageSize) {
                grid.off("scrollEnd");
            } else {
                currentPage++;
            }
        } catch(e) {
            console.error("자재 발주 목록 조회 실패:", e);
            alert("데이터를 불러오는 데 실패했습니다. 잠시 후 다시 시도해주세요.");
        }
    }

    // 최초 데이터 로딩 및 스크롤 이벤트 핸들러 등록
    loadMatList(currentPage);
    grid.on('scrollEnd', () => loadMatList(currentPage));

    /**
     * fetch API를 사용하여 JSON 데이터를 안전하게 요청하고 파싱합니다.
     * @param {string} url - 요청할 URL.
     * @param {object} options - fetch에 전달할 옵션 객체.
     * @param {*} defaultValue - 응답이 비었을 경우 반환할 기본값.
     * @returns {Promise<any>} 파싱된 JSON 데이터 또는 기본값.
     */
    async function fetchJson(url, options = {}, defaultValue = null) {
        try {
            const res = await fetch(url, options);
            if (res.status === 204) return defaultValue; // No Content
            const text = await res.text();
            if (!res.ok) {
                // 서버에서 보낸 텍스트 에러 메시지를 활용합니다.
                throw new Error(text || `${res.status} ${res.statusText}`);
            }
            return text ? JSON.parse(text) : defaultValue;
        } catch (error) {
            console.error(`Fetch 오류 [${url}]:`, error);
            // 에러를 다시 던져서 호출한 쪽에서 처리할 수 있도록 합니다.
            throw error;
        }
    }

    /**
     * 서버에서 자재 목록을 가져와 Select Box를 채웁니다. (발주 등록 모달용)
     */
    async function fetchAndPopulateMaterial() {
        const $sel = $('#matId');
        // 이미 데이터가 로드되었다면 다시 요청하지 않습니다.
        if ($sel.data('loaded')) return;
        try {
            const materials = await fetchJson(`/SOLEX/material_orders/getMatId`, {}, []);
            materials.forEach(mat => {
                $('<option>', {
                    value: mat.MAT_ID,
                    text: mat.MAT_NM
                }).appendTo($sel);
            });
            $sel.data('loaded', true);
        } catch (e) {
            alert('자재 목록을 불러오는 데 실패했습니다.');
        }
    }

    /**
     * 선택된 자재에 따라 저장 가능한 창고 목록을 가져와 Select Box를 채웁니다.
     * @param {HTMLSelectElement} selectElement - 창고 목록을 채울 select 엘리먼트.
     * @param {string} matId - 필터링할 자재 ID.
     */
    async function fetchAndPopulateWarehouse(selectElement, matId) {
        selectElement.innerHTML = '<option value="">-- 창고 선택 --</option>';
        const url = `/SOLEX/material_orders/getWarehouse?matId=${matId}`;
        try {
            const warehouses = await fetchJson(url, {}, []);
            warehouses.forEach(whs => {
                const option = new Option(whs.WHS_NM, whs.WHS_ID);
                selectElement.add(option);
            });
        } catch (e) {
            alert('창고 목록을 불러오는 데 실패했습니다.');
        }
    }

    /**
     * 선택된 창고와 자재에 따라 저장 가능한 구역 목록을 가져와 Select Box를 채웁니다.
     * @param {HTMLSelectElement} selectElement - 구역 목록을 채울 select 엘리먼트.
     * @param {string} whsId - 필터링할 창고 ID.
     * @param {string} matId - 필터링할 자재 ID.
     */
    async function fetchAndPopulateArea(selectElement, whsId, matId) {
        selectElement.innerHTML = '<option value="">-- 구역 선택 --</option>';
        selectElement.disabled = !whsId;
        if (!whsId) return;

        const url = `/SOLEX/material_orders/getArea?whsId=${whsId}&matId=${matId}`;
        try {
            const areas = await fetchJson(url, {}, []);
            areas.forEach(a => {
                const option = new Option(a.ARE_NM, a.ARE_ID);
                selectElement.add(option);
            });
        } catch (e) {
            alert('구역 목록을 불러오는 데 실패했습니다.');
        }
    }

    // 발주 등록 모달이 열릴 때 자재 목록을 불러옵니다.
    $('#exampleModal').on('show.bs.modal', fetchAndPopulateMaterial);
    
    // [리팩토링] 발주 등록 폼 유효성 검사 함수
    function validateRegistrationForm() {
        const matId = $('#matId').val();
        const matQty = $.trim($('#matQty').val());
        const matRegDate = $.trim($('#matRegDate').val());

        if (!matId) {
            alert('자재를 선택해주세요.');
            return false;
        }
        if (!matQty || Number(matQty) <= 0) {
            alert('발주 수량은 0보다 큰 숫자로 입력해주세요.');
            return false;
        }
        if (!matRegDate) {
            alert('발주 요청일을 선택해주세요.');
            return false;
        }
        return true;
    }

    // 자재발주등록 모달 내 '등록' 버튼 클릭 이벤트
    $('#registerBtn').on('click', async function () {
        // [추가] 유효성 검사
        if (!validateRegistrationForm()) {
            return;
        }

        const payload = {
            matId: $('#matId').val(),
            matQty: $.trim($('#matQty').val()),
            matRegDate: $.trim($('#matRegDate').val()),
            matComm: $.trim($('#matComm').val())
        };

        try {
            await fetchJson(`/SOLEX/material_orders/registration`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            alert('발주가 성공적으로 등록되었습니다.');
            window.location.reload();
        } catch (error) {
            alert('발주 등록에 실패했습니다: ' + error.message);
        }
    });

    // 그리드 내 '승인' 또는 '반려' 버튼 클릭 이벤트 위임
    grid.on('click', async ev => {
        const btn = ev.nativeEvent.target.closest('button');
        if (!btn || !['approval', 'deny'].includes(btn.name)) return;

        openModal(btn.name, ev.rowKey);
    });

    /**
     * 다양한 모드('approval', 'deny')에 따라 모달을 열고 해당 기능을 처리합니다.
     * @param {'approval' | 'deny'} mode - 모달의 작동 모드.
     * @param {number} rowKey - 그리드에서 선택된 행의 키.
     */
	

	
    async function openModal(mode, rowKey) {
        const modalBody = modalEl.querySelector('.modal-body');
        const modalTitle = document.getElementById('exampleModalLabel');
        const rowData = grid.getRow(rowKey);
        
        modalBody.innerHTML = ''; // 모달 내용 초기화
		
		
		// 뭐냐하면 쉼표 제거하는 코드
        if (mode === 'approval') {
            modalTitle.textContent = '발주 승인';
            
            const form = document.createElement('form');
            form.id = 'applyForm';
            form.innerHTML = `
                <div class="row mb-3">
                    <div class="col"><label class="form-label">발주ID</label><input type="text" class="form-control" value="${rowData.matOrdId}" readonly></div>
                    <div class="col"><label class="form-label">자재ID</label><input type="text" class="form-control" id="matId" name="mat_id" value="${rowData.matId}" readonly></div>
                </div>
                <div class="mb-3"><label class="form-label">수량</label><input type="number" class="form-control" id="matQty" name="mat_qty" value="${rowData.matQty}" readonly></div>
                <div class="row mb-3">
                    <div class="col"><label class="form-label">저장될 창고</label><select id="whsId" class="form-select" name="whs_id" required><option value="">-- 창고 선택 --</option></select></div>
                    <div class="col"><label class="form-label">구역</label><select id="areId" class="form-select" name="are_id" disabled required><option value="">-- 구역 선택 --</option></select></div>
                </div>
                <div class="text-end mt-4">
                    <button type="submit" id="approveBtn" class="btn custom-btn-blue">승인</button>
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">취소</button>
                </div>`;
            modalBody.appendChild(form);

            const whsIdSelect = form.querySelector('#whsId');
            const areaIdSelect = form.querySelector('#areId');

            await fetchAndPopulateWarehouse(whsIdSelect, rowData.matId);

            whsIdSelect.addEventListener('change', () => {
                fetchAndPopulateArea(areaIdSelect, whsIdSelect.value, rowData.matId);
            });

            form.addEventListener('submit', async (event) => {
                event.preventDefault();
                const approveButton = event.currentTarget.querySelector('#approveBtn');
                approveButton.disabled = true;

                const whsIdValue = whsIdSelect.value;
                const areIdValue = areaIdSelect.value;

                if (!whsIdValue || !areIdValue) {
                    alert("창고와 구역을 모두 선택해주세요.");
                    approveButton.disabled = false;
                    return;
                }

                const payload = {
                    mat_ord_id: rowData.matOrdId,
                    mat_id: rowData.matId,
                    are_id: areIdValue,
                    whs_his_cnt: rowData.matQty,
                    whs_id: whsIdValue
                };

                try {
                    await fetchJson('/SOLEX/material_orders/materialApprove', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(payload)
                    });
                    alert('승인 처리되었습니다.');
                    approvalModal.hide();
                    grid.setValue(rowKey, 'mat_ord_sts', 'mat_ord_sts_01');
                } catch (error) {
                    alert('승인 처리 실패: ' + error.message);
                    approveButton.disabled = false;
                }
            });
        } else if (mode === 'deny') {
            modalTitle.textContent = '발주 반려 확인';
            modalBody.innerHTML = `
                <p>발주 ID <strong>[${rowData.matOrdId}]</strong> 건을 정말로 반려하시겠습니까?</p>
                <div class="text-end mt-4">
                    <button type="button" id="confirmDenyBtn" class="btn btn-danger">반려 확인</button>
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">취소</button>
                </div>`;
            
            modalBody.querySelector('#confirmDenyBtn').onclick = async (event) => {
                event.currentTarget.disabled = true;
                try {
                    await fetchJson('/SOLEX/material_orders/materialDeny', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ mat_ord_id: rowData.matOrdId })
                    });
                    alert('반려 처리되었습니다.');
                    approvalModal.hide();
                    grid.setValue(rowKey, 'mat_ord_sts', 'mat_ord_sts_02');
                } catch (error) {
                    alert('반려 처리 실패: ' + error.message);
                    event.currentTarget.disabled = false;
                }
            };
        }
        approvalModal.show();
    }
});
