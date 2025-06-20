package kr.co.itwillbs.solex.products;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
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
	@GetMapping("/prdUnitTypes")
	public List<Map<String, String>> getPrdUnitTypes() throws Exception {
		System.out.println("getPrdUnitTypes() 메서드 잘 나옴??????");
		return null;
//		return Arrays.stream(ClientType.values())
//		        .map(ct -> Map.of(
//		            "code", ct.name(),
//		            "name", ct.getLabel()
//		        ))
//		        .collect(Collectors.toList());
	}

	
	
	
	
}