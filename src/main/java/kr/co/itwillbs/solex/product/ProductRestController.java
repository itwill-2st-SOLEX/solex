package kr.co.itwillbs.solex.product;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/product")
public class ProductRestController {
	
	@Autowired
	private ProductService productService;
	
	@GetMapping("")
    public List<Map<String, Object>> getProductNameList() {
        return productService.getProductNameList();
    }


    @GetMapping("/options/{prd_id}")
    public List<Map<String, Object>> getProductOptions(@PathVariable("prd_id") String prd_id) {
        return productService.getProductOptions(prd_id);
    }

}
