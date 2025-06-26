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
	
	// 창고 리스트
    @GetMapping("")
    public List<Map<String, Object>> getStockList(@RequestParam("page") int page, @RequestParam("size") int size) {
    	// 로그인 아이디 가져오기 - 나중에 Spring Security 이용해서 가져와야됨
    	Long loginEmpId = 2L;
    	
    	int offset = page * size;
		System.out.println("page:" + page + "size: " + size);
    	
    	List<Map<String, Object>> listMap = stockService.getWarehouseList(offset, size);
    	return listMap;
    }
    
//    // 창고 상세보기 모달창
//    @GetMapping("/{whsId}")
//    public Map<String, Object> getWarehouseDetail(@PathVariable("whsId") String whsId) {
//    	System.out.println();
//    	// 로그인 아이디 가져오기 - 나중에 Spring Security 이용해서 가져와야됨
//    	Long loginEmpId = 2L;
//    	return stockService.getWarehouseDetail(whsId, loginEmpId);
//    }
//    
//    // 창고 구역의 히스토리
//    @GetMapping("/area/{areaId}/history")
//    public List<Map<String,Object>> getWarehouseAreaHistory(@PathVariable("areaId") Long areaId) {
//    	System.out.println();
//    	// 로그인 아이디 가져오기 - 나중에 Spring Security 이용해서 가져와야됨
//    	Long loginEmpId = 2L;
//    	return stockService.getWarehouseAreaHistory(areaId, loginEmpId);
//    }
//    
//    // 창고 등록
//  	@PostMapping("")
//  	public String approvalDocument(@RequestBody Map<String, Object> warehouseRequest) {
//  		// 로그인 아이디 가져오기 - 나중에 Spring Security 이용해서 가져와야됨
//      	Long loginEmpId = 2L;
//      	
//      	System.out.println("---------------------***********************----------------------");
//  		System.out.println(warehouseRequest);
//  		
//  		stockService.registerWarehouse(warehouseRequest);
//  		return "";
//  	}
//  	
//  	// 창고 수정
//  	@PatchMapping("")
//  	public String upadteWarehouse(@RequestBody Map<String, Object> warehouseRequest) {
//  		// 로그인 아이디 가져오기 - 나중에 Spring Security 이용해서 가져와야됨
//      	Long loginEmpId = 2L;
//      	
//      	System.out.println("---------------------***********************----------------------");
//  		System.out.println(warehouseRequest);
//  		
//  		stockService.upadteWarehouse(warehouseRequest, loginEmpId);
//  		return "";
//  	}
  	
}
