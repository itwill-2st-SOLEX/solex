package kr.co.itwillbs.solex.equipment;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class EquipmentService {

    @Autowired
    private EquipmentMapper equipmentMapper;
	
	public List<Map<String, Object>> getPagedGridDataAsMap(int page, int pageSize) {
		int offset = page * pageSize;
        List<Map<String, Object>> resultList = equipmentMapper.selectPagedEquipmentDataAsMap(offset, pageSize);
		return resultList;
	}

	public Map<String, Object> getFormData() {
        List<Map<String, Object>> processList = equipmentMapper.getProcessList();
        List<Map<String, Object>> clientList = equipmentMapper.getClientList();
		
        Map<String, Object> formData = new HashMap<>();
        formData.put("processList", processList);
        formData.put("clientList", clientList);
		return formData;
	}

    // 설비 생성
    @Transactional(rollbackFor = Exception.class) 
	public void createEquipment(Map<String, Object> params) {
        
        // 설비 생성    
        Integer result = equipmentMapper.createEquipment(params);
        // null 체크 추가
        if (result == null || result <= 0) {
            throw new RuntimeException("설비 생성에 실패했습니다.");
        }
		
	}


    public List<Map<String, Object>> getEquipmentDetail(String eqp_code) {
        List<Map<String,Object>> resultList = equipmentMapper.getEquipmentDetail(eqp_code);
        return resultList;
    }

    public void updateEquipment(Map<String, Object> params) {
        // 설비 생성    
        Integer result = equipmentMapper.updateEquipment(params);
        // null 체크 추가
        if (result == null || result <= 0) {
            throw new RuntimeException("설비 생성에 실패했습니다.");
        }
    }

}