package com.devinevibes.security;

import com.devinevibes.dto.auth.AuthResponse;
import com.devinevibes.entity.user.User;
import com.devinevibes.service.auth.AuthService;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.MediaType;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
public class OAuth2SuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final AuthService authService;
    private final JwtUtils jwtUtils;
    private final ObjectMapper objectMapper;

    public OAuth2SuccessHandler(AuthService authService, JwtUtils jwtUtils, ObjectMapper objectMapper) {
        this.authService = authService;
        this.jwtUtils = jwtUtils;
        this.objectMapper = objectMapper;
    }

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication) throws IOException {
        OAuth2AuthenticationToken token = (OAuth2AuthenticationToken) authentication;
        String email = token.getPrincipal().getAttribute("email");
        String name = token.getPrincipal().getAttribute("name");
        String picture = token.getPrincipal().getAttribute("picture");

        User user = authService.processGoogleUser(email, name, picture);
        var auth = AuthResponse.of(
                jwtUtils.generateAccessToken(user.getEmail(), user.getRole().name()),
                jwtUtils.generateRefreshToken(user.getEmail())
        );

        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.getWriter().write(objectMapper.writeValueAsString(auth));
    }
}
