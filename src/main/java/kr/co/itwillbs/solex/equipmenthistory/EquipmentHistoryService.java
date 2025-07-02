package kr.co.itwillbs.solex.equipmenthistory;

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
		List<Map<String, Object>> lm = equipmentHistoryMapper.getEquipmentHistory(offset, size);
		
		return lm;
	}

	public List<Map<String, Object>> getEquipmentHistoryDetail(String eqpId) {
		Long eqpIdLong = Long.valueOf(eqpId);
		return equipmentHistoryMapper.getEquipmentHistoryDetail(eqpIdLong);
	}
}
