package kr.co.itwillbs.solex.Test;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

import lombok.extern.log4j.Log4j2;


@Log4j2
@Controller
@RequestMapping("/Test")
public class TestDBConnectController {

	@Autowired
	TestDBConnectService testDBConnectService;
	
	@GetMapping("/all")
    public List<Client> getAllClients() {
		
		List<Client> ClientList = testDBConnectService.getAllClients();
		log.info("?????????????????????????????????????"+ClientList);   
		
        return ClientList;
    }
	
}
