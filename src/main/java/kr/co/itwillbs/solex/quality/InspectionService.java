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
		
		return list;
		
	}
	
	@Transactional // 프로시저 내에서 DML이 수행되므로 트랜잭션으로 묶는 것이 일반적입니다.
	public Map<String, Object> executeOutboundProcedure(Long oddId, Long qhiBcount) {
        // 프로시저에 전달할 파라미터 맵 생성
        Map<String, Object> params = new HashMap<>();
        // IN 파라미터 설정
        // Oracle 프로시저의 파라미터 이름과 MyBatis 매퍼 XML에서 정의된 이름이 일치해야 합니다.
        // 여기서는 프로시저 파라미터 이름(p_odd_id, p_qhi_bcount)을 Java Map의 키로 사용합니다.
        params.put("pOddId", oddId); // p_odd_id에 해당하는 Java 변수
        params.put("pQhiBcount", qhiBcount); // p_qhi_bcount에 해당하는 Java 변수

        // OUT 파라미터 초기화 (선택 사항이지만, 명확성을 위해 추가)
        // MyBatis는 프로시저 실행 후 OUT 파라미터 값을 이 맵에 자동으로 채워줍니다.
        params.put("oActualOutQty", null);
        params.put("oStatusCode", null);
        params.put("oStatusMessage", null);

        // Mapper를 통해 프로시저 호출
        // OUT 파라미터는 프로시저 실행 후 자동으로 이 'params' 맵에 채워집니다.
        inspectionMapper.callFifoOutboundByOdd(params);

        // 프로시저 실행 후, 'params' 맵에서 OUT 파라미터의 값을 추출
        String statusCode = (String) params.get("oStatusCode");
        String statusMessage = (String) params.get("oStatusMessage");
        // Oracle NUMBER 타입은 Java에서 Long 또는 BigDecimal로 매핑될 수 있으므로, Number로 받거나
        // 실제 데이터 유형에 따라 Long 또는 Integer로 캐스팅하는 것을 고려해야 합니다.
        Number actualOutQty = (Number) params.get("oActualOutQty");

        // 결과 로깅 (개발/디버깅 목적)
        System.out.println("프로시저 실행 결과:");
        System.out.println("  실제 출고 수량 (oActualOutQty): " + actualOutQty);
        System.out.println("  상태 코드 (oStatusCode): " + statusCode);
        System.out.println("  상태 메시지 (oStatusMessage): " + statusMessage);

        // 프로시저 결과에 따른 비즈니스 로직 처리
        if ("SUCCESS".equals(statusCode)) {
            // 성공 로직: 예를 들어 추가적인 데이터 처리 또는 로그 기록
            System.out.println("재고 출고 성공!");
        } else if ("NOT_ENOUGH_STOCK".equals(statusCode)) {
            // 재고 부족 처리
            // 특정 예외를 던지거나, 클라이언트에게 오류 메시지를 전달하는 등의 추가 처리가 필요합니다.
            System.err.println("재고 부족 오류: " + statusMessage);
            // throw new RuntimeException("재고 부족 오류: " + statusMessage);
        } else if ("NOT_FOUND_DATA".equals(statusCode)) {
            // 데이터 없음 처리
            System.err.println("데이터 없음 오류: " + statusMessage);
            // throw new RuntimeException("데이터 없음 오류: " + statusMessage);
        } else {
            // 기타 오류 처리
            System.err.println("재고 출고 프로시저 실행 중 알 수 없는 오류 발생: " + statusMessage);
            // throw new RuntimeException("프로시저 실행 오류: " + statusMessage);
        }

        return params; // 모든 IN/OUT 파라미터가 포함된 최종 맵 반환
    }
}




