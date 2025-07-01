package kr.co.itwillbs.solex.equipment_history;

import java.util.List;
import java.util.Map;

import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface EquipmentHistoryMapper {

	List<Map<String, Object>> equipmentHistoryMapper(int offset, int size);

}
