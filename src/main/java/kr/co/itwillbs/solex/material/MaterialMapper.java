package kr.co.itwillbs.solex.material;

import java.util.List;
import java.util.Map;

import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface MaterialMapper {
	
	// 자재리스트
	List<Map<String, Object>> getMeterialNameList();

}
