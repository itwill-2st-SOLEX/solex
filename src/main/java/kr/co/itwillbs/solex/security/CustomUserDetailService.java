 package kr.co.itwillbs.solex.security;

//import org.springframework.security.core.userdetails.UserDetails;
//import org.springframework.security.core.userdetails.UserDetailsService;
//import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;


//@Service
//@RequiredArgsConstructor
//@Log4j2
//public class CustomUserDetailService implements UserDetailsService {

	// 스프링 시큐리티에서 인증 처리를 수행하는 클래스
	// =>UserDetailsService 인터페이스: 스프링 시큐리티 인증 시 사용자 정보르 ㄹ불러오는 핵심 인터페이스 
	// UserDetailsService인터페이스를 구현한 클래스는 사용자 정보르 ㄹDB로부터 직접 조회가능
	// ------------------------------------------------------------------------------------------------
	// 사용자 관련 조회를 수행하기 위해 주입
	// private final MemberRepository repository;
//	@Override
	// => 파라미처로 전달 받는 문자열은 실제 조회에 사용할 유니크한 정보여애 한다!
	// => 따라서, 파라미터 변수명은 다른 이름으로 변경 가능
//	public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
//		log.info(">>>>>>>>>>>>>>>>>>>>> 사용자 조회 시작 - loadUserByUsername()");
		// 엔티티를 실제로 조회해야함 
		// email을 사용해서 엔티티 조회
		// Member mem = repository.findByEmail(email)
		//		.orElseThrow(() -> new UsernameNotFoundException(email +" : 사용자 조회 실패"));
		
//		return null;
//	}

//}
