package kr.co.itwillbs.solex.lot;

import java.util.List;
import java.util.Map;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface LotMapper {
	
	// 제품유형 / 생산상태 리스트 조회
	List<Map<String, Object>> selectDetailCodeListByCodId(@Param("codId") String codId);

	// 완제품LOT
	List<Map<String, Object>> selectFilteredProductLots(@Param("lotCode") String lotCode, @Param("lotStatus") String lotStatus, @Param("prdType") String prdType);

	// 공정리스트
	List<Map<String, Object>> selectProcessNodes(@Param("prdLotId") Long prdLotId);

	// 자재리스트
	List<Map<String, Object>> selectMaterialNodes(@Param("prdLotId") Long prdLotId);

	// 설비리스트
	List<Map<String, Object>> selectEquipmentNodes(@Param("prdLotId") Long prdLotId);
	
	// ------------------------------- 상세조회 -------------------------------
	// 최상위 LOT 상세조회
	Map<String, Object> selectProductLotDetail(@Param("prdLotId") Long prdLotId);
	
	// 공정 상세조회
    Map<String, Object> selectProcessLotDetail(@Param("prcLotId") Long prcLotId);
    
    // 자재 상세조회
    Map<String, Object> selectMaterialLotDetail(@Param("matLotId") Long matLotId);
    
    // 설비 상세조회
    Map<String, Object> selectEquipmentDetail(@Param("eqpId") Long eqpId);
    
    // ---------------- 작업지시 등록 시 ----------------
    // 1. 제품 + 옵션 정보 조회
    Map<String, Object> selectLotInsertInfo(@Param("oddId") Long oddId);
    // 2. product_lot insert
    void insertProductLot(Map<String, Object> param);
    // 3. insert 이후 prd_lot_id 조회
    Long selectPrdLotId(Map<String, Object> lotInfo);
    
    // odd_id로 자재LOT + 투입량 조회
    List<Map<String, Object>> selectMaterialLotsByOddId(@Param("oddId") Long oddId);
    // 제품LOT ↔ 자재LOT 매핑 insert
    void insertProductMaterialMapping(Map<String, Object> map);
    
    // 4. 작업지시 리스트 조회
    List<Map<String, Object>> selectWorkOrdersByOddId(@Param("oddId") Long oddId);
    // 5. process_lot insert
    void insertProcessLot(Map<String, Object> param);
    // 6. insert 이후 prc_lot_id 조회
    Long selectPrcLotId(Map<String, Object> param);
    // 7. 매핑 insert
    void insertProductProcessMapping(Map<String, Object> param);
    // ---------------- 자재 입고 시 ----------------
    // 1. 자재ID를 통해 자재코드 조회
    String selectMaterialCodeById(Long mat_id);
    // 2. 같은 날짜에 입고한적 있는지 MatLot 조회
    Integer selectNextMaterialLotSort(Map<String, Object> map);
    // 3. material_lot insert
	void insertMaterialLot(Map<String, Object> map);
	// ---------------- 최초 공정 시작 시 제품LOT 상태값 변경 ----------------
	// 1. 최초 공정인지 확인
	boolean isFirstProcess(Long wpoId);
	// 2. 최상위 LOT 상태를 '진행중(lot_status_02)'으로 변경
	void updatePrdLotStatusToInProgress(Long wpoId);
	// ---------------- 창고 배정 시 제품LOT 상태값 변경 ----------------
	// 1. 제품 LOT 상태를 완료(lot_status_03)로 변경
	void updatePrdLotStatusToComplete(Integer oddId);


}
