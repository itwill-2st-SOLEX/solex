package kr.co.itwillbs.solex.code;

import java.util.List;

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

	// 공통코드 신규 행 추가
	public void insertCodes(List<CodeDTO> insertList) {
        codeMapper.insertCodes(insertList);
    }

	// 공통코드 기존 행 수정
	public void updateCodes(List<CodeDTO> updateList) {
        codeMapper.updateCodes(updateList);
    }

}
