package com.noorain.login_system.config;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.util.Date;
import java.util.function.Function;

@Service
public class JwtService {

    /**
     * IMPORTANT:
     * - Keep secrets out of git.
     * - Override via env var: JWT_SECRET
     * - Minimum length for HS256 is 32 bytes.
     */
    private final String secret;

    /** Token validity in milliseconds (default: 24h). */
    private final long expirationMs;

    public JwtService(
            @Value("${app.jwt.secret:${JWT_SECRET:CHANGE_ME_CHANGE_ME_CHANGE_ME_CHANGE_ME_32_CHARS}}") String secret,
            @Value("${app.jwt.expiration-ms:86400000}") long expirationMs) {
        if (secret == null || secret.isBlank()) {
            throw new IllegalStateException("JWT secret is missing. Set env var JWT_SECRET or property app.jwt.secret");
        }
        if (secret.length() < 32) {
            throw new IllegalStateException("JWT secret must be at least 32 characters for HS256");
        }

        this.secret = secret;
        this.expirationMs = expirationMs;
    }

    // extract username from email
    public String extractUsername(String token) {
        return extractClaim(token, claims -> claims.getSubject());
    }

    // generate new token at the time of login , packs the username , current time ,
    // and expiry to json object
    public String generateToken(UserDetails userDetails) {
        return Jwts.builder()
                .setSubject(userDetails.getUsername())
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + expirationMs))
                .signWith(getSignInKey(), SignatureAlgorithm.HS256)
                .compact(); // it turns json into long encrypted string and sends it to the user's browser
    }

    // token validation, security filter will call extractUsername
    public boolean isTokenValid(String token, UserDetails userDetails) {
        final String username = extractUsername(token);
        return (username.equals(userDetails.getUsername())) && !isTokenExpired(token);
    }

    public boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    private Date extractExpiration(String token) {
        return extractClaim(token, claims -> claims.getExpiration());
    }

    // fetches the secret key to sign the pass
    private Key getSignInKey() {
        return Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }

    private <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    private Claims extractAllClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSignInKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }
}
