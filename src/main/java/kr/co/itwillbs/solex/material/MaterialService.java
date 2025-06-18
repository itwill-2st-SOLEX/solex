package kr.co.itwillbs.solex.material;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.apache.ibatis.annotations.Mapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
@Service
public class MaterialService {

	@Autowired
	private MaterialMapper mapper;
	
	//자재 목록
	public List<Map<String, Object>> getMaterial() {
		
		return mapper.getMaterial();
	}
	
	//자재 무한스크롤
	public List<Map<String, Object>> getMaterialList(int offset, int size) {
		// TODO Auto-generated method stub
		return mapper.getMaterialList(offset, size);
	}

	
	//자재등록 - 공통코드 가져오기 
	public List<Map<String, Object>> getCommonCodes() {
		System.out.println("service @@@@@@@@@@@@@@@@@ " + mapper.getCommonCodes());
		return mapper.getCommonCodes();
	}
	
	//자재등록 - 공통코드 세부사항 가져오기 
	public List<Map<String, Object>> getCommonCodeListJson() {
		List<Map<String, Object>> commonCodes = mapper.getCommonCodeDetails();
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

}
