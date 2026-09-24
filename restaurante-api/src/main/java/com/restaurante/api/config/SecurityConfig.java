package com.restaurante.api.config;

import java.util.List;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.annotation.web.configurers.HeadersConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import com.restaurante.api.security.JwtAuthenticationFilter;

@Configuration(proxyBeanMethods = false)
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authenticationConfiguration) throws Exception {
        return authenticationConfiguration.getAuthenticationManager();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOriginPatterns(List.of("*"));
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(AbstractHttpConfigurer::disable)
            .headers(headers -> headers.frameOptions(HeadersConfigurer.FrameOptionsConfig::disable))
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                // Preflight HTTP OPTIONS
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                // Endpoints Públicos de Consulta (Menú Digital para Clientes)
                .requestMatchers(HttpMethod.GET, "/api/v1/productos/**", "/api/v1/categorias/**").permitAll()

                // Endpoints Públicos de Autenticación y Documentación
                .requestMatchers(
                    "/api/v1/auth/**",
                    "/swagger-ui/**",
                    "/swagger-ui.html",
                    "/v3/api-docs/**",
                    "/h2-console/**"
                ).permitAll()

                // Endpoints de Consulta de Insumos y Recetas (Lectura para Operaciones y Menú)
                .requestMatchers(HttpMethod.GET,
                    "/api/v1/ingredientes/**",
                    "/api/v1/ingredientes-and-productos/**",
                    "/api/v1/ingredientes-productos/**",
                    "/api/v1/unidades-de-medida/**",
                    "/api/v1/unidades-medida/**"
                ).hasAnyRole("ADMINISTRADOR", "CAJERO", "MESERO", "COCINERO")

                // Endpoints Exclusivos de Administrador (Personal, Roles, Proveedores, Modificaciones de Inventario y Reportes)
                .requestMatchers(
                    "/api/v1/usuarios/**",
                    "/api/v1/empleados/**",
                    "/api/v1/roles/**",
                    "/api/v1/proveedores/**",
                    "/api/v1/reportes/**",
                    "/api/v1/gastos/**",
                    "/api/v1/ingredientes/**",
                    "/api/v1/ingredientes-and-productos/**",
                    "/api/v1/ingredientes-productos/**",
                    "/api/v1/unidades-de-medida/**",
                    "/api/v1/unidades-medida/**",
                    "/api/v1/movimientos-del-inventario/**",
                    "/api/v1/movimientos-inventario/**",
                    "/api/v1/tipos-movimiento/**",
                    "/api/v1/tipo-de-movimientos/**"
                ).hasRole("ADMINISTRADOR")

                // Endpoints Operativos (Permitidos para ADMINISTRADOR y CAJERO)
                .requestMatchers(
                    "/api/v1/pedidos/**",
                    "/api/v1/detalles-pedidos/**",
                    "/api/v1/detalle-del-pedido/**",
                    "/api/v1/pagos/**",
                    "/api/v1/mesas/**",
                    "/api/v1/clientes/**",
                    "/api/v1/productos/**",
                    "/api/v1/categorias/**",
                    "/api/v1/promociones/**",
                    "/api/v1/tipos-pago/**",
                    "/api/v1/tipo-de-pagos/**",
                    "/api/v1/tipos-pedidos/**",
                    "/api/v1/tipo-de-pedidos/**",
                    "/api/v1/estados-pedidos/**",
                    "/api/v1/estado-del-pedido/**",
                    "/api/v1/estados-productos/**",
                    "/api/v1/estado-del-producto/**"
                ).hasAnyRole("ADMINISTRADOR", "CAJERO", "MESERO", "COCINERO")

                .anyRequest().authenticated()
            );

        http.addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
