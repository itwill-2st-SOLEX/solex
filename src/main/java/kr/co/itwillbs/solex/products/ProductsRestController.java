package kr.co.itwillbs.solex.products;

import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/products/api")
public class ProductsRestController {
	
	long loginEmpId = 7L; // 임시 ID
	
	@Autowired
	private ProductsService productsService;

	// 상품 list
	@GetMapping("/productList")
	public ResponseEntity<List<Map<String, Object>>> getProductList( // 반환 타입을 DTO로 변경
			@RequestParam(name = "page", required = false) Integer page
			) {
		
		List<Map<String, Object>> getProductsList = productsService.getProductsList();
		System.out.println("rest api + " + getProductsList);
		
	    Map<String, Object> params = new HashMap<>();
	    params.put("page", page);
	    params.put("empId", loginEmpId);
        
	    return ResponseEntity.ok(getProductsList);
	}
	
	
}