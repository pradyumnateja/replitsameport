package com.flywire.exercise.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import javax.servlet.http.HttpSessionListener;
import org.springframework.boot.web.servlet.ServletListenerRegistrationBean;

@Configuration
public class SessionConfig implements WebMvcConfigurer {
    
    @Bean
    public ServletListenerRegistrationBean<HttpSessionListener> sessionListener() {
        return new ServletListenerRegistrationBean<>(new HttpSessionListener() {
            @Override
            public void sessionCreated(javax.servlet.http.HttpSessionEvent se) {
                se.getSession().setMaxInactiveInterval(1); // Set session to expire immediately
            }

            @Override
            public void sessionDestroyed(javax.servlet.http.HttpSessionEvent se) {
                // Do nothing
            }
        });
    }
}
