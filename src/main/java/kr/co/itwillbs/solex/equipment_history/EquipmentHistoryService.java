package kr.co.itwillbs.solex.equipment_history;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class EquipmentHistoryService {
	@Autowired
	private EquipmentHistoryMapper equipmentHistoryMapper;

	public List<Map<String, Object>> getEquipmentHistory(int offset, int size) {
		// TODO Auto-generated method stub
		return equipmentHistoryMapper.equipmentHistoryMapper(offset, size);
	}
}
