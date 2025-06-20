package kr.co.itwillbs.solex.material;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class MaterialService {
	
	@Autowired
	private MaterialMapper materialMapper;

	public List<Map<String, Object>> getMeterialNameList() {
		// TODO Auto-generated method stub
		return materialMapper.getMeterialNameList();
	}

}
