package kr.co.itwillbs.solex.quality;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import kr.co.itwillbs.solex.orderrequest.OrderRequestsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.RequestBody;

@Service
public class InspectionService {

    private final OrderRequestsService orderRequestsService;
	
	@Autowired
	InspectionMapper inspectionMapper;

    InspectionService(OrderRequestsService orderRequestsService) {
        this.orderRequestsService = orderRequestsService;
    }
	
	//로그인한 사람에 해당하는 공정 정보 가져오기
	public Map<String, Object> getManagerSummary(Long empId) {
		return inspectionMapper.getManagerSummary(empId);
	}
	
	public int getManagerCount(Long empId) {
		return inspectionMapper.getManagerCount(empId);
	}
	
	//작업 현황 모두 가져오기
	public List<Map<String, Object>> getInspectionList(Map params){
		return inspectionMapper.getInspectionList(params);
	}
	
	
	// 작업별 사원 생산량 리스트
	public List<Map<String, Object>> selectWorkerList(Map map){
		return inspectionMapper.selectWorkerList(map);
	}

	
	// 작업 상태 업데이트 
	public void updateStatus(Map<String, Object> map) {
		inspectionMapper.updateStatus(map);
	}

	public List<Map<String, Object>> getDefectiveCountByWarehouse(Map<String, Object> map) {
		List<Map<String, Object>> list = inspectionMapper.getDefectiveCountByWarehouse(map);
		System.out.println(list);
		
		return list;
		
	}
	
	@Transactional // 프로시저 내에서 DML이 수행되므로 트랜잭션으로 묶는 것이 일반적입니다.
    public Map<String, Object> executeOutboundProcedure(Long oddId, Long qhiBcount) {
        // 프로시저에 전달할 파라미터 맵 생성
        Map<String, Object> params = new HashMap<>();
        // IN 파라미터 설정
        params.put("pOddId", oddId);
        params.put("pQhiBcount", qhiBcount);

        // Mapper를 통해 프로시저 호출
        // OUT 파라미터는 프로시저 실행 후 자동으로 이 'params' 맵에 채워집니다.
        inspectionMapper.callFifoOutboundByOdd(params);

        // 프로시저 실행 후, 'params' 맵에서 OUT 파라미터의 값을 추출
        String statusCode = (String) params.get("oStatusCode");
        String statusMessage = (String) params.get("oStatusMessage");
        Number actualOutQty = (Number) params.get("oActualOutQty"); // Oracle NUMBER는 Long 또는 BigDecimal로 매핑될 수 있음

        // 결과 로깅 (개발/디버깅 목적)
        System.out.println("--- 프로시저 호출 결과 ---");
        System.out.println("Status Code: " + statusCode);
        System.out.println("Status Message: " + statusMessage);
        System.out.println("Actual Out Quantity: " + actualOutQty);
        System.out.println("-------------------------");


        // 프로시저 결과에 따른 비즈니스 로직 처리
        if ("SUCCESS".equals(statusCode)) {
            // 성공 로직: 예를 들어 추가적인 데이터 처리 또는 로그 기록
            System.out.println("재고 출고 프로시저가 성공적으로 실행되었습니다.");
        } else if ("NOT_ENOUGH_STOCK".equals(statusCode)) {
            // 재고 부족 처리
            System.out.println("재고가 부족하여 출고에 실패했습니다.");
            // 특정 예외를 던지거나, 클라이언트에게 오류 메시지를 전달하는 등의 추가 처리가 필요합니다.
            // throw new RuntimeException("재고 부족 오류: " + statusMessage);
        } else if ("NOT_FOUND_DATA".equals(statusCode)) {
            // 데이터 없음 처리
            System.out.println("필요한 데이터를 찾을 수 없어 출고에 실패했습니다.");
            // throw new RuntimeException("데이터 없음 오류: " + statusMessage);
        } else {
            // 기타 오류 처리
            System.err.println("재고 출고 프로시저 실행 중 알 수 없는 오류 발생: " + statusMessage);
            // throw new RuntimeException("프로시저 실행 오류: " + statusMessage);
        }

        return params; // 모든 IN/OUT 파라미터가 포함된 최종 맵 반환
    }
}




