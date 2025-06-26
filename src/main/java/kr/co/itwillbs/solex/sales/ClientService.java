package kr.co.itwillbs.solex.sales;

import java.net.URI;
import java.util.Collections;
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



@Service
public class ClientService {

    @Autowired
    private ClientMapper clientMapper;

//    @Value("${business.api.url}")
    private String apiUrl;

//    @Value("${business.api.secret}")
    private String serviceKey;
    
    public List<Map<String, Object>> getClientNameList() {
		// TODO Auto-generated method stub
		return clientMapper.getClientNameList();
	}


    public List<Map<String,Object>> selectClients(Map<String, Object> params) {
        if (!params.containsKey("limit")) {
            params.put("limit", 30); // 기본값 설정
        }
        if (!params.containsKey("offset")) {
            params.put("offset", 0); // 기본값 설정
        }
        return clientMapper.selectClients(params);
    }

    @Transactional  //
    public int createClient(Map<String, Object> param) {
		return clientMapper.createClients(param);
	}

    public Map<String, Object> queryBizNumber(String bsnsLcns) {
        Map<String, Object> result = new HashMap<>();

        try {
            // serviceKey가 이미 인코딩되어 있으므로, UriComponentsBuilder를 사용하여 URL 구성
            // build(true)를 사용하면 이미 인코딩된 문자열을 다시 인코딩하지 않습니다.
            URI uri = UriComponentsBuilder.fromUriString(apiUrl)
                    .queryParam("serviceKey", serviceKey)
                    .build(true)
                    .toUri();

            // 요청 헤더 설정
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setAccept(Collections.singletonList(MediaType.APPLICATION_JSON));
            headers.set("User-Agent", "Mozilla/5.0");

            // 요청 바디 설정
            Map<String, Object> requestBody = Map.of("b_no", List.of(bsnsLcns));

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

            // RestTemplate 인스턴스 생성 및 요청 실행
            RestTemplate restTemplate = new RestTemplate();
            // URL 문자열 대신 URI 객체를 직접 전달합니다.
            ResponseEntity<Map> response = restTemplate.exchange(uri, HttpMethod.POST, entity, Map.class);

            result = response.getBody();

        } catch (HttpClientErrorException e) {
        } catch (Exception e) {
        }

        return result;
    }
    // 상세조회
    public Map<String, Object> getClientById(int clientId) {
        return clientMapper.getClientById(clientId);
    }

    // 거래처 update
	public int updateClient(Map<String, Object> param) {
		return clientMapper.updateClient(param);
	}

	// 검색된 거래처 목록
	public List<Map<String, Object>> getSearchClients(Map<String, Object> keyword) {
		return clientMapper.getSearchClients(keyword);
	}


}
