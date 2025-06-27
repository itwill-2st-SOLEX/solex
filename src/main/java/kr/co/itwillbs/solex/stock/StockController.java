package kr.co.itwillbs.solex.stock;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

import lombok.RequiredArgsConstructor;

@Controller
@RequestMapping("/stock")
public class StockController {
	
	// 결재할 기안서 리스트 페이지
    @GetMapping("/todo")
    public String getTodoStockList() {    	
        return "stock/stockDrafts";
    }

}
