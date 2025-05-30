package kr.co.itwillbs.solex.Test;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class TestDBConnectService {

    @Autowired
    private ClientMapper clientMapper;
    
    public List<Client> getAllClients() {
        return clientMapper.selectAllClients();
    }

	
	
}
