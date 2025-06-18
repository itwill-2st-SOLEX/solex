package kr.co.itwillbs.solex.emp;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import lombok.extern.log4j.Log4j2;

@Log4j2
@Service
public class EmpService {

	@Autowired
	private EmpMapper mapper;

	//인사등록
	public int registerEmp(Map<String, Object> empMap) {
		return mapper.insertEmp(empMap);
	}

	//인사목록 (재직중)
	 public List<Map<String, Object>> getEmpList(String includeEmpSts) {

	        List<Map<String, Object>> empList = mapper.getEmpListFiltered(includeEmpSts);

	        return empList;
	    }


	  public List<Map<String, Object>> getAllCommonCodesForJson() {

	        List<Map<String, Object>> allCodes = mapper.getAllCodeDetails();

	        List<Map<String, Object>> resultList = new ArrayList<>();
	        for (Map<String, Object> codeMap : allCodes) {
	            Map<String, Object> formattedMap = new HashMap<>();

	            // empCatCd
	            if (codeMap.get("empCatCd") != null) {
	                formattedMap.put("empCatCd", codeMap.get("empCatCd").toString().trim());
	            }
	            // empPosCd
	            if (codeMap.get("empPosCd") != null) {
	                formattedMap.put("empPosCd", codeMap.get("empPosCd").toString().trim());
	            }
	            // empDepCd
	            if (codeMap.get("empDepCd") != null) {
	                formattedMap.put("empDepCd", codeMap.get("empDepCd").toString().trim());
	            }
	            // empTeamCd
	            if (codeMap.get("empTeamCd") != null) {
	                formattedMap.put("empTeamCd", codeMap.get("empTeamCd").toString().trim());
	            }
	            // empStsCd
	            if (codeMap.get("empStsCd") != null) {
	                formattedMap.put("empStsCd", codeMap.get("empStsCd").toString().trim());
	            }
	            // 빈 맵이 아닌 경우에만 추가 (예: {"empCatCd": "cat_01"})
	            if (!formattedMap.isEmpty()) {
	                resultList.add(formattedMap);
	            }
	        }
	        System.out.println("가공 후 최종 resultList: " + resultList);
	        return resultList;
	    }

	public List<Map<String, Object>> getEmpCodeListFromMapper() {
	    List<Map<String, Object>> empCodeList = mapper.getAllCodeDetails();
	    return empCodeList;
	}

	public List<Map<String, Object>> getempList(int offset, int size) {
		return mapper.getempList(offset, size);
	}

	//인사 등록에서 공통코드 가져오기 위한
	public List<Map<String, Object>> getAllcodes() {
		// TODO Auto-generated method stub
		return mapper.getAllcodes();
	}


	//수정 모달창 가져오기 위한
	public Map<String, Object> getEmpDetail(String empNum) {
//		System.out.println("service empNum = " + empNum); // ok
//		System.out.println("service result = " + mapper.getEmpDetail(empNum)); // null이였던 이유 = sql의 char 공백때문에

		return mapper.getEmpDetail(empNum);
	}
	
	// 수정된 사원 정보를 저장
	public int modifyMap(HashMap<String, Object> empModifyMap) {
		System.out.println("service map = " + mapper.modifyMap(empModifyMap));
		return mapper.modifyMap(empModifyMap);
	}


}
