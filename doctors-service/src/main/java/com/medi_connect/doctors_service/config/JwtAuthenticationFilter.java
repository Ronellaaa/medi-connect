package com.medi_connect.doctors_service.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getServletPath();
        boolean isGet = "GET".equalsIgnoreCase(request.getMethod());
        boolean isOptions = "OPTIONS".equalsIgnoreCase(request.getMethod());

        return isOptions
                || ("/api/doctors".equals(path) && isGet)
                || path.startsWith("/api/doctors/by-email")
                || (path.startsWith("/api/doctors/") && isGet)
                || (path.equals("/api/availability") && isGet)
                || (path.startsWith("/api/availability/") && isGet);
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        final String authHeader = request.getHeader("Authorization");
        System.out.println("AUTH HEADER: " + authHeader);

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        final String jwt = authHeader.substring(7);
        final String email;
        final String role;

        try {
            email = jwtService.extractUsername(jwt);
            role = jwtService.extractRole(jwt);
        } catch (Exception exception) {
            filterChain.doFilter(request, response);
            return;
        }

        System.out.println("EMAIL FROM TOKEN: " + email);
        System.out.println("ROLE FROM TOKEN: " + role);
        System.out.println("TOKEN VALID: " + jwtService.isTokenValid(jwt));

        if (email != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            if (jwtService.isTokenValid(jwt)) {
                UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                        email,
                        null,
                        role == null ? List.of() : List.of(new SimpleGrantedAuthority("ROLE_" + role))
                );
                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authToken);
                System.out.println("Authentication set successfully");
            }
        }

        filterChain.doFilter(request, response);
    }

}
