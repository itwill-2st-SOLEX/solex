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
		// 1. 제품 기본 정보 삽입(PRD_ID 없음)
		productsMapper.insertProduct(productData);
		
		// 2. 방금 삽입된 제품의 PRD_ID (자동 생성된 키) 획득
		Long prdId  = productsMapper.selectLatestProductId();
     
	    // 3. 옵션 목록 추출 및 각 옵션에 제품 ID 연결
	    // 프론트엔드에서 넘어온 'options' 키의 값은 List<Map<String, String>> 형태입니다.
	    List<Map<String, String>> optionsList = (List<Map<String, String>>) productData.get("options");
	    
	    // 옵션 목록이 비어있지 않다면 처리
	    if (optionsList != null && !optionsList.isEmpty()) {
	        for (Map<String, String> optionMap : optionsList) {
	        	System.out.println("optionMap 내용 잘 나옴?? " + optionMap);
	        	optionMap.put("prd_id", String.valueOf(prdId));
	        	System.out.println("DEBUG: 옵션 맵 내용 ---");
	            System.out.println("DEBUG:   PRD_ID: " + optionMap.get("prd_id"));
	            System.out.println("DEBUG:   OPT_COLOR: " + optionMap.get("OPT_COLOR")); 
	            System.out.println("DEBUG:   OPT_SIZE: " + optionMap.get("OPT_SIZE"));   
	            System.out.println("DEBUG:   OPT_HEIGHT: " + optionMap.get("OPT_HEIGHT")); 
	            System.out.println("DEBUG:   OPT_YN: " + optionMap.get("OPT_YN")); 
	            System.out.println("DEBUG: ---");

	            // 4. 모든 옵션 정보 다건 삽입
	            productsMapper.insertProductOption(optionMap);
	        }
	    }
	    System.out.println("서비스: 제품 등록 및 옵션 저장 완료. 최종 제품 ID: " + prdId);
	}

	public List<Map<String, Object>> getProductOptions(String prdId) {
		return productsMapper.getProductOptionsByProductId(prdId);
	}

	public void editProduct(Map<String, Object> productData) {
		// 제품 기본 정보 업데이트
        productsMapper.updateProduct(productData);
        
        List<Map<String, String>> options = (List<Map<String, String>>) productData.get("options"); // 체크한 옵션만 들어옴. 
        
        String prdIdToUpdate = (String) productData.get("prd_id");

        // 새 옵션 정보 삽입
        for (Map<String, String> option : options) {
            option.put("prd_id", prdIdToUpdate);
            
            int count = productsMapper.countExistingOption(option);
            if (count == 0) {
            	productsMapper.insertProductOption(option);
            }
            
            
        }
		
	}

	public int getOptionTotalCount(String prdId) {
		return productsMapper.selectOptionTotalCount(prdId);
	}

	public int isPrdCodeDuplicate(String prdCode) {
        return productsMapper.existsByPrdCode(prdCode); 
    }
}