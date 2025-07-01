package kr.co.itwillbs.solex.equipment_history;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class EquipmentHistoryService {
	@Autowired
	private EquipmentHistoryMapper equipmentHistoryMapper;

	//무한스크롤 함수 
	public List<Map<String, Object>> getEquipmentHistory(int offset, int size) {
		// TODO Auto-generated method stub
		return equipmentHistoryMapper.equipmentHistoryMapper(offset, size);
	}
	
	//설비수리이력 목록 조회
	public List<Map<String, Object>> equipmenthistoryList() {
		System.out.println("SERVICE에서 " + equipmentHistoryMapper.equipmenthistoryList());
		return equipmentHistoryMapper.equipmenthistoryList();
	}
}
