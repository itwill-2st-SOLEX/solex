package kr.co.itwillbs.solex.stock;

import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.RequestParam;

import kr.co.itwillbs.solex.area.AreaMapper;
import kr.co.itwillbs.solex.employee.EmployeeMapper;
import lombok.RequiredArgsConstructor;

@Service
public class StockService {
	
	@Autowired
	public EmployeeMapper employeeMapper;
	@Autowired 
	public AreaMapper areaMapper;
	
	public List<Map<String, Object>> getStockList(int offset, int size) {
		// TODO Auto-generated method stub
		return areaMapper.selectStockList(offset, size);
	}

	public List<Map<String, Object>> getStockDetail(String itemId, String type, Long loginEmpId) {
        return areaMapper.getStockDetail(Integer.parseInt(itemId), type);
	}

}
