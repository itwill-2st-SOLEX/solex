package kr.co.itwillbs.solex.login;

import java.util.Map;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface LoginMapper {

	Map<String, Object> findByEmpNum(String empNum);

}
