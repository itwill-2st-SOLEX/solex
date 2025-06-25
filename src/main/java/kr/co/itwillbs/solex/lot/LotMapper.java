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
	
	// 
    List<Map<String, Object>> selectProcessLotNodes(int prdLotId);
    
    // 
    List<Map<String, Object>> selectMaterialAndEquipmentNodes(int prcLotId);

}
