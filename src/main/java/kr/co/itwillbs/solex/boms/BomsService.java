package kr.co.itwillbs.solex.boms;

import java.util.List;
import java.util.Map;

import org.apache.ibatis.annotations.Mapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class BomsService {
	
	@Autowired
	private BomsMapper bomsMapper;
	

	public List<Map<String, Object>> getBomsList() {
		return bomsMapper.selectBomsList();
	}


}
