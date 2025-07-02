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
	public Map<String, Object> getEmpData(String empNum) {
		// TODO Auto-generated method stub
		return mypageMapper.getEmpData(empNum);
	}


	//마이페이지 수정 
	public void personalDataModify(Map<String, Object> personalModifyMap) {
		mypageMapper.personalDataModify(personalModifyMap);
		
	}

}