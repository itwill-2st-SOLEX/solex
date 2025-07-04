package kr.co.itwillbs.solex.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    // application.properties 파일에 설정된 파일 업로드 경로를 가져옵니다.
    @Value("${file.upload-dir}")
    private String uploadDir;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // '/images/**' 형태의 URL 요청이 오면,
        // 'file:///실제업로드경로/' 에서 파일을 찾아 제공합니다.
        // 예를 들어, /images/abc.jpg 요청은 C:/uploads/emp/abc.jpg 파일을 찾아 보여줍니다.
        registry.addResourceHandler("/images/**")
                .addResourceLocations("file:" + uploadDir);
    }
}
