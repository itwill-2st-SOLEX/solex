package kr.co.itwillbs.solex.login;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class LoginService {
	@Autowired
	LoginMapper mapper;

	public Map<String, String> loginEmp(String emp_num, String emp_pw) {
		return mapper.loginEmp(emp_num, emp_pw);
	}
	
//	@Override
//	public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
//		
//		return null;
//	}
}
