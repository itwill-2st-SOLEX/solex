package kr.co.itwillbs.solex.emp;

import java.io.File;
import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import lombok.extern.log4j.Log4j2;

@Log4j2
@Service
public class EmpService {
	
	@Autowired
    private PasswordEncoder passwordEncoder;

	@Autowired
	private EmpMapper mapper;
	
	
	@Value("${file.upload-dir}")
	private String uploadDir;
	
	
	//인사등록
	public void registerEmployee(Map<String, Object> empMap, MultipartFile file) {
		
		String storedFileName = null; // DB에 저장할 파일 이름
		
		if (file == null || file.isEmpty()) {
			throw new RuntimeException("file 이 비어있음");
		}
        // 1. 원본 파일명 추출
        String originalFilename = file.getOriginalFilename();
        
        // 2. 고유한 파일명 생성 (UUID 사용)
        String uuid = UUID.randomUUID().toString();
        
        // 3. 확장자 추출
        String extension = originalFilename.substring(originalFilename.lastIndexOf("."));
        
        // 4. DB에 저장될 고유한 파일명
        storedFileName = uuid + extension;

        // 5. 파일을 서버에 저장
        File saveFile = new File(uploadDir, storedFileName);
        
        // 폴더 없으면 생성
        File uploadPath = new File(uploadDir);
        if (!uploadPath.exists()) {
            uploadPath.mkdirs(); 
        }
        
        System.out.println("------------originalFilename-----------");
        System.out.println(originalFilename);
        System.out.println("------------extension-----------");
        System.out.println(extension);
        System.out.println("------------storedFileName-----------");
        System.out.println(storedFileName);
        System.out.println("-----------------------");
        
        try {
            file.transferTo(saveFile);
        } catch (IOException e) {
            e.printStackTrace();
            throw new RuntimeException("파일 등록 실패");
	    }
		
		String cat  = (String) empMap.get("empCatCd");
        String dept = (String) empMap.get("empDepCd");
        String team = (String) empMap.get("empTeamCd");
        String pos = (String) empMap.get("empPosCd");
		
		Map<String, String> managerEmp = new HashMap<>();
        
		switch (pos) {
	        case "pos_05":
	        	managerEmp.put("empCatCd", cat);
	        	managerEmp.put("empDepCd", dept);
	        	managerEmp.put("empTeamCd", team);
	        	managerEmp.put("empPosCd", "pos_04");
	        	break;
	        	
	        case "pos_04":
	        	managerEmp.put("empCatCd", cat);
	        	managerEmp.put("empDepCd", dept);
	        	managerEmp.put("empTeamCd", "team_00");
	        	managerEmp.put("empPosCd", "pos_03");
	        	break;
	        	
	        case "pos_03":
	        	managerEmp.put("empCatCd", cat);
	        	managerEmp.put("empDepCd", "dep_00");
	        	managerEmp.put("empTeamCd", "team_00");
	        	managerEmp.put("empPosCd", "pos_02");
	        	break;
	        	
	        case "pos_02":
	        	managerEmp.put("empCatCd", "cat_00");
	        	managerEmp.put("empDepCd", "dep_00");
	        	managerEmp.put("empTeamCd", "team_00");
	        	managerEmp.put("empPosCd", "pos_01");
	        	break;
		}
		
		Long managerId = null;
        if (!"pos_01".equals(pos)) {
            managerId = mapper.findManagerId(managerEmp);
        }
		
        String encodedPassword = passwordEncoder.encode((String) empMap.get("emp_birth"));
		empMap.put("emp_pwd", encodedPassword);
		empMap.put("meg_num", managerId);
		empMap.put("emp_img", storedFileName); // 생성된 파일 이름을 emp_img 키로 추가
		
		System.out.println("+++++++++__________________________****************");
		System.out.println(empMap);
		
//		Long empNum = mapper.getEmpSabun();
//		empMap.put("emp_num", empNum);
		
		mapper.insertEmp(empMap);
	}


	//인사목록 (재직중)
	 public List<Map<String, Object>> getEmpList(String searchType, String searchKeyword, String includeEmpSts) {

//	        System.out.println("Service: getEmpList called with searchType=" + searchType +
//	                           ", searchKeyword=" + searchKeyword + ", includeEmpSts=" + includeEmpSts);

	        List<Map<String, Object>> empList = mapper.getEmpListFiltered(searchType, searchKeyword, includeEmpSts);

//	        System.out.println("Service: getEmpListFiltered returned " + (empList != null ? empList.size() : "null") + " items.");
	        return empList;
	    }

	 // ajax를 통해 json으로 공통 코드 목록을 리턴
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
	            // empStsCd (핵심!)
	            if (codeMap.get("empStsCd") != null) {
	                formattedMap.put("empStsCd", codeMap.get("empStsCd").toString().trim());
	            }
	            // 빈 맵이 아닌 경우에만 추가 (예: {"empCatCd": "cat_01"})
	            if (!formattedMap.isEmpty()) {
	                resultList.add(formattedMap);
	            }
	        }
	        System.out.println("가공 후 최종 resultList: " + resultList); // 추가: 이 로그도 꼭 확인!
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