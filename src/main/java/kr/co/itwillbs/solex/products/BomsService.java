package kr.co.itwillbs.solex.products;

import java.util.ArrayList;
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

    @Transactional
	public void saveOrUpdateSingleBom(Map<String, Object> bomData) {
    	String optId = String.valueOf(bomData.get("OPT_ID"));
        String matId = String.valueOf(bomData.get("MAT_ID"));

        // PRD_ID를 OPT_ID로부터 조회 (새로운 삽입 시 필요)
        String prdId = bomsMapper.getPrdIdByOptId(optId);
        bomData.put("PRD_ID", prdId); // bomData에 PRD_ID 추가

        // 존재하는 BOM 조회
        Map<String, Object> existingBom = bomsMapper.getBomByOptIdAndMatId(optId, matId);

        if (existingBom != null) {
            // 이미 존재하는 항목이므로 업데이트
            bomData.put("BOM_ID", existingBom.get("BOM_ID")); // 기존 BOM_ID 사용
            List<Map<String, Object>> updateList = new ArrayList<>();
            updateList.add(bomData);
            bomsMapper.updateBomInfo(updateList); // 기존 일괄 업데이트 메서드 재사용
        } else {
            // 새로운 항목이므로 삽입
            bomData.remove("BOM_ID"); // BOM_ID는 DB에서 자동 생성
            List<Map<String, Object>> insertList = new ArrayList<>();
            insertList.add(bomData);
            bomsMapper.insertBomInfo(insertList); // 기존 일괄 삽입 메서드 재사용
        }
		
	}


}
