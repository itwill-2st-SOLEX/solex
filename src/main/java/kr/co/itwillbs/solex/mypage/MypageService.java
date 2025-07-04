package kr.co.itwillbs.solex.mypage;

import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class MypageService {

	@Autowired
	private MypageMapper mypageMapper;
	
	
	// 로그인 된 정보의 마이페이지 가져오기 
	public Map<String, Object> getEmpData(String empId) {
		
		Map<String, Object> empData = mypageMapper.getEmpData(empId);
		System.out.println("empData = " + empData);
		
		Object empImgObject = empData.get("EMP_IMG"); // DB 컬럼명이 EMP_IMG라고 가정
        String imageName = (String) empImgObject;
		System.out.println("imageName = " + imageName);
        
        // 4. 웹에서 접근 가능한 전체 이미지 URL을 생성합니다. (예: /SOLEX/images/uuid.jpg)
        String imageUrl = "/SOLEX/images/" + imageName;
        System.out.println("imageUrl = " + imageUrl);
        
        empData.put("empProfileImg", imageUrl);
   
		return empData;
	}


	//마이페이지 수정 
	public void personalDataModify(Map<String, Object> personalModifyMap) {
		mypageMapper.personalDataModify(personalModifyMap);
		
	}

}