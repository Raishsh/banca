package br.com.sampaiollo.pzsmp.config;

import br.com.sampaiollo.pzsmp.config.filter.SecurityFilter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import java.util.Arrays;
import static org.springframework.security.config.Customizer.withDefaults;

@Configuration
@EnableWebSecurity
public class SecurityConfig {
    
    @Autowired
    private SecurityFilter securityFilter;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        return http
                .csrf(csrf -> csrf.disable())
                .cors(withDefaults()) 
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(authorize -> authorize
                        // Endpoints públicos
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/auth/login").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/clientes").permitAll()
                        .requestMatchers(HttpMethod.GET, "/product-images/**").permitAll()
                        
                        // Permissões para utilizadores autenticados
                        .requestMatchers(HttpMethod.GET, "/api/pedidos").authenticated()
                        .requestMatchers(HttpMethod.GET, "/api/mesas").authenticated()
                        .requestMatchers(HttpMethod.PUT, "/api/pedidos/**").authenticated()
                        
                        // --- CORREÇÃO AQUI: Trocado de hasRole para hasAuthority ---
                        // ADMIN (Gestão de Produtos)
                        .requestMatchers(HttpMethod.POST, "/api/produtos").hasAuthority("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/produtos/**").hasAuthority("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/produtos/**").hasAuthority("ADMIN")
                        
                        // ADMIN (Gestão de Funcionários)
                        .requestMatchers(HttpMethod.POST, "/api/funcionarios").hasAuthority("ADMIN")
                        .requestMatchers(HttpMethod.GET, "/api/funcionarios").hasAuthority("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/funcionarios/**").hasAuthority("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/funcionarios/**").hasAuthority("ADMIN")
                        
                        // ADMIN (Outros)
                        .requestMatchers(HttpMethod.PUT, "/api/clientes/**").hasAuthority("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/clientes/**").hasAuthority("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/pedidos/fechar-caixa").hasAuthority("ADMIN")
                        .requestMatchers(HttpMethod.POST, "/api/caixa/sangria").hasAuthority("ADMIN")
                        .requestMatchers(HttpMethod.GET, "/api/caixa/sangrias").hasAuthority("ADMIN")
                        .requestMatchers(HttpMethod.GET, "/api/relatorios", "/api/relatorios/**").hasAuthority("ADMIN")
                        
                        // Qualquer outra requisição precisa de autenticação
                        .anyRequest().authenticated() 
                )
                .addFilterBefore(securityFilter, UsernamePasswordAuthenticationFilter.class)
                .build();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authenticationConfiguration) throws Exception {
        return authenticationConfiguration.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        // Ajuste para permitir a origem do Angular corretamente
        configuration.setAllowedOrigins(Arrays.asList("http://localhost:4200"));
        configuration.setAllowedMethods(Arrays.asList("GET","POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type", "x-requested-with"));
        configuration.setAllowCredentials(true);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}