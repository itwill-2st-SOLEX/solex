package kr.co.itwillbs.solex.login;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class LoginService {
	@Autowired
	LoginMapper mapper;

//	public Map<String, String> findByEmpNum(Map<String, String> empInfo) {
//		return mapper.findByEmpNum(empInfo);
//	}
	
//	@Override
//	public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
//		
//		return null;
//	}
}
