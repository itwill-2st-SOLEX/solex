$(function() {
	
	let currentPage = 0;
	const pageSize = 30;

	const grid = new tui.Grid({
	    el: document.getElementById('grid'),
	    bodyHeight: 500,
		scrollY: true,
	    data: [],
	    columns: [
	        { header: '사번', name: 'empNum', align : 'center', sortable: true}, 
	        { header: '카테고리', name: 'empCatCd', align : 'center', filter: 'select'},
	        { header: '부서', name: 'empDepCd', align : 'center', filter: 'select' },
	        { header: '팀', name: 'empTeamCd', align : 'center', filter: 'select'},
	        { header: '직급', name: 'empPosCd', align : 'center', filter: 'select'},
	        { header: '사원명', name: 'empNm', align : 'center'},
	        { header: '연락처', name: 'empPhone', align : 'center'},
	        { header: '입사일', name: 'empHire', align : 'center' , sortable: true}	    ]
	});

	// 사원 목록 조회 
	async function loadDrafts(page) {
		try {
			const response = await fetch(`/SOLEX/emp/empList?page=${page}&size=${pageSize}`); 
	  		const rawData = await response.json();
	  		const data = rawData.map(row => ({
		        empNum: row.empNum,
				empCatCd: row.empCatCd, 
		        empDepCd: row.empDepCd,
		        empTeamCd: row.empTeamCd,
		        empPosCd: row.empPosCd,
				empNm: row.empNm,
				empPhone: row.empPhone,
				empHire: row.empHire
	  		}));

			page === 0 ? grid.resetData(data) : grid.appendRows(data);
      		currentPage++;

      		if (data.length < pageSize) grid.off("scrollEnd");
    	} catch (error) {
      		console.error('사원 목록 조회 실패:', error);
    	}
  	}

  	loadDrafts(currentPage); //최조 1페이지 로딩
	grid.on('scrollEnd', () =>  loadDrafts(currentPage)); // 스크롤 끝나면 다음 페이지 로딩

	// 폼 제출 전 전화번호, 이메일 병합
	function beforeSubmit() {

		const phone1 = document.getElementById('emp_phone1')?.value || '';
	   	const phone2 = document.getElementById('emp_phone2').value || '';
	   	const phone3 = document.getElementById('emp_phone3').value || '';
	   	const fullPhone = `${phone1}-${phone2}-${phone3}`;

	   	const empPhoneInput = document.getElementById('emp_phone');
	   	if (empPhoneInput) {
	          empPhoneInput.value = fullPhone;
      	} 
	  
	  	const email1 = document.getElementById('emp_email1')?.value || ''; // email 병합
  	  	const email2 = document.getElementById('emp_email2')?.value || '';
  	   	const fullEmail = `${email1}@${email2}`;
  		const empEmailInput = document.getElementById('emp_email');
		
  		if (empEmailInput) {
			empEmailInput.value = fullEmail;
  		} 
  	   	return true; // 이 함수는 값을 조합하는 역할만 하고, 유효성 검사는 각 버튼의 이벤트 리스너에서 수행합니다.
	}
	
	
	
	// 직급, 종류, 부서, 팀  셀렉트 박스 부분 시작
	
	// 모달 관련 상수
	const $employeeModal = $('#exampleModal');
    const $empPosCd = $('#empPosCd');
    const $empCatCd = $('#empCatCd');
    const $empDepCd = $('#empDepCd');
    const $empTeamCd = $('#empTeamCd');

    // 셀렉트 박스 초기화 함수
    function resetSelectBox($selectElement, defaultText, disable = true) {
        $selectElement.empty();
        $selectElement.append(`<option value="">-- ${defaultText}을 선택하세요 --</option>`);
        $selectElement.prop('disabled', disable); // 비활성화 여부 추가
    }

    // 코드 데이터 로드 및 셀렉트 박스 채우기 함수 
    async function loadCodeData(url, $selectElement, defaultText) {
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            
            resetSelectBox($selectElement, defaultText, false); // 데이터 로드 시 활성화
            data.forEach(item => {
                $selectElement.append(`<option value="${item.ID}">${item.NM}</option>`);
            });
        } catch (error) {
            console.error(`Error loading ${defaultText} data:`, error);
            alert(` ${defaultText} 데이터를 불러오는 데 실패했습니다.`);
            resetSelectBox($selectElement, defaultText, true); // 에러 시 다시 비활성화
        }
    }
	
	// "공통" 옵션을 추가하는 함수
	function addCommonOption($selectElement, defaultText, prefix) { 
        resetSelectBox($selectElement, defaultText, false); 
        $selectElement.append(`<option value="${prefix}_00">공통</option>`);
    }
	
	// "ERP", "MES" 옵션을 추가하는 함수
    function addErpMesOptions($selectElement, defaultText) {
        resetSelectBox($selectElement, defaultText, false); // 활성화하고 추가
        $selectElement.append('<option value="cat_01">ERP</option>');
        $selectElement.append('<option value="cat_02">MES</option>');
    }

    // 모달이 열릴 때 직급 로드
    $employeeModal.on('show.bs.modal', async function () {
		// 종류, 부서, 팀 셀렉트 박스 초기화
        resetSelectBox($empCatCd, '종류', true);
        resetSelectBox($empDepCd, '부서', true);
        resetSelectBox($empTeamCd, '팀', true);

        // 직급 셀렉트 박스만 활성화하고 로드
        await loadCodeData('/SOLEX/code/position', $empPosCd, '직급');
    });
	
	// 직급 선택 시 로직
    $empPosCd.on('change', async function() {
        const selectedPosCd = $(this).val();

        // 직급 변경 시 모든 하위 셀렉트 박스 초기화 및 비활성화
        resetSelectBox($empCatCd, '종류', true);
        resetSelectBox($empDepCd, '부서', true);
        resetSelectBox($empTeamCd, '팀', true);
		
		if (selectedPosCd) {
            // 사장인 경우: 종류, 부서, 팀 모두 공통 (하드코딩)
            if (selectedPosCd === 'pos_01') { 
                addCommonOption($empCatCd, '종류', 'cat');
                addCommonOption($empDepCd, '부서', 'dep');
                addCommonOption($empTeamCd, '팀', 'team');
            } 
            // 사장 외 모든 경우: 종류에 ERP, MES 추가
            else { 
                addErpMesOptions($empCatCd, '종류'); // ERP, MES 하드코딩
                
                // 이사인 경우, 부서/팀은 공통으로
                if (selectedPosCd === 'pos_02') {
                    addCommonOption($empDepCd, '부서', 'dep');
                    addCommonOption($empTeamCd, '팀', 'team');
                }
                // 부장/팀장/사원은 종류 선택에 따라 부서/팀이 달라지므로, 이 단계에서는 하위 셀렉트박스 비활성 유지
            } 
        }
    });

	// 종류 선택 시 로직
    $empCatCd.on('change', async function() {
        const selectedCatCd = $(this).val();
        const selectedPosCd = $empPosCd.val(); // 현재 선택된 직급 값

        // 종류 변경 시 모든 하위 셀렉트 박스 초기화 및 비활성화
        resetSelectBox($empDepCd, '부서', true);
        resetSelectBox($empTeamCd, '팀', true);

        if (selectedCatCd) {
            // 직급이 사장/이사인 경우 (종류 선택과 무관하게 부서는 공통)
            if (selectedPosCd === 'pos_01' || selectedPosCd === 'pos_02') {
                 addCommonOption($empDepCd, '부서');
                 addCommonOption($empTeamCd, '팀');
            }
            // 직급이 부장/팀장/사원인 경우 (선택된 종류에 따라 부서가 달라짐)
            else if (selectedPosCd === 'pos_03' || selectedPosCd === 'pos_04' || selectedPosCd === 'pos_05') {
                // 선택된 종류 (ERP/MES)에 따라 부서 로드
                await loadCodeData(`/SOLEX/code/department?catCd=${selectedCatCd}`, $empDepCd, '부서');
                // 팀은 나중에 부서 선택에 따라 로드될 것이므로 초기에는 비활성화 상태 유지
            } 
        }
    });
		
    // 부서 선택 시 로직
    $empDepCd.on('change', async function() {
        const selectedDepCd = $(this).val();
        const selectedPosCd = $empPosCd.val(); // 현재 선택된 직급 값

        // 부서 변경 시 팀 셀렉트 박스 초기화 및 비활성화
        resetSelectBox($empTeamCd, '팀', true);

        if (selectedDepCd) {
            // 직급이 사장/이사/부장인 경우 (부서 선택과 무관하게 팀은 공통)
            if (selectedPosCd === 'pos_01' || selectedPosCd === 'pos_02' || selectedPosCd === 'pos_03') {
                addCommonOption($empTeamCd, '팀');
            } 
            // 직급이 팀장, 사원인 경우 (선택된 부서에 따라 팀이 달라짐)
            else if (selectedPosCd === 'pos_04' || selectedPosCd === 'pos_05') {
                await loadCodeData(`/SOLEX/code/team`, $empTeamCd, '팀');
            }
        }
    });
	
	
	
	// 사원 등록
	const $empForm = $('#empForm');
	const $registerBtn = $('#registerBtn');
	
	$registerBtn.on('click', async function(event) {
		event.preventDefault(); // 기본 폼 제출 방지
		
		// 1. 연락처, 이메일 값 병합
		beforeSubmit();
		
		// 1. 폼 요소에서 FormData 객체를 먼저 생성합니다.
	    const formElement = document.getElementById('empForm');
	    const formData = new FormData(formElement); 
		
		const payload = {
	        emp_nm: formData.get('emp_nm'), // 누락된 '이름' 추가
	        emp_birth: formData.get('emp_birth').replace(/\./g, '-'),
	        emp_hire: formData.get('emp_hire'),
	        emp_gd: document.querySelector('input[name="emp_gd"]:checked')?.value,
	        empCatCd: formData.get('empCatCd'),
	        empDepCd: formData.get('empDepCd'),
	        empPosCd: formData.get('empPosCd'),
	        empTeamCd: formData.get('empTeamCd'),
	        emp_phone: formData.get('emp_phone'),
	        emp_email: formData.get('emp_email'),
	        emp_pc: formData.get('emp_pc'),
	        emp_add: formData.get('emp_add'),
	        emp_da: formData.get('emp_da'),
	        emp_ea: document.getElementById('sample6_extraAddress')?.value || ''
	    };

		const file = document.getElementById('emp_img').files[0];
		
		// 3. 서버로 보낼 새로운 FormData 객체를 만듭니다.
	    const finalFormData = new FormData(); 
	    finalFormData.append(
	        'emp',
	        new Blob([JSON.stringify(payload)], { type: 'application/json' })
	    );
	    if (file) { // 파일이 있는 경우에만 추가
	        finalFormData.append('emp_img', file);
	    }
		
		try {
			const response = await fetch('/SOLEX/emp', { // 사원 등록을 처리할 서버 URL
				method: 'POST',
				body: finalFormData 
			});
			if (!response.ok) throw new Error(`에러러러러러러`);
			
			alert('인사 등록이 완료되었습니다^^');
			$employeeModal.modal('hide');
			
			currentPage = 0;
			loadDrafts(currentPage);

		} catch (error) {
			console.error('인사 등록 실패:', error);
			alert(`인사 등록에 실패했습니다...ㅠㅠ`);
		}
	});

	// 모달이 닫힐 때 폼 초기화
	$employeeModal.on('hidden.bs.modal', function () {
		$empForm[0].reset(); // 폼 필드 리셋
		$('#emp_img_preview').attr('src', '/SOLEX/assets/img/emp/simple_person_pic.jpg'); // 이미지 미리보기 초기화
		
		// 동적으로 로드된 셀렉트 박스들 초기 상태로 복원
        resetSelectBox($empCatCd, '종류', true);
        resetSelectBox($empDepCd, '부서', true);
        resetSelectBox($empTeamCd, '팀', true);
	});

});