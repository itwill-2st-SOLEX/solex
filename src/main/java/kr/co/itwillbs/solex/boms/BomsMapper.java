package kr.co.itwillbs.solex.boms;

import java.util.List;
import java.util.Map;

import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface BomsMapper {

	List<Map<String, Object>> selectBomsList();


}
