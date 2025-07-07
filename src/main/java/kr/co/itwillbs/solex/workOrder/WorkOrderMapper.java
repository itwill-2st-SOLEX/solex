package kr.co.itwillbs.solex.workOrder;

import java.util.List;
import java.util.Map;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface WorkOrderMapper {
	
	// 작업지시 조회
	List<Map<String, Object>> getWorkList(@Param("offset") int offset, @Param("size") int size);
	// 해당 제품코드 등록 모달 조회
	List<Map<String, Object>> ProcessTeam(String prdCd);
	// 작업지시 등록
	void workOrderInsert(@Param("prdInfo") Map<String, Object> prdInfo, @Param("empId") String empId);
	void workProcessInsert(Map<String, Object> prdInfo);
	void insertSujuHistory(@Param("oddId") String oddId, @Param("empId") String empId);
	// 주문테이블 상태값 업테이트
	void updateSujuOrderSts(String oddId);
	// 창고 조회
	List<Map<String, Object>> getWarehouses(@Param("prdId") String prdId, @Param("optId") String optId);
	// 창고 자재 등록
	// 1. 창고 이력 insert
	void warehousesInsert(Map<String, Object> prdInfo);
	// 2. 재고 원장 insert
	void stockUpdate(Map<String, Object> prdInfo);
	// 3.구역 update
	void areaUpdate(Map<String, Object> prdInfo);
	// 4. 구역 디테일 update
	void areaDetailUpdate(Map<String, Object> prdInfo);
	// 5. 수주 detail update
	void sujuDetailUpdate(Map<String, Object> prdInfo);
	// 6. 수주 히스토리 테이블 인서트
	void sujuInserthistory(@Param("prdInfo") Map<String, Object> prdInfo, @Param("empId") String empId);
	
}
