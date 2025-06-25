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

	public void materialOrderRegist(Map<String, Object> matordMap) {
		// TODO Auto-generated method stub
		materialOrdersMapper.materialOrderRegist(matordMap);
	}

	//자재 등록에서 자재 id 가져오는 코드
	public List<Map<String, Object>> getMatId() {
		// TODO Auto-generated method stub
		return materialOrdersMapper.getMatId();
	}

	public List<Map<String, Object>> getMaterialOrderList(int offset, int size) {
		List<Map<String, Object>> list = materialOrdersMapper.getMaterialOrderList(offset, size);
		System.out.println("list = " + list);
		return list;
	}

}
