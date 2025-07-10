package kr.co.itwillbs.solex.warehouse;

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
@RequestMapping("/warehouse")
public class WarehouseRestController {
	
	@Autowired
	public WarehouseService warehouseService;
	
	// 창고 리스트
    @GetMapping("")
    public List<Map<String, Object>> getWarehouseList(@RequestParam("page") int page, @RequestParam("size") int size) {
    	
    	int offset = page * size;
    	return warehouseService.getWarehouseList(offset, size);	
    }
    
    // 창고 상세보기 모달창
    @GetMapping("/{whsId}")
    public Map<String, Object> getWarehouseDetail(@PathVariable("whsId") String whsId) {
    	return warehouseService.getWarehouseDetail(whsId);
    }
    
    // 창고 구역의 히스토리
    @GetMapping("/area/{areaId}/history")
    public List<Map<String,Object>> getWarehouseAreaHistory(@PathVariable("areaId") Long areaId) {
    	return warehouseService.getWarehouseAreaHistory(areaId);
    }
    
    // 창고 등록
  	@PostMapping("")
  	public void approvalDocument(@RequestBody Map<String, Object> warehouseRequest) {
  		warehouseService.registerWarehouse(warehouseRequest);
  	}
  	
  	// 창고 수정
  	@PatchMapping("")
  	public void upadteWarehouse(@RequestBody Map<String, Object> warehouseRequest) {
  		warehouseService.upadteWarehouse(warehouseRequest);
  	}
  	
}
