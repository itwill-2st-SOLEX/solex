package kr.co.itwillbs.solex.products;

import java.util.List;
import java.util.Map;

import org.apache.ibatis.annotations.Mapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class BomsService {
	
	@Autowired
	private BomsMapper bomsMapper;
	

	public List<Map<String, Object>> getBomList(String opt_id, int offset, int limit) {
		return bomsMapper.selectBomList(opt_id, offset, limit);
	}


	public int getTotalBomCount(String opt_id) {
		return bomsMapper.selectTotalBomCount(opt_id);
	}


}
