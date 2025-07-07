package kr.co.itwillbs.solex.workOrder;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.servlet.http.HttpSession;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;


@RestController
@RequestMapping("/workOrders")
@PreAuthorize("hasAnyRole('1','2','3','4')")
public class WorkOrderRestController {
	@Autowired
	WorkOrderService service;
	
	// 작업지시 조회
	@GetMapping("/list")
	public List<Map<String, Object>> getWorkList(@RequestParam("page") int page, @RequestParam("size") int size) {
		int offset = page * size;
		return service.getWorkList(offset, size);
	}
	
	// 해당 제품코드 등록 모달 조회
	@GetMapping("/{prd_code}")
	public List<Map<String, Object>> getProcessTeam(@PathVariable("prd_code") String prdCd) {
		return service.getProcessTeam(prdCd);
	}
	
	// 작업지시 등록
	@PostMapping("")
	public void workOrderInsert(@RequestBody List<Map<String, Object>> prdInfo,
								HttpSession session) {
		String empId = (String)session.getAttribute("empId");
		service.workOrderInsert(prdInfo, empId);
	}
	
	// 창고 조회
	@GetMapping("/warehouses/{prdId}")
	public List<Map<String, Object>> getWarehouses(@PathVariable("prdId") String prdId,
												   @RequestParam("optId") String optId) {
		return service.getWarehouses(prdId, optId);
	}
	
	// 창고 자재 등록
	@PostMapping("/warehouses")
	public void warehousesInsert(@RequestBody Map<String, Object> prdInfo,
								 HttpSession session) {
		String empId = (String)session.getAttribute("empId");
		System.out.println(prdInfo);
		service.warehousesInsert(prdInfo, empId);
	}
}
