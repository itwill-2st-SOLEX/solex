package kr.co.itwillbs.solex.products;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;

import kr.co.itwillbs.solex.sales.ClientType;


@RestController
@RequestMapping("/products/api")
public class ProductsRestController {
	
	long loginEmpId = 7L; // 임시 ID
	
	@Autowired
	private ProductsService productsService;
	
	@Autowired
	private BomsService bomsService;

	// 상품 list
	@GetMapping("/productList")
	@ResponseBody
	public Map<String, Object> getProductList( 
			@RequestParam(name = "page", defaultValue = "1") int page,
		    @RequestParam(name = "perPage") int perPage,
		    @RequestParam(name = "prd_yn", defaultValue = "", required = false) String prd_yn
			) {
		 int offset = (page - 1) * perPage;
		    
	    // 1) 페이징된 목록 가져오기
	    List<Map<String, Object>> rows = productsService.getPagedProductList(offset, perPage, prd_yn);
	    if (rows == null) rows = new ArrayList<>();	// 빈 배열 보장
	    
	    // 2) 전체 개수 가져오기
	    int totalCount = productsService.getTotalProductCount(prd_yn);
	    System.out.println("product count ?????? " + totalCount);
	    
	    // 3) 결과 구성20
	    Map<String, Object> pagination = new HashMap<>();
	    pagination.put("page", page);
	    pagination.put("totalCount", totalCount);
	    
	    Map<String, Object> data = new HashMap<>();
	    data.put("contents", rows);
	    data.put("pagination", pagination);
	    
	    Map<String, Object> result = new HashMap<>();
	    result.put("result", true);
	    result.put("data", data);
	    
	    return result;
	}
	
	// 단위 셀렉트바 옵션들
	@GetMapping("/prdUnitTypes")
	public Map<String, Object> getPrdUnitTypes(@RequestParam("groupCode") String groupCode) throws Exception {
		
		System.out.println("getCommonCodes API called with groupCode: " + groupCode);
 		List<Map<String, String>> prdUnitList = productsService.getPrdUnitTypesAsMap(groupCode);
		Map<String, Object> result = new HashMap<>();
		result.put("data", prdUnitList);
		
		return result;
	}
	
	
	// 제품 insert
	@PostMapping("/productRegist")
	public ResponseEntity<Map<String, String>> registerProduct(@RequestBody Map<String, Object> requestMap) {
        // 서비스 호출, Map을 그대로 넘김
        productsService.registerProduct(requestMap);

        Map<String, String> response = new java.util.HashMap<>();
        response.put("message", "제품 등록 성공!");
        return ResponseEntity.ok(response);
    }
	
	// 제품 update
	@PostMapping("/productUpdate")
	public ResponseEntity<Map<String, String>> editProduct(@RequestBody Map<String, Object> productData) {
		
		productsService.editProduct(productData);
		
		Map<String, String> response = new java.util.HashMap<>();
        response.put("message", "제품 수정 성공!");
        
        return ResponseEntity.ok(response); 
	}
	
	// PRD_ID를 받아 해당 제품의 모든 옵션 목록을 반환하는 API 엔드포인트
    @GetMapping("/productOptions")
    public ResponseEntity<Map<String, Object>> getProductOptions(@RequestParam("prdId") String prdId) {
    	
    	// OPTION COUNT
    	int totalOptionCount = productsService.getOptionTotalCount(prdId);
    	
        Map<String, Object> response = new HashMap<>();
        try {
            List<Map<String, Object>> options = productsService.getProductOptions(prdId);
            response.put("status", "success");
            response.put("data", options);
            response.put("opt_count", totalOptionCount);
            System.out.println("response ?? " + response);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.err.println("제품 옵션 조회 중 오류 발생: " + e.getMessage());
            response.put("status", "error");
            response.put("message", "제품 옵션을 불러오는 데 실패했습니다: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }
	
	
}