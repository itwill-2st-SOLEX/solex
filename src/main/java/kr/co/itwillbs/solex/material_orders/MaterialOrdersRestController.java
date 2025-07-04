package kr.co.itwillbs.solex.material_orders;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.servlet.http.HttpSession;
import lombok.extern.log4j.Log4j2;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;


@Log4j2
@RestController
@RequestMapping("/material_orders")
public class MaterialOrdersRestController {
	
	@Autowired
	private MaterialOrdersService materialOrdersService;
	
	@PostMapping("/registration")
	public void materialOrderRegist(@RequestBody Map<String, Object> matordMap, HttpSession session) {
		System.out.println("#################################");
		String emp_id = (String) session.getAttribute("empId");
		System.out.println("emp_id = " + emp_id);
		System.out.println("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
		matordMap.put("emp_id", emp_id);
		System.out.println("mat ord map = " + matordMap);
		materialOrdersService.materialOrderRegist(matordMap);	
	}
	
	//select box 자재 id 가져오는 코드
	@GetMapping("/getMatId")
	public List<Map<String, Object>> getMatId() {
		return materialOrdersService.getMatId();
	}
	
	//select box 창고목록 가져오는 코드
	@GetMapping("/getWarehouse")
	public List<Map<String, Object>> getWarehouse(@RequestParam("matId") String matId) {
		System.out.println(matId);
		
		int num = Integer.parseInt(matId);
		
		return materialOrdersService.getWarehouse(num);
	}
	
	//select box 구역목록 가져오는 코드
	@GetMapping("/getArea")
	public List<Map<String, Object>> getArea(@RequestParam("whsId") String whsId, @RequestParam("matId") String matId) {
		System.out.println(whsId);
		
		int num1 = Integer.parseInt(whsId);
		int num2 = Integer.parseInt(matId);
		return materialOrdersService.getArea(num1, num2);
	}
	
	//무한스크롤 자재 발주 목록
	@GetMapping("/materialList")
    public List<Map<String, Object>> materialOrdersService(@RequestParam("page") int page, @RequestParam("size") int size) {
		int offset = page * size;
        return materialOrdersService.getMaterialOrderList(offset, size);
    }
	
	// 승인 버튼 누르면
	@PostMapping("/materialApprove")
	public ResponseEntity<Void> materialApprove(@RequestBody Map<String, Object> map) {
		materialOrdersService.materialApprove(map);
	    return ResponseEntity.ok().build();
	}
	
	// 반려 버튼 누르면
	@PostMapping("/materialDeny")
	public ResponseEntity<Void> materialDeny(@RequestBody Map<String, Object> map) {
		materialOrdersService.updateDeny(map);
		
		log.info(">>>>>>>>>> 확인");
	    return ResponseEntity.ok().build();
	}
	

	
}