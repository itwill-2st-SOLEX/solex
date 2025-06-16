package kr.co.itwillbs.solex;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.builder.SpringApplicationBuilder;
import org.springframework.boot.web.servlet.support.SpringBootServletInitializer;

@SpringBootApplication
public class SolexApplication extends SpringBootServletInitializer{

	public static void main(String[] args) {
		SpringApplication.run(SolexApplication.class, args);
	}
	
	// WAR 배포용 설정 메서드
    @Override
    protected SpringApplicationBuilder configure(SpringApplicationBuilder builder) {
        // DemoApplication을 애플리케이션 소스로 지정
        return builder.sources(SolexApplication.class);
    }

}
