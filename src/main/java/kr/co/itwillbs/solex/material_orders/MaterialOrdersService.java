package kr.co.itwillbs.solex.material_orders;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.apache.ibatis.annotations.Mapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
@Service
public class MaterialOrdersService {

	@Autowired
	private MaterialOrdersMapper materialOrdersMapper;
	
	//자재발주 목록
	public List<Map<String, Object>> getMaterialOrders() {
		// TODO Auto-generated method stub
		return materialOrdersMapper.getMaterialOrders();
	}

}
