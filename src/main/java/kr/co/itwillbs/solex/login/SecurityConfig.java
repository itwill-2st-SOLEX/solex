package kr.co.itwillbs.solex.login;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {
    
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
    
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())               // CSRF 비활성화
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/login","/auth/login", "/css/**", "/js/**", "/assets/**").permitAll()
                .anyRequest().authenticated()           // 로그인 필수
            )
            .formLogin(form -> form
                .loginPage("/auth/login")
                .loginProcessingUrl("/login")
                .failureUrl("/auth/login?error=true")
                .usernameParameter("emp_num")
                .passwordParameter("emp_pw")
                .successHandler((request, response, authentication) -> {
                    String empId = authentication.getName();
                    request.getSession().setAttribute("empId", empId);
                    System.out.println("empId" + empId);

                    response.sendRedirect("/SOLEX");
                })
                .permitAll()
            )
            .logout(logout -> logout
                    .logoutUrl("/logout")  
                    .logoutSuccessUrl("/auth/login")
                    .invalidateHttpSession(true)        // 세션 무효화
                    .deleteCookies("JSESSIONID")        // 쿠키 삭제
            )
            .httpBasic(basic -> basic.disable());       // HTTP Basic 인증 비활성화

        return http.build();
    }
}