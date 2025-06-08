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

	// 공통코드 무한스크롤
	public List<Map<String, Object>> getPagedCodeList(@Param("offset") int offset,
										  @Param("perPage") int perPage,
										  @Param("sort") String sort,
										  @Param("dir") String dir,
										  @Param("codYn") String codYn,
										  @Param("keyword") String keyword) {
	    return codeMapper.selectPagedCodeList(offset, perPage, sort, dir, codYn, keyword);
	}
	public int getTotalCount(String codYn) {
	    return codeMapper.selectTotalCount(codYn);
	}

	// 공통코드 신규 행 추가
	public void insertCodes(List<Map<String, Object>> insertList) {
		codeMapper.insertCodes(insertList);
    }

	// 공통코드 기존 행 수정
	public void updateCodes(List<Map<String, Object>> updateList) {
        codeMapper.updateCodes(updateList);
    }
	
	// 상세공통코드 무한스크롤
	public List<Map<String, Object>> getPagedDetailCodeList(String codId, int offset, int limit, String sortColumn, String sortDirection, String keyword) {
	    return codeMapper.selectPagedDetailCodeList(codId, offset, limit, sortColumn, sortDirection, keyword);
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
