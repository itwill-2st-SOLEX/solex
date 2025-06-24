 package kr.co.itwillbs.solex.security;

import java.util.Map;

import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.security.core.userdetails.User;
import kr.co.itwillbs.solex.login.LoginMapper;


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

        String empNumFromDb = (String) userMap.get("EMP_NUM");
        String password = (String) userMap.get("EMP_PW");
        String role = (String) userMap.get("EMP_POS_CD");

        // DB에 role이 없으므로 하드코딩: 기본 USER 권한 부여
        return User.builder()
                .username(empNumFromDb)
                .password(password)
                .roles(convertToRole(role))
                .build();
    }
    
    private String convertToRole(String empPosCd) {
        return switch (empPosCd) {
            case "POS_01" -> "1";
            case "POS_02" -> "2";
            case "POS_03" -> "3";
            case "POS_04" -> "4";
            case "POS_05" -> "5";
            default -> "";
        };
    }
}