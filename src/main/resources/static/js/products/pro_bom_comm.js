//전역 변수 설정
export const pageSize = 20;
export const gridHeight = 600;
export let editorInstance = null;
export let editorLoaded = false;
export let searchKeyword = '';
export let empId = null;

// 함수를 통해 하나의 API 엔드포인트에서 모든 데이터를 가져. 'products'와 'boms'가 모두 포함된 응답 출력
export async function fetchCombinedProductAndBomData(page, pageSize) {
    try {
        // 쿼리 파라미터를 추가하여 페이지네이션 및 검색 기능 지원
		let url = `/SOLEX/products/api/productList?page=${page}&size=${pageSize}`;
        const response = await fetch(url);

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP error! status: ${response.status}`);
        }
		
		const products = await res.json();  // 2. 응답을 JSON으로 파싱 → 객체로 바꿈
		const data = products.products;
				
        return data; 
    } catch (error) {
        throw error;
    }
}

/**
 * 페이지 로드 시 공통적으로 리스트를 초기화하는 함수
 * @param {string} addButtonId 클릭 이벤트 리스너를 추가할 버튼의 ID (예: 'bom-add', 'prod-add')
 * @param {function} writeHandler 해당 버튼 클릭 시 실행할 함수 (예: onWriteBom, onWriteProduct)
 * @param {function} loadListFunction 리스트 데이터를 로드할 함수 (예: bomList, productList)
 * @param {number} initialPage 로드 함수에 전달할 초기 페이지 번호
 */
export function initializeList(addButtonId, writeHandler, loadListFunction, initialPage) {
    document.addEventListener('DOMContentLoaded', () => {
        const addButton = document.getElementById(addButtonId);
        if (addButton) {
            addButton.addEventListener('click', writeHandler);
        } else {
        }
        loadListFunction(initialPage);
    });
}