package kr.co.itwillbs.solex.employee;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class OrgChartService {
	
	@Autowired
	private EmployeeMapper employeeMapper;
	
	public Map<String, Object> buildOrgChart() {
        List<Map<String, Object>> empList = employeeMapper.selectOrgChartData();
        
        // ID 기반으로 빠르게 찾기 위한 맵 구성
        Map<String, Map<String, Object>> nodeMap = new HashMap<>();
        for (Map<String, Object> emp : empList) {
        	
        	String empNum = emp.get("EMP_NUM") != null ? emp.get("EMP_NUM").toString().trim() : "";
        	String name = (String) emp.get("EMP_NM") != null ? emp.get("EMP_NM").toString().trim() : "";
            String pos = emp.get("EMP_POS") != null ? emp.get("EMP_POS").toString().trim() : "";

            Map<String, Object> node = new HashMap<>();
            node.put("text", Map.of(
                    "name", name,
                    "title", pos
            ));

            // HTMLclass 동적 분기
            node.put("HTMLclass", getCssClass(emp));

            node.put("children", new ArrayList<>());
            nodeMap.put(empNum, node);
        }

        // 최상위 노드 찾기 + 트리 구성
        Map<String, Object> root = null;
        for (Map<String, Object> emp : empList) {
        	
        	String empNum = emp.get("EMP_NUM") != null ? emp.get("EMP_NUM").toString().trim() : "";
            String megNum = emp.get("MEG_NUM") != null ? emp.get("MEG_NUM").toString().trim() : "";
            
            if (megNum == null || megNum.isEmpty()) {
                root = nodeMap.get(empNum); // 사장
            } else {
                Map<String, Object> parentNode = nodeMap.get(megNum);
                if (parentNode != null) {
                    ((List<Object>) parentNode.get("children")).add(nodeMap.get(empNum));
                }
            }
            
        }
        if (root == null) {
        	throw new IllegalStateException("루트 노드가 없습니다. EMP 데이터 확인 필요.");
        }

        Map<String, Object> chartConfig = Map.of(
            "chart", Map.of(
                "container", "#orgCard",
                "levelSeparation", 30,
                "siblingSeparation", 12,
                "subTeeSeparation", 12,
                "nodeAlign", "BOTTOM",
                "connectors", Map.of(
                    "type", "step",
                    "style", Map.of("stroke-width", 2, "stroke", "#ccc")
                ),
                "node", Map.of("HTMLclass", "node-style")
            ),
            "nodeStructure", root
        );

        return chartConfig;
    }
	
	private String getCssClass(Map<String, Object> emp) {
		
        String pos = emp.get("EMP_POS_CD") != null ? emp.get("EMP_POS_CD").toString().trim() : "";
        String cat = emp.get("EMP_CAT") != null ? emp.get("EMP_CAT").toString().trim() : "";
        
        System.out.println("pos : " + pos + ", cat : " + cat);
		
        if ("pos_01".equals(pos)) return "ceo";
        if ("pos_02".equals(pos)) return "erpDirector";
        if ("pos_03".equals(pos)) return cat.equals("erp") ? "erpManager" : "mesManager";
        if ("pos_04".equals(pos)) return "teamManager";

        return "node-style";
    }

}
