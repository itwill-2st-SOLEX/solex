package kr.co.itwillbs.solex.sales;

import java.net.URI;
import java.text.SimpleDateFormat;
import java.util.Collections;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import lombok.extern.log4j.Log4j2;



@Log4j2
@Service
public class OrderService {

    @Autowired
    private OrderMapper orderMapper;

    // 페이징된 그리드 데이터를 Map 형태로 가져오는 메서드
    public List<Map<String, Object>> getPagedGridDataAsMap(int page, int pageSize, String searchKeyword) { // 파라미터 변경
        int offset = page * pageSize;
        List<Map<String, Object>> resultList = orderMapper.selectPagedOrderDataAsMap(offset, pageSize, searchKeyword);

        // Map의 각 항목을 순회하며 날짜 필드 포맷팅
        // 메서드 내에서 생성
        SimpleDateFormat dateFormatter = new SimpleDateFormat("yyyy-MM-dd"); 

        for (Map<String, Object> row : resultList) {
            Object dateObj = row.get("ORD_REG_DATE");
            if (dateObj instanceof Date) { 
                row.put("ORD_REG_DATE", dateFormatter.format((Date) dateObj));
            } else if (dateObj instanceof String) { 
                try {
                } catch (Exception e) {
                    System.err.println("날짜 문자열 파싱 오류: " + dateObj);
                }
            }
        }
        return resultList;
    }

	public List<Map<String, Object>> getSearchClientList(int page, int pageSize, String searchKeyword,int emp_id) {
		int offset = page * pageSize;
		
		int count = orderMapper.countClientsByEmployeeId(emp_id);
		
		// 1) 검색어가 없는 경우
        if (searchKeyword == null) {
            if (count < 1) {
                // 예: 검색어가 없는경우 + 사원이 거래처 등록을 한적이 없는 경우. 
            	log.info("▶ 검색어가 없는경우 + 사원이 거래처 등록을 한적이 없는 경우. ");
                return orderMapper.getSelectTop5PopularClients();
            } else {
                // 예: 검색어가 없고 + 사원이 거래처 등록을 한번이라도 한 경우
            	log.info("▶ 검색어가 없고 + 사원이 거래처 등록을 한번이라도 한 경우");
                return orderMapper.getSelectClientsByEmployeeId(emp_id);
            }
        }

        // 2) 검색어가 있는 경우
        log.info("▶ searchKeyword='{}' → 검색 매퍼 호출", searchKeyword);
        return orderMapper.getSearchClientList(offset, pageSize, searchKeyword);
	}

	public List<Map<String, Object>> getSearchProductList(int page, int pageSize, String searchKeyword) {
		int offset = page * pageSize;
		
		
		if(searchKeyword == null) {
			return orderMapper.getSelectTop5PopularProducts();
		}
		
		
		return orderMapper.getSearchProductList(offset, pageSize, searchKeyword);
	}

	public int getStockCount(String productCode) {
		return orderMapper.getStockCount(productCode);
	}

	
	
	
	@Transactional
	public int createOrderProcess(Map<String, Object> orderData) {
	    // 1. 주문 마스터 테이블에 INSERT
	    orderMapper.createSujuOrder(orderData); // 이 호출로 orderData에 ord_id가 채워짐

	    // 2. 필요한 자재 재고 확인
	    boolean isStockSufficient = orderMapper.checkMaterialStock(orderData);

	    if (isStockSufficient) {
	        // 2-1. 재고가 충분할 경우
	        orderData.put("ord_sts", "ord_sts_02"); // 상태값을 '02'로 설정
	        orderMapper.createSujuOrderDetail(orderData); // 주문 상세 등록

	        // 필요하다면, 예약된 재고를 차감하는 로직을 호출
	        orderMapper.deductStock(orderData);

	    } else {
	        // 2-2. 재고가 부족할 경우
	        orderData.put("ord_sts", "ord_sts_01"); // 상태값을 '01'로 설정
	        orderMapper.createSujuOrderDetail(orderData); // 주문 상세 등록

	        // ★★★ 핵심: 부족한 자재에 대한 발주 요청을 추가로 INSERT ★★★
	        List<Map<String, Object>> lackingMaterials = orderMapper.getLackingMaterials(orderData);
	        for (Map<String, Object> material : lackingMaterials) {
	            orderMapper.createPurchaseRequest(material);
	        }
	    }
	    
	    return 1;
	}

	
    
    

	
}
