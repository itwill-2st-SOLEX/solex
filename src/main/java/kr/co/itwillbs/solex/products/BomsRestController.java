package kr.co.itwillbs.solex.products;

import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
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
@RequestMapping("/boms/api")
public class BomsRestController {
	
	long loginEmpId = 7L; // 임시 ID
	
	@Autowired
	private BomsService bomsService;
	
	// BOM list
	@GetMapping("/bomList")
	@ResponseBody
	public Map<String, Object> getPagedDetailCodeList(
	    @RequestParam(name = "opt_id") String opt_id,
	    @RequestParam(name = "page", defaultValue = "1") int page,
	    @RequestParam(name = "perPage") int perPage
	) {
	    int offset = (page - 1) * perPage;
	    System.out.println("offset ?? " + offset);
	    List<Map<String, Object>> rows = bomsService.getBomList(opt_id, offset, perPage);
	    
	    
	    System.out.println("getBomList?? " + rows);
	    if (rows == null) rows = new ArrayList<>();

	    int totalCount = bomsService.getTotalBomCount(opt_id);
	    
	    Map<String, Object> pagination = Map.of("page", page, "totalCount", totalCount);
	    Map<String, Object> data = Map.of("contents", rows, "pagination", pagination);

	    return Map.of("result", true, "data", data);
	}
	
	@PostMapping("/save")
	public Map<String, Object> saveBomInfo(@RequestBody Map<String, List<Map<String, Object>>> map) {
		System.out.println("save 함수의 데이터 : " + map);
		List<Map<String, Object>> insertList = map.get("createdRows");
	    List<Map<String, Object>> updateList = map.get("updatedRows");
	    
	    if ((insertList == null || insertList.isEmpty()) && (updateList == null || updateList.isEmpty())) {
            return Map.of("success", false, "message", "저장할 데이터가 없습니다.");
        }

	    // 상세공통코드 신규 행 추가
	    if (insertList != null && !insertList.isEmpty()) {
	    	bomsService.updateBomInfo(insertList);
	    }

	    // 상세공통코드 기존 행 수정
	    if (updateList != null && !updateList.isEmpty()) {
	    	bomsService.updateBomInfo(updateList);
	    }
		
		return Map.of("success", true);
	}
	
	 // ⭐ 새로 추가할 일괄 BOM 저장 API 엔드포인트 ⭐
    @PostMapping("/batchSave")
    public ResponseEntity<Map<String, Object>> batchSaveBom(@RequestBody Map<String, Object> payload) {
        Map<String, Object> response = new HashMap<>();
        System.out.println("response : " + response);
        return null;
//        try {
//            // 1. 요청 페이로드에서 데이터 추출
//            // targetOptIds: BOM을 적용할 제품 옵션 ID 목록 (프론트에서 prod_grid 체크박스로 선택된 것들)
//            List<String> targetOptIds = (List<String>) payload.get("targetOptIds");
//            
//            // bomChanges: 현재 bom_grid의 변경 사항 (생성, 수정, 삭제된 행 정보)
//            Map<String, List<Map<String, Object>>> bomChanges = 
//                (Map<String, List<Map<String, Object>>>) payload.get("bomChanges");
//
//            // bomChanges 내의 각 리스트 추출
//            List<Map<String, Object>> createdRows = bomChanges.getOrDefault("createdRows", List.of()); // Java 9+
//            List<Map<String, Object>> updatedRows = bomChanges.getOrDefault("updatedRows", List.of()); // Java 9+
//            // List.of() 대신 Collections.emptyList() 사용 가능 (Java 8)
//            // List<Map<String, Object>> createdRows = bomChanges.getOrDefault("createdRows", Collections.emptyList());
//            // List<Map<String, Object>> updatedRows = bomChanges.getOrDefault("updatedRows", Collections.emptyList());
//            // List<Map<String, Object>> deletedRows = bomChanges.getOrDefault("deletedRows", Collections.emptyList()); 
//            // 현재 전략에서는 deletedRows는 Service에서 직접 처리하므로 여기서는 필수가 아님
//
//            if (targetOptIds == null || targetOptIds.isEmpty()) {
//                response.put("success", false);
//                response.put("message", "일괄 저장할 대상 제품(OPT_ID)이 지정되지 않았습니다.");
//                return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
//            }
//
//            // 2. 서비스 호출
//            // bomChanges 전체 Map을 넘겨주거나, createdRows, updatedRows를 각각 넘겨줍니다.
//            // 여기서는 createdRows, updatedRows만 넘겨 최종 상태를 구성하는 전략을 따릅니다.
//            bomsService.processBatchBomSave(targetOptIds, createdRows, updatedRows);
//
//            response.put("success", true);
//            response.put("message", targetOptIds.size() + "개의 제품에 BOM이 성공적으로 일괄 저장되었습니다.");
//            return new ResponseEntity<>(response, HttpStatus.OK);
//
//        } catch (Exception e) {
//            e.printStackTrace(); // 서버 로그에 스택 트레이스 출력
//            response.put("success", false);
//            response.put("message", "BOM 일괄 저장 중 오류가 발생했습니다: " + e.getMessage());
//            return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
//        }
    }

	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	// 단위 셀렉트바 옵션들
	@GetMapping("/materialList")
	public List<Map<String, Object>> getmaterialList() {
		List<Map<String, Object>> materials = bomsService.getMaterialList();
		
		return materials;
	}
	
	// ⭐ BOM 삭제 API 엔드포인트 ⭐
    @DeleteMapping("/deleteBom")
    public ResponseEntity<Map<String, Object>> deleteBom(@RequestBody List<Integer> bomIds) {
    	System.out.println("BOM ID 콘트롤러에 제대로 들어옴? " + bomIds);
        Map<String, Object> response = new HashMap<>();
        try {
            int deletedCount = bomsService.deleteBom(bomIds);
            response.put("success", true);
            response.put("message", deletedCount + "개의 BOM이 삭제되었습니다.");
            response.put("deletedCount", deletedCount);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            e.printStackTrace();
            response.put("success", false);
            response.put("message", "BOM 삭제 중 오류 발생: " + e.getMessage());
            return ResponseEntity.status(500).body(response); // 500 Internal Server Error
        }
    }
	
	
	
	
	
	
}