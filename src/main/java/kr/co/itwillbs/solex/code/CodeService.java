package kr.co.itwillbs.solex.code;

import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class CodeService {
	
	@Autowired
	private CodeMapper codeMapper;

	public List<CodeDTO> getCodeList() {
		List<CodeDTO> codeList = new ArrayList<>();
		codeList = codeMapper.getCodeList();
		return codeList;
	}

}
