package kr.co.itwillbs.solex.equipmenthistory;

import java.util.List;
import java.util.Map;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface EquipmentHistoryMapper {

	List<Map<String, Object>> getEquipmentHistory(@Param("offset") int offset, @Param("size") int size);
}
