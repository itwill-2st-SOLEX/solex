package kr.co.itwillbs.solex.workOrder;

import java.util.List;
import java.util.Map;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface WorkOrderMapper {
	
	// 작업지시 조회
	List<Map<String, Object>> getWorkList(@Param("offset") int offset, @Param("size") int size);
	// 작업지시 모달 공정팀 들고오기
	List<Map<String, Object>> ProcessTeam(String prdCd);

}
