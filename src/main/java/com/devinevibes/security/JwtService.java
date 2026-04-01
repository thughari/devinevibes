package com.devinevibes.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.time.Instant;
import java.util.Date;
import java.util.Map;

@Service
public class JwtService {

    @Value("${app.jwt.secret}")
    private String jwtSecret;

    @Value("${app.jwt.access-expiration-minutes:30}")
    private long accessMinutes;

    @Value("${app.jwt.refresh-expiration-days:7}")
    private long refreshDays;

    public String generateAccessToken(String subject, Map<String, Object> claims) {
        return buildToken(subject, claims, Instant.now().plusSeconds(accessMinutes * 60), "access");
    }

    public String generateRefreshToken(String subject) {
        return buildToken(subject, Map.of(), Instant.now().plusSeconds(refreshDays * 24 * 3600), "refresh");
    }

    public Claims parseClaims(String token) {
        return Jwts.parser().verifyWith(getSigningKey()).build().parseSignedClaims(token).getPayload();
    }

    public boolean isValidToken(String token, String expectedType) {
        Claims claims = parseClaims(token);
        return expectedType.equals(claims.get("type", String.class)) && claims.getExpiration().after(new Date());
    }

    private String buildToken(String subject, Map<String, Object> claims, Instant expiration, String type) {
        return Jwts.builder()
                .claims(claims)
                .subject(subject)
                .claim("type", type)
                .issuedAt(Date.from(Instant.now()))
                .expiration(Date.from(expiration))
                .signWith(getSigningKey())
                .compact();
    }

    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(Decoders.BASE64.decode(jwtSecret));
    }
}
