package kr.co.itwillbs.solex.operator;

import java.util.List;
import java.util.Map;

import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface OperatorMapper {
	
	//로그인한 사람에 해당하는 공정 정보 가져오기
	Map<String, Object> operatorSummary(Long empId);
	
}
