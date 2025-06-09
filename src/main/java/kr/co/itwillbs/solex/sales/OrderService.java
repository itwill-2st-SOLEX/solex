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

//    public List<Map<String,Object>> selectClients(Map<String, Object> params) {
//    	log.info(params);
//        if (!params.containsKey("limit")) {
//            params.put("limit", 30); // 기본값 설정
//        }
//        if (!params.containsKey("offset")) {
//            params.put("offset", 0); // 기본값 설정
//        }
//        return clientMapper.selectClients(params);
//    }


    // 페이징된 그리드 데이터를 Map 형태로 가져오는 메서드
    public List<Map<String, Object>> getPagedGridDataAsMap(int page, int pageSize, String searchKeyword) { // 파라미터 변경
        int offset = page * pageSize;
        List<Map<String, Object>> resultList = orderMapper.selectPagedOrderDataAsMap(offset, pageSize, searchKeyword);

        // Map의 각 항목을 순회하며 날짜 필드 포맷팅
        // 메서드 내에서 생성 (스레드 세이프)
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
		log.info("count : "+ count);
		
		// 1) 검색어가 없는 경우
        if (searchKeyword == null) {
            if (count < 1) {
                log.info("▶ searchKeyword=null && count<1 → 메퍼1 호출");
                // 예: 최초 로드용 매퍼
                return orderMapper.getInitialClientListByEmployee(emp_id);
            } else {
                log.info("▶ searchKeyword=null && count>=1 → 메퍼2 호출");
                // 예: 직원별 기본 리스트용 매퍼
                return orderMapper.getClientListByEmployee(emp_id);
            }
        }

        // 2) 검색어가 있는 경우
        log.info("▶ searchKeyword='{}' → 검색 매퍼 호출", searchKeyword);
        return orderMapper.getSearchClientList(offset, pageSize, searchKeyword);
	}
    
    

	
}
