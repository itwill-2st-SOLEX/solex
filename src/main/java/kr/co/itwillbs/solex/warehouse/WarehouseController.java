package kr.co.itwillbs.solex.warehouse;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

import lombok.RequiredArgsConstructor;

@Controller
@RequiredArgsConstructor
@RequestMapping("/warehouse")
public class WarehouseController {
	
	@Autowired
	public WarehouseService warehouseService;
	
	// 결재할 기안서 리스트 페이지
    @GetMapping("/todo")
    public String getTodoDocumentList() {    	
        return "warehouse/warehouseDrafts";
    }

}
