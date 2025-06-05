package kr.co.itwillbs.solex.code;

import java.util.List;
import java.util.Map;

import org.apache.ibatis.annotations.Param;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class CodeService {
	
	@Autowired
	private CodeMapper codeMapper;

	// 공통코드 리스트 조회
	public List<CodeDTO> getCodeList() {
		List<CodeDTO> codeList = codeMapper.getCodeList();
		return codeList;
	}
	
	// 공통코드 무한스크롤
	public List<CodeDTO> getPagedCodeList(@Param("offset") int offset,
										  @Param("perPage") int perPage,
										  @Param("sort") String sort,
										  @Param("dir") String dir,
										  @Param("codYn") String codYn) {
	    return codeMapper.selectPagedCodeList(offset, perPage, sort, dir, codYn);
	}
	public int getTotalCount(String codYn) {
	    return codeMapper.selectTotalCount(codYn);
	}

	// 공통코드 신규 행 추가
	public void insertCodes(List<CodeDTO> insertList) {
        codeMapper.insertCodes(insertList);
    }

	// 공통코드 기존 행 수정
	public void updateCodes(List<CodeDTO> updateList) {
        codeMapper.updateCodes(updateList);
    }
	
	// 상세공통코드 무한스크롤
	public List<Map<String, Object>> getPagedDetailCodeList(String codId, int offset, int limit, String sortColumn, String sortDirection) {
	    return codeMapper.selectPagedDetailCodeList(codId, offset, limit, sortColumn, sortDirection);
	}
	public int getTotalDetailCodeCount(String codId) {
	    return codeMapper.selectDetailCodeTotalCount(codId);
	}

	// 상세공통코드 신규 행 추가
	public void insertDetailCodes(List<Map<String, Object>> insertList) {
		codeMapper.insertDetailCodes(insertList);
	}

	// 상세공통코드 기존 행 수정
	public void updateDetailCodes(List<Map<String, Object>> updateList) {
		codeMapper.updateDetailCodes(updateList);
	}

}
