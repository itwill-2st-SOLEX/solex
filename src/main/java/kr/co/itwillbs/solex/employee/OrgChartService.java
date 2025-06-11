package kr.co.itwillbs.solex.employee;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class OrgChartService {
	
	@Autowired
	private EmployeeMapper employeeMapper;
	
	public Map<String, Object> getOrgChartTree() {
        // 🔹 1. 전체 직원 목록 조회
        List<Map<String, Object>> orgList = employeeMapper.selectOrgChartData();

        // 🔹 2. 직급별로 저장할 구조 선언
        Map<String, Object> ceo = null;													// 사장
        Map<String, Map<String, Object>> directors = new LinkedHashMap<>();				// 이사들
        Map<String, List<Map<String, Object>>> departments = new LinkedHashMap<>();		// 부장들 (key: 상위자ID)
        Map<String, List<Map<String, Object>>> teams = new LinkedHashMap<>();			// 팀장들 (key: 상위자ID)

        // 🔹 3. 직원 목록을 돌며 계층별 분류
        for (Map<String, Object> emp : orgList) {
            String pos = emp.get("EMP_POS") != null ? emp.get("EMP_POS").toString().trim() : null;
            String empId = emp.get("EMP_ID") != null ? emp.get("EMP_ID").toString().trim() : null;
            String managerId = emp.get("MEG_NUM") != null ? emp.get("MEG_NUM").toString().trim() : null;

            switch (pos) {
                case "사장":
                    ceo = emp;
                    break;
                case "이사":
                    directors.put(empId, emp);
                    break;
                case "부장":
                    departments.computeIfAbsent(managerId, k -> new ArrayList<>()).add(emp);
                    break;
                case "팀장":
                    teams.computeIfAbsent(managerId, k -> new ArrayList<>()).add(emp);
                    break;
            }
        }

        // 🔹 4. 조직도 트리 root 노드 (CEO)
        Map<String, Object> root = new HashMap<>();
        root.put("text", Map.of(
            "name", "CEO",
            "title", ceo != null ? ceo.get("EMP_NM") : "알 수 없음"
        ));

        // 🔹 5. 이사 → 부장 → 팀장 순으로 트리 구성
        List<Object> directorNodes = new ArrayList<>();
        for (Map.Entry<String, Map<String, Object>> dirEntry : directors.entrySet()) {
            Map<String, Object> dirEmp = dirEntry.getValue();
            String dirId = dirEmp.get("EMP_ID") != null ? dirEmp.get("EMP_ID").toString().trim() : null;

            Map<String, Object> dirNode = new HashMap<>();
            dirNode.put("text", Map.of(
                "name", dirEmp.get("EMP_CAT"),
                "title", dirEmp.get("EMP_NM")
            ));
            System.out.println("departments keys : " + departments.keySet());
            System.out.println("이사 ID : " + dirEmp.get("EMP_ID").toString().trim());

            // ⬇ 부장 목록 생성
            List<Object> depNodes = new ArrayList<>();
            List<Map<String, Object>> depList = departments.get(dirEmp.get("EMP_NUM"));
            
            if (depList != null) {
                for (Map<String, Object> dep : depList) {
                    String depId = dep.get("EMP_ID") != null ? dep.get("EMP_ID").toString().trim() : null;
                    
                    System.out.println("depId : " + depId);

                    Map<String, Object> depNode = new HashMap<>();
                    depNode.put("text", Map.of(
                        "name", dep.get("EMP_DEP"),
                        "title", dep.get("EMP_NM")
                    ));
                    depNode.put("stackChildren", true); // 팀장이 옆으로 정렬되도록 설정

                    // ⬇ 팀장 목록 생성
                    List<Object> teamNodes = new ArrayList<>();
                    List<Map<String, Object>> teamList = teams.get(depId);
                    if (teamList != null) {
                        for (Map<String, Object> team : teamList) {
                            teamNodes.add(Map.of("text", Map.of(
                                "name", team.get("EMP_TEAM"),
                                "title", team.get("EMP_NM")
                            )));
                        }
                    }

                    // 팀장이 있으면 children에 추가
                    depNode.put("children", teamNodes);
                    depNodes.add(depNode);
                }
            }

            // 부장이 있으면 children에 추가
            dirNode.put("children", depNodes);
            directorNodes.add(dirNode);
        }

        // 🔹 6. root 노드에 이사 노드들 연결
        root.put("children", directorNodes);
        
        System.out.println("root : " + root);
        
        return root;
    }
}
