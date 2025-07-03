package kr.co.itwillbs.solex.mypage;

import java.util.HashMap;
import java.util.Map;

import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface MypageMapper {

	//개인 정보를 가져오기 위한
	Map<String, Object> getEmpData(String empId);

	//마이페이지 수정 
	void personalDataModify(Map<String, Object> personalModifyMap);

}