package kr.co.itwillbs.solex.workOrder;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class WorkOrderService {
	
	@Autowired
	WorkOrderMapper mapper;
}
