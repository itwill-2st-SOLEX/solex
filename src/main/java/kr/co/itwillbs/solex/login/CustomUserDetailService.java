 package kr.co.itwillbs.solex.login;

import java.util.Map;

import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.security.core.userdetails.User;


@Service
public class CustomUserDetailService implements UserDetailsService {

    private final LoginMapper loginMapper;
    private final PasswordEncoder passwordEncoder;

    public CustomUserDetailService(LoginMapper loginMapper, PasswordEncoder passwordEncoder) {
        this.loginMapper = loginMapper;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public UserDetails loadUserByUsername(String empNum) throws UsernameNotFoundException {
        Map<String, Object> userMap = loginMapper.findByEmpNum(empNum);
        
        if (userMap == null) {
            throw new UsernameNotFoundException("사용자를 찾을 수 없습니다: " + empNum);
        }
        
        String empId = String.valueOf(userMap.get("EMP_ID"));
        String password = (String) userMap.get("EMP_PW");
        String role = (String) userMap.get("EMP_POS_CD");
        

        return User.builder()
                .username(empId)
                .password(password)
                .roles(convertToRole(role))
                .build();
    }
    
    private String convertToRole(String empPosCd) {
        return switch (empPosCd) {
            case "pos_01" -> "1";
            case "pos_02" -> "2";
            case "pos_03" -> "3";
            case "pos_04" -> "4";
            case "pos_05" -> "5";
            default -> "";
        };
    }
}