package kr.co.itwillbs.solex.workOrder;

import java.util.List;
import java.util.Map;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface WorkOrderMapper {
	
	// 작업지시 조회
	List<Map<String, Object>> getWorkList(@Param("offset") int offset, @Param("size") int size);
	// 해당 제품코드 등록 모달 조회
	List<Map<String, Object>> ProcessTeam(String prdCd);
	// 작업지시 등록
	void workOrderInsert(Map<String, Object> prdInfo);
	void workProcessInsert(Map<String, Object> prdInfo);
	// 주문테이블 상태값 업테이트
	void updateSujuOrderSts(String prdCd);

}
