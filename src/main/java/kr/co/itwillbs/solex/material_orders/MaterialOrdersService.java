package kr.co.itwillbs.solex.material_orders;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.apache.ibatis.annotations.Mapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.RequestBody;

import kr.co.itwillbs.solex.area.AreaMapper;
import kr.co.itwillbs.solex.lot.LotService;
@Service
public class MaterialOrdersService {

	@Autowired
	private MaterialOrdersMapper materialOrdersMapper;
	
	@Autowired
	private AreaMapper areaMapper;
	
	@Autowired
	private LotService lotService;
	
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
		return materialOrdersMapper.getMatId();
	}

	// 창고 select box 가져오는 코드 
	public List<Map<String, Object>> getWarehouse(Integer matId) {
		return materialOrdersMapper.getWarehouse(matId);
	}
	
	// 창고구역 select box 가져오는 코드 
	public List<Map<String, Object>> getArea(Integer whsId, Integer matId) {
		// TODO Auto-generated method stub
		return materialOrdersMapper.getArea(whsId ,matId);
	}
	
	public List<Map<String, Object>> getMaterialOrderList(int offset, int size) {
		List<Map<String, Object>> list = materialOrdersMapper.getMaterialOrderList(offset, size);
		return list;
	}
	
	// 승인버튼 누르면 insert
	@Transactional
	public void materialApprove(Map<String, Object> map) {
		
		String areId = (String) map.get("are_id");
		Long areDetId = areaMapper.getDetIdByAreaId(areId);
		map.put("are_det_id", areDetId);
		
		
		int warehistory = materialOrdersMapper.matAppWareHis(map);

	    int areaDetail = materialOrdersMapper.matAppAreaDetail(map);

	    int area = materialOrdersMapper.matAppArea(map);

	    int stockLeger = materialOrdersMapper.matAppStockLeger(map);

	    materialOrdersMapper.updateApproval(map);

	    // 자재LOT생성
	    lotService.createMaterialLot(map);
		
	    // 2. DB 처리 또는 로직 실행
	    if (warehistory != 1 || areaDetail != 1 || area != 1 || stockLeger != 1) {
	        throw new IllegalStateException("승인 처리 실패: warehistory=" + warehistory + ", areaDetail=" + areaDetail + ", area=" + area  + ", stockLeger=" + stockLeger );
	    }
	}
	
	// 반려버튼 누르면 insert
	public void updateDeny(Map<String, Object> map) {
	    materialOrdersMapper.updateDeny(map);
	}


	

}
