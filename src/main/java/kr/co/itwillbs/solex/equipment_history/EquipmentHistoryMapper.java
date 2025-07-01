package kr.co.itwillbs.solex.equipment_history;

import java.util.List;
import java.util.Map;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface EquipmentHistoryMapper {

	List<Map<String, Object>> equipmentHistoryMapper(int offset, int size);

	//설비수리이력 목록 조회
	List<Map<String, Object>> equipmenthistoryList();

}
