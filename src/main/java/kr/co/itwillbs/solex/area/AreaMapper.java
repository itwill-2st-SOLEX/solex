package kr.co.itwillbs.solex.area;

import java.util.Map;

import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface AreaMapper {

	void insertArea(Map<String, Object> area);

	void getWarehouseAreaHistory(Long areaId);

}
