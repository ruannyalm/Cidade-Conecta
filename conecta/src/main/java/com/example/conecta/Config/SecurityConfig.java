package com.example.conecta.Config;

import com.example.conecta.Security.JwtAuthenticationFilter;
import com.example.conecta.Security.JwtService;
import com.example.conecta.Service.TokenRevogacaoService;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpStatus;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.HttpStatusEntryPoint;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfigurationSource;

@Configuration
@EnableMethodSecurity
public class SecurityConfig {

    @Bean
public SecurityFilterChain securityFilterChain(
        HttpSecurity http,
        JwtService jwtService,
        TokenRevogacaoService tokenRevogacaoService,
        CorsConfigurationSource corsConfigurationSource) throws Exception {

    return http
            .csrf(AbstractHttpConfigurer::disable)

            .cors(cors -> cors.configurationSource(corsConfigurationSource))

            .sessionManagement(session ->
                    session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

            .exceptionHandling(exceptions ->
                    exceptions.authenticationEntryPoint(
                            new HttpStatusEntryPoint(HttpStatus.UNAUTHORIZED)))

            .authorizeHttpRequests(authorize -> authorize
                    .requestMatchers(
                            "/auth/cadastro",
                            "/auth/login"
                    ).permitAll()

                    .requestMatchers(
                            org.springframework.http.HttpMethod.GET,
                            "/api/ocorrencias/*/midias/*"
                    ).permitAll()

                    .requestMatchers(
                            org.springframework.http.HttpMethod.OPTIONS,
                            "/**"
                    ).permitAll()

                    .requestMatchers("/auth/logout").authenticated()

                    .anyRequest().authenticated()
            )

            .addFilterBefore(
                    new JwtAuthenticationFilter(
                            jwtService,
                            tokenRevogacaoService
                    ),
                    UsernamePasswordAuthenticationFilter.class
            )

            .build();
}

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}