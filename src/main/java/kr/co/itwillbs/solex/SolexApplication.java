package kr.co.itwillbs.solex;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.mybatis.spring.annotation.MapperScan;

@SpringBootApplication
@MapperScan("kr.co.itwillbs.solex.Hr")
public class SolexApplication {

	public static void main(String[] args) {
		SpringApplication.run(SolexApplication.class, args);
	}

}
