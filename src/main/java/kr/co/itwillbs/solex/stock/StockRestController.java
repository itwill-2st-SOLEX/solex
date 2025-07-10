package kr.co.itwillbs.solex.stock;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/stock")
public class StockRestController {
	
	@Autowired
	public StockService stockService;
	
	// 재고 리스트
    @GetMapping("")
    public List<Map<String, Object>> getStockList(@RequestParam("page") int page, @RequestParam("size") int size) {
    	// 로그인 아이디 가져오기 - 나중에 Spring Security 이용해서 가져와야됨
    	Long loginEmpId = 2L;
    	
    	int offset = page * size;
		System.out.println("page:" + page + "size: " + size);
    	
    	List<Map<String, Object>> listMap = stockService.getStockList(offset, size);
    	return listMap;
    }
    
    // 재고 상세보기
    @GetMapping("/{itemId}")
    public List<Map<String, Object>> getStockDetail(@PathVariable("itemId") String itemId, @RequestParam("type") String type) {
    	// 로그인 아이디 가져오기 - 나중에 Spring Security 이용해서 가져와야됨
    	Long loginEmpId = 2L;
    	
    	System.out.println("ddddddddddddddddddddddddddddddddddddddddddddddd");
    	System.out.println(itemId);
    	System.out.println(type);
    	
    	return stockService.getStockDetail(itemId, type, loginEmpId);
    }
  	
}
