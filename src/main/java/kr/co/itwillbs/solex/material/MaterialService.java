package kr.co.itwillbs.solex.material;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.apache.ibatis.annotations.Mapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
@Service
public class MaterialService {

	@Autowired
	private MaterialMapper materialMapper;
	
	//자재 목록
	public List<Map<String, Object>> getMaterial() {
		
		return materialMapper.getMaterial();
	}
	
	//자재 무한스크롤
	public List<Map<String, Object>> getMaterialList(int offset, int size) {
		// TODO Auto-generated method stub
		List<Map<String, Object>> list = materialMapper.getMaterialList(offset, size);
		return list;
	}
	
	//자재등록 - 공통코드 세부사항 가져오기 
	public List<Map<String, Object>> getCommonCodeListJson() {
		List<Map<String, Object>> commonCodes = materialMapper.getCommonCodeDetails();
		List<Map<String, Object>> resultList = new ArrayList<>();
		
		for(Map<String, Object> codeMap : commonCodes) {
			Map<String, Object> formattedMap = new HashMap<>();
			
			//matUnit
			if(codeMap.get("matUnit") !=null) {
				formattedMap.put("matUnit", codeMap.get("matUnit").toString().trim());
			}
			
			if(codeMap.get("matIsActive") !=null) {
				formattedMap.put("matIsActive", codeMap.get("matIsActive").toString().trim());
			}
		       // 빈 맵이 아닌 경우에만 추가 (예: {"empCatCd": "cat_01"})
            if (!formattedMap.isEmpty()) {
                resultList.add(formattedMap);
            }
		}
		System.out.println("가공 후 최종 resultList: " + resultList);
		return resultList;
	}
	
	public List<Map<String, Object>> getMatUnits() {
		 return materialMapper.getMatUnits();
	}

	//자재 등록 
	public int registerMat(Map<String, Object> matMap) {
		System.out.println("service mat map = " + matMap);
		return materialMapper.registMat(matMap);
	}

	
	//toast ui grid 수정 (=자재 수정) 
	public void updateGridCell(Map<String, Object> payload) {
		materialMapper.updateGridCell(payload);
	}

}
