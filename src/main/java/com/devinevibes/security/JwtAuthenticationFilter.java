package com.devinevibes.security;

import com.devinevibes.entity.user.User;
import com.devinevibes.repository.user.UserRepository;
import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Slf4j
@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserRepository userRepository;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String header = request.getHeader(HttpHeaders.AUTHORIZATION);
        if (header == null || !header.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        String token = header.substring(7);
        try {
            if (!jwtService.isValidToken(token, "access")) {
                filterChain.doFilter(request, response);
                return;
            }
            Claims claims = jwtService.parseClaims(token);
            Long userId = Long.valueOf(claims.getSubject());
            User user = userRepository.findById(userId).orElse(null);
            if (user != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                AppUserPrincipal principal = new AppUserPrincipal(user.getId(), user.getEmail(), user.getRole().name());
                UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(principal, null, principal.getAuthorities());
                auth.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(auth);
            }
        } catch (Exception e) {
            log.debug("JWT parse failed: {}", e.getMessage());
        }

        filterChain.doFilter(request, response);
    }
}
