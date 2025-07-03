package kr.co.itwillbs.solex.workOrder;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import kr.co.itwillbs.solex.lot.LotService;

@Service
public class WorkOrderService {

	@Autowired
	WorkOrderMapper mapper;
	@Autowired
	private LotService lotService;

	// 작업지시 조회
	public List<Map<String, Object>> getWorkList(int offset, int size) {
		return mapper.getWorkList(offset, size);
	}

	// 해당 제품코드 등록 모달 조회
	public List<Map<String, Object>> getProcessTeam(String prdCd) {
		return mapper.ProcessTeam(prdCd);
	}

	// 작업지시 등록
	@Transactional
	public void workOrderInsert(List<Map<String, Object>> prdInfo, String empId) {
		for (Map<String, Object> item : prdInfo) {
	        mapper.workOrderInsert(item, empId);
	        Integer wrkId = (Integer) item.get("wrk_id");
	        item.put("wrk_id", wrkId);
	        mapper.workProcessInsert(item);
	    }
		// 주문테이블, 주문 디테일테이블 상태값 업테이트
		String oddId = (String) prdInfo.get(0).get("oddId");
		mapper.updateSujuOrderSts(oddId);
		// 수주 히스토리 테이블 인서트
		mapper.insertSujuHistory(oddId, empId);
		
		// ✅ 작업지시 등록 후 LOT 일괄 생성
	    lotService.insertLotCascade(Long.parseLong(oddId));
		
	}

	// 창고 조회
	public List<Map<String, Object>> getWarehouses(String prdId) {
		return mapper.getWarehouses(prdId);
	}

	// 창고 자재 등록
	@Transactional
	public void warehousesInsert(Map<String, Object> prdInfo, String empId) {
		// 1. 창고 이력 insert
		mapper.warehousesInsert(prdInfo);
		// 2. 재고 원장 insert
		mapper.stockUpdate(prdInfo);
		// 3.구역 update
		mapper.areaUpdate(prdInfo);
		// 4. 구역 디테일 update
		mapper.areaDetailUpdate(prdInfo);
		// 5. 수주 detail update
		mapper.sujuDetailUpdate(prdInfo);
		// 6. 수주 히스토리 테이블 인서트
		mapper.sujuInserthistory(prdInfo, empId);
	}
}
