package kr.co.itwillbs.solex.quality;

import java.util.List;
import java.util.Map;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface QualityMapper {

	List<Map<String, Object>> getQualityList(@Param("offset") int offset, @Param("size") int size);

}