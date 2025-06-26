package kr.co.itwillbs.solex.lot;

import java.util.List;
import java.util.Map;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface LotMapper {
	
	// 제품유형 / 생산상태 리스트 조회
	List<Map<String, Object>> selectDetailCodeListByCodId(String codId);
	
	// 최상위 LOT 목록 조회
	List<Map<String, Object>> getFilteredProductLots(@Param("lotCode") String lotCode, @Param("lotStatus") String lotStatus, @Param("prdType") String prdType);
	
	// 하위 공정 LOT 조회
    List<Map<String, Object>> selectProcessLotNodes(@Param("prdLotId") int prdLotId);
    
    // 최하위 자재 / 설비 LOT 조회
    List<Map<String, Object>> selectMaterialAndEquipmentNodes(@Param("prcLotId") int prcLotId);

}
