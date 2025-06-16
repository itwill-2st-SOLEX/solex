package kr.co.itwillbs.solex.orderrequest;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import lombok.extern.log4j.Log4j2;



@Log4j2
@RestController
@RequestMapping("/order-request")
public class OrderRequestsRestController {

	@Autowired
	OrderRequestsService orderRequestsService;
	
	@GetMapping("/data") // 
	public List<Map<String, Object>> getPagedGridData(
        @RequestParam(name = "page", defaultValue = "0") int page, // 
        @RequestParam(name = "pageSize", defaultValue = "20") int pageSize
    ) throws Exception {
        log.info("API - 그리드 데이터 조회 요청 파라미터: page={}, pageSize={}", page, pageSize);
        List<Map<String, Object>> list = orderRequestsService.getPagedGridDataAsMap(page, pageSize);
        log.info("API - 그리드 데이터 조회 결과: list={}",list);
        
        return list; 
    }
	
}
