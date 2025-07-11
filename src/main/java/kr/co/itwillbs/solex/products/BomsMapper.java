package kr.co.itwillbs.solex.products;

import java.util.List;
import java.util.Map;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface BomsMapper {
	List<Map<String, Object>> selectBomList(
					@Param("opt_id") String opt_id, 
					@Param("offset") int offset,
					@Param("limit") int limit);

	int selectTotalBomCount(String opt_id);

	void insertBomInfo(List<Map<String, Object>> insertList);

	void updateBomInfo(List<Map<String, Object>> updateList);

	// 원자재 리스트 가져옴.
	List<Map<String, Object>> selectMaterialList();

	int deleteBom(@Param("bomIds") List<Integer> bomIds);

	String getPrdIdByOptId(String optId);

	Map<String, Object> getBomByOptIdAndMatId(String optId, String matId);
	

}
