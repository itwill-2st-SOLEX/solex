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
    
    // ---------------- Insert ----------------
    void insertProductLot(@Param("param") Map<String, Object> param);
}
