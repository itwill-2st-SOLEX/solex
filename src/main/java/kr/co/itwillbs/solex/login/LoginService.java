package kr.co.itwillbs.solex.login;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class LoginService {
	@Autowired
	LoginMapper mapper;

	public Map<String, String> loginEmp(Map<String, String> empInfo) {
		return mapper.loginEmp(empInfo);
	}
	
//	@Override
//	public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
//		
//		return null;
//	}
}
