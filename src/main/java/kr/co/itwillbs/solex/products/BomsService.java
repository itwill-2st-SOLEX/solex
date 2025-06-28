package kr.co.itwillbs.solex.products;

import java.util.List;
import java.util.Map;

import org.apache.ibatis.annotations.Mapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class BomsService {
	
	@Autowired
	private BomsMapper bomsMapper;
	

	public List<Map<String, Object>> getBomList(String opt_id, int offset, int limit) {
		return bomsMapper.selectBomList(opt_id, offset, limit);
	}


	public int getTotalBomCount(String opt_id) {
		return bomsMapper.selectTotalBomCount(opt_id);
	}


	// BOM 추가
	public void insertBomInfo(List<Map<String, Object>> insertList) {
		bomsMapper.insertBomInfo(insertList);
	}

	// BOM 수정
	public void updateBomInfo(List<Map<String, Object>> updateList) {
		bomsMapper.updateBomInfo(updateList);
	}


	public List<Map<String, Object>> getMaterialList() {
		return bomsMapper.selectMaterialList();
	}


	// ⭐ BOM 삭제 메서드 ⭐
    @Transactional // 트랜잭션 처리 (삭제 중 오류 발생 시 롤백)
    public int deleteBom(List<Integer> bomIds) {
        // Mapper의 deleteBom 메서드 호출
        return bomsMapper.deleteBom(bomIds);
    }


}
