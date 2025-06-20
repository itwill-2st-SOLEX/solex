package kr.co.itwillbs.solex.security;


//import org.springframework.boot.autoconfigure.security.servlet.PathRequest;
//import org.springframework.context.annotation.Bean;
//import org.springframework.context.annotation.Configuration;
//import org.springframework.security.config.annotation.web.builders.HttpSecurity;
//import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
//import org.springframework.security.config.annotation.web.configuration.WebSecurityCustomizer;
//import org.springframework.security.web.SecurityFilterChain;


//@Configuration
//@EnableWebSecurity
//public class WebSecurityConfig {
	/*
	 * [ 스프링 시큐리티가 정적 리소스(/static 경로 내의 리소스들)에 대해 보안 필터를 적용하지 않도록 설정하기 ]
	 * @Bean으로 등록된 메서드 중에서 반환 타입이 WebSecurityCustomizer인 빈을 자동으로 찾아서 Spring Security의 전역 설정에 적용
	 * WebSecurityCustomizer는 Spring Security 5.7 이후 도입된 새로운 방식으로,
	 * Spring Security 필터 체인에 아예 등록하지 않을 요청을 지정할 수 있게 해준다!
	 * 즉, 여기서 지정한 경로들은 Spring Security의 보안 필터 자체가 동작하지 않음
	 */
//	@Bean
//	public WebSecurityCustomizer ignoreStaticResources() { // 메서드 이름 무관하나 의미가 통하는 이름 지정, 리턴타입이 WebSecurityCustomizer여야함
		// "/static/xxx" 경로들(정적 리소스 경로)은 시큐리티 적용 대상에서 제외
//		return (web) -> web.ignoring() // web 객체에 대한 보안 필터 무시
//				.requestMatchers(PathRequest.toStaticResources().atCommonLocations()); // 일반적인 정적 리소스 경로 지정(css, js, images, error 등)
//	}
	// 시큐리티 필터 설정
	// => 메서드 이름은 무관
	// => 반드시 리턴타입이 SecurityFilterChain 타입이어야함
	// => 메서드 파라미터로 HttpSecurity 타입 지정(자동 주입)
//	@Bean
//	public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
//		System.out.println("✅ 보안 필터 적용됨!");
//		return http
				// ----------------- 요청에 대한 접근 허용 여부 등의 권한 설정 -----------------
//				.authorizeHttpRequests(authorizeHttpRequests -> authorizeHttpRequests
//						.requestMatchers("/auth/login").permitAll() // 프로젝트 루트 경로는 누구나 접근 가능하도록 지정
//						.requestMatchers("/items/list2").permitAll() // 프로젝트 루트 경로는 누구나 접근 가능하도록 지정
						//----------------------------------------------------------------------------------------
						// 상위 경로가 복수개의 경로를 묶음으로 처리
//						.requestMatchers("/static/**").permitAll()
//						.requestMatchers("/static/**").authenticated() // 인증된 사용자만 접근 허용
//						.anyRequest().authenticated() // 그 외의 모든 경로는 인증된 사용자만 접근 가능하도록 지정
//				--------------------로그인 처리
//				).formLogin(formLogin -> formLogin
//						.loginPage("")
//						.loginProcessingUrl("") //로그인 폼에서 제추된 데이터 처리하는 요청 주소(자동으로 POST방식 처리)
//						=>이때, 이 경로는 기본적으로 컨트롤러에서 별도의 처리 불필요
//						단, 로그인 처리 과정에서 부가적인 기능 추가 시에는 컨트롤러 매핑 추가!
//						.permitAll()
//				).build();
				
//	}

//}





















