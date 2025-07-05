package kr.co.itwillbs.solex.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    // application.properties 또는 yml 파일에 설정한 파일 업로드 경로를 주입받습니다.
    @Value("${file.upload-dir}") // 예: C:/dev/uploads/
    private String uploadDir;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        /*
         * "/uploads/**" URL 요청이 오면
         * "file:///C:/dev/uploads/" 디렉토리에서 파일을 찾아 제공하라는 의미입니다.
         *
         * 중요: 외부 경로를 설정할 때는 "file:///" 접두사를 꼭 붙여야 합니다.
         */
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations("file:///" + uploadDir);
    }
}
