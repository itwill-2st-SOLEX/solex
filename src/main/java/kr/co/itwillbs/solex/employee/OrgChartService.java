package kr.co.itwillbs.solex.employee;

import java.util.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class OrgChartService {

    @Autowired
    private EmployeeMapper employeeMapper;

    public Map<String, Object> getOrgChartTree() {
        // 🔹 1. DB에서 조직도 데이터 조회 (Map 리스트 형태)
        List<Map<String, Object>> orgList = employeeMapper.selectOrgChartData();

        // 🔹 2. 각 계층을 담을 자료구조 선언
        Map<String, Object> ceo = null; // 사장
        Map<String, Map<String, Object>> directors = new LinkedHashMap<>(); // 이사
        Map<String, List<Map<String, Object>>> departments = new LinkedHashMap<>(); // 부장
        Map<String, List<Map<String, Object>>> teams = new LinkedHashMap<>(); // 팀장

        // 🔹 3. 직원 목록을 돌며 계층별 분류
        for (Map<String, Object> emp : orgList) {
            String pos = emp.get("EMP_POS") != null ? emp.get("EMP_POS").toString().trim() : null;
            String empNum = emp.get("EMP_NUM") != null ? emp.get("EMP_NUM").toString().trim() : null;
            String managerNum = emp.get("MEG_NUM") != null ? emp.get("MEG_NUM").toString().trim() : null;

            switch (pos) {
                case "사장":
                    ceo = emp;
                    break;
                case "이사":
                    directors.put(empNum, emp);
                    break;
                case "부장":
                    departments.computeIfAbsent(managerNum, k -> new ArrayList<>()).add(emp);
                    break;
                case "팀장":
                    teams.computeIfAbsent(managerNum, k -> new ArrayList<>()).add(emp);
                    break;
            }
        }

        // 🔹 4. CEO 노드 구성
        Map<String, Object> root = new HashMap<>();
        root.put("text", Map.of(
            "title", "CEO",
            "name", ceo != null ? ceo.get("EMP_NM") : "미정"
        ));
        root.put("HTMLclass", "ceo");

        // 🔹 5. 이사 → 부장 → 팀장 순으로 트리 구성
        List<Object> directorNodes = new ArrayList<>();
        for (Map.Entry<String, Map<String, Object>> dirEntry : directors.entrySet()) {
            Map<String, Object> dirEmp = dirEntry.getValue();
            String dirNum = dirEntry.getKey(); // 이사 empNum
            String cat = dirEmp.get("EMP_CAT").toString().trim();
            String empCat = dirEmp.get("EMP_CAT") != null ? dirEmp.get("EMP_CAT").toString().trim().toUpperCase() + "이사" : "";

            Map<String, Object> dirNode = new HashMap<>();
            dirNode.put("text", Map.of(
                "title", empCat, // 소속
                "name", dirEmp.get("EMP_NM")  // 이름
            ));
            
            // 🔹 이사 역할에 따른 클래스 지정
            if ("ERP".equalsIgnoreCase(cat)) {
                dirNode.put("HTMLclass", "erpDirector");
            } else if ("MES".equalsIgnoreCase(cat)) {
                dirNode.put("HTMLclass", "mesDirector");
            }

            // 🔸 이사 아래 부장들 구성
            List<Object> depNodes = new ArrayList<>();
            List<Map<String, Object>> depList = departments.get(dirNum);

            if (depList != null) {
                for (Map<String, Object> dep : depList) {
                    String depNum = dep.get("EMP_NUM") != null ? dep.get("EMP_NUM").toString().trim() : null;
                    String depCat = dep.get("EMP_CAT").toString().trim();
                    
                    Map<String, Object> depNode = new HashMap<>();
                    depNode.put("text", Map.of(
                        "title", dep.get("EMP_DEP"),
                        "name", dep.get("EMP_NM")
                    ));
                    
                 	// 🔹 부서장 역할에 따른 클래스 지정
                    if ("ERP".equalsIgnoreCase(depCat)) {
                        depNode.put("HTMLclass", "erpManager");
                    } else if ("MES".equalsIgnoreCase(depCat)) {
                        depNode.put("HTMLclass", "mesManager");
                    }
                    
                    depNode.put("stackChildren", true); // 팀장이 옆으로 정렬되도록 설정

                    // 🔹 부장 아래 팀장들 구성
                    List<Object> teamNodes = new ArrayList<>();
                    List<Map<String, Object>> teamList = teams.get(depNum);

                    if (teamList != null) {
                        for (Map<String, Object> team : teamList) {
                            teamNodes.add(Map.of("text", Map.of(
                                "name", team.get("EMP_TEAM"),
                                "title", team.get("EMP_NM")
                            )));
                        }
                    }

                    depNode.put("children", teamNodes);
                    depNodes.add(depNode);
                }
            }

            dirNode.put("children", depNodes);
            directorNodes.add(dirNode);
        }

        root.put("children", directorNodes);
        return root;
    }
}
