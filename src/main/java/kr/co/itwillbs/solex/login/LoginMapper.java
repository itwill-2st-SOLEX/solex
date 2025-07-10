package kr.co.itwillbs.solex.login;

import java.util.Map;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface LoginMapper {
	// 사번에 맞는 암호화 비번 들고오기 
	Map<String, Object> findByEmpNum(String empNum);

}
