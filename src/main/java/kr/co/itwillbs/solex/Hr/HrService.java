package kr.co.itwillbs.solex.Hr;

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
public class HrService {

	@Autowired
	private HrMapper mapper;
	
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
		System.out.println("!!!!!!!!!!!!!!!!!!! Mapper = " + empList);//보임
		return toEmpList(empList);
	}
	
	public List<Map<String, Object>> toEmpList(List<Map<String, Object>> empList) {
	    return empList.stream()
	            .map(map -> {
	                Map<String, Object> newMap = new HashMap<>();
	                newMap.put("empNum", map.get("empNum"));  // 기존 키 값 확인
	                newMap.put("empPhone", map.get("empPhone"));
	                newMap.put("depPosition", map.get("depPosition"));
	                newMap.put("empNm", map.get("empNm"));
	                newMap.put("empSts", map.get("empSts"));
	                newMap.put("depId", map.get("depId"));
	                newMap.put("empHire", map.get("empHire"));
	                return newMap;
	            })
	            .collect(Collectors.toList());
	}

}
