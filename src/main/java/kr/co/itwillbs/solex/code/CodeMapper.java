package kr.co.itwillbs.solex.code;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface CodeMapper {

	List<CodeDTO> getCodeList();

}
