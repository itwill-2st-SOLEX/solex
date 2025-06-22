package kr.co.itwillbs.solex.products;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.apache.ibatis.annotations.Param;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ProductsService {

	@Autowired
	private ProductsMapper productsMapper;
	
	public List<Map<String, Object>> getProductsList() {
		return productsMapper.selectProductsLists();
	}

	public List<Map<String, Object>> getPagedProductList(@Param("offset") int offset,
														@Param("perPage") int perPage, 
														@Param("prd_yn") String prdYn) {
		return productsMapper.selectPagedProductList(offset, perPage, prdYn);
	}

	public int getTotalProductCount(String prdYn) {
		return productsMapper.selectTotalProductCount(prdYn);
	}

	// 단위 셀렉트바 옵션들
	public List<Map<String, String>> getPrdUnitTypesAsMap(String groupCode) {
		return productsMapper.selectPrdUnitTypesAsMap(groupCode);
	}

	@Transactional
	public void registerProduct(Map<String, Object> productData) {
		// 1. 제품 기본 정보 삽입
		productsMapper.insertProduct(productData);
		
		// 2. 방금 삽입된 제품의 ID (자동 생성된 키) 획득
        Object prdIdObject = productData.get("prd_id");
        System.out.println("DEBUG: `insertProduct` 후 requestMap.get(\"prd_id\")의 원본 객체: " + prdIdObject);
        System.out.println("DEBUG: `insertProduct` 후 requestMap.get(\"prd_id\")의 타입: " + (prdIdObject != null ? prdIdObject.getClass().getName() : "null"));

        Long prdId = null;
        if (prdIdObject instanceof Number) {
            prdId = ((Number) prdIdObject).longValue();
        } else if (prdIdObject instanceof String) { // 만약 String으로 넘어온다면 파싱
            try {
                prdId = Long.parseLong((String) prdIdObject);
            } catch (NumberFormatException e) {
                System.err.println("ERROR: PRD_ID를 Long으로 파싱하는데 실패했습니다: " + prdIdObject);
            }
        }
        
        // ⭐⭐ 이 부분이 가장 중요합니다. PRD_ID가 NULL인지 확인 ⭐⭐
        if (prdId == null) {
            System.err.println("CRITICAL ERROR: 제품 ID (PRD_ID)가 NULL이거나 유효하지 않습니다. 옵션 삽입을 건너뜀.");
            throw new IllegalStateException("제품 등록 후 PRD_ID를 가져올 수 없습니다."); // 오류 발생시켜 트랜잭션 롤백
        }
        System.out.println("DEBUG: 최종적으로 추출된 PRD_ID (Long): " + prdId);

     
        
	     // 3. 옵션 목록 추출 및 각 옵션에 제품 ID 연결
	    // 프론트엔드에서 넘어온 'options' 키의 값은 List<Map<String, String>> 형태입니다.
	    List<Map<String, String>> optionsList = (List<Map<String, String>>) productData.get("options");

	    
	    // 옵션 목록이 비어있지 않다면 처리
	    if (optionsList != null && !optionsList.isEmpty()) {
	        for (Map<String, String> optionMap : optionsList) {
	            // 각 옵션 맵에 획득한 제품 ID를 추가합니다.
	            // 이 'prd_id' 키는 mapper.xml의 <foreach> 내부에서 #{option.prd_id}로 사용됩니다.
	        	optionMap.put("prd_id", String.valueOf(prdId));
	        	System.out.println("DEBUG: 옵션 맵 내용 ---");
	            System.out.println("DEBUG:   PRD_ID: " + optionMap.get("prd_id"));
	            System.out.println("DEBUG:   OPT_COLOR: " + optionMap.get("opt_color")); // ⭐ 이 값 확인
	            System.out.println("DEBUG:   OPT_SIZE: " + optionMap.get("opt_size"));   // ⭐ 이 값 확인
	            System.out.println("DEBUG:   OPT_HEIGHT: " + optionMap.get("opt_height")); // ⭐ 이 값 확인
	            System.out.println("DEBUG: ---");

	            // 4. 모든 옵션 정보 다건 삽입
	            productsMapper.insertProductOption(optionMap);
	        }
	    }
	    
	    System.out.println("서비스: 제품 등록 및 옵션 저장 완료. 최종 제품 ID: " + prdId);




		
	}
	
	

}
