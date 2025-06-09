package kr.co.itwillbs.solex.Emp;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;
import jakarta.websocket.server.ServerEndpoint;
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
	public List<Map<String, Object>> getEmpList(String searchType, String searchKeyword) {
		Map<String, Object> param = new HashMap<>();
	    param.put("searchType", searchType);
	    param.put("searchKeyword", "%" + searchKeyword + "%"); // LIKE 검색용
		return mapper.selectEmp(searchType, searchKeyword);
	}
	
	//인사목록 (퇴사자 포함)
	public List<Map<String, Object>> getEmpAllList(String searchType, String searchKeyword) {
		// TODO Auto-generated method stub
		return mapper.selectAllEmp(searchType, searchKeyword);
	}

	public int modifyEmp(Map<String, Object> empMap) {
		// TODO Auto-generated method stub
		return 0;
	}

	//ajax를 통해 json으로 목록을 리턴 
	public List<Map<String, Object>> getEmpListFromMapper() {
		List<Map<String, Object>> empList = mapper.findAllItems();
		List<Map<String, Object>> empCodeList = mapper.findAllCodeDetails();
		 for (Map<String, Object> emp : empList) {
		        for (Map<String, Object> codeMap : empCodeList) { // codeMap으로 변수명 변경
		            for (Map.Entry<String, Object> entry : codeMap.entrySet()) {
		                String key = entry.getKey();
		                Object value = entry.getValue(); // Object 타입으로 받아서 유연하게 처리

		                // 만약 특정 value가 Character로 들어온다면 String으로 변환
		                if (value instanceof Character) {
		                    emp.put(key, String.valueOf(value)); // Character를 String으로 변환하여 put
		                } else if (value != null) { // null이 아니라면 그대로 put (공백 제거는 나중에 필요시)
		                    emp.put(key, value.toString().trim()); // 혹시 모를 공백 제거도 여기서
		                } else {
		                    emp.put(key, null); // null 값은 그대로 null로
		                }
		            }
		        }
		    }
	    return empList;
	}
	
//	public List<Map<String, Object>> toEmpList(List<Map<String, Object>> empList) {
//	    return empList.stream()
//	            .map(map -> {
//	                Map<String, Object> newMap = new HashMap<>();
//	                newMap.put("empNum", map.get("empNum"));  // 기존 키 값 확인
//	                newMap.put("empPhone", map.get("empPhone"));
//	                newMap.put("empNm", map.get("empNm"));
//	                newMap.put("empSts", map.get("empSts"));
//	                newMap.put("empHire", map.get("empHire"));
//	                return newMap;
//	            })
//	            .collect(Collectors.toList());
//	}

	public List<Map<String, Object>> getEmpCodeListFromMapper() {
	    List<Map<String, Object>> empCodeList = mapper.findAllCodeDetails();
//	    System.out.println("Mapper = " + empCodeList);
	    return empCodeList; 
	}

	public List<Map<String, Object>> getDepCode() {
		return mapper.getDepCode();
	}

//	public List<Map<String, Object>> getEmpAppointment() {
//		// TODO Auto-generated method stub
//		return mapper.;
//	}

//	PUBLIC LIST<MAP<STRING, OBJECT>> GETPOSCODE() {
//		// TODO AUTO-GENERATED METHOD STUB
//		RETURN MAPPER.GETPOSCODE();
//	}


}
