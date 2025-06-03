package kr.co.itwillbs.solex.Hr;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;
import jakarta.websocket.server.ServerEndpoint;
import lombok.extern.log4j.Log4j2;

@Log4j2
@Service
public class HrService {

	@Autowired
	private HrMapper mapper;
	
	public int registerEmp(Map<String, String> empMap) {
		return mapper.insertEmp(empMap);
	}

	
	@PostConstruct
	public void check() {
	    System.out.println("!!!!!!!!!!!!!!!!mapper loaded: " + mapper);
	}
}
