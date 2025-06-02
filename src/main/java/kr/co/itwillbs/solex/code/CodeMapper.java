package kr.co.itwillbs.solex.code;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface CodeMapper {

	// 공통코드 리스트 조회
	List<CodeDTO> getCodeList();

	// 공통코드 신규 행 추가
	void insertCodes(List<CodeDTO> insertList);

	// 공통코드 기존 행 수정
	void updateCodes(List<CodeDTO> updateList);

}
