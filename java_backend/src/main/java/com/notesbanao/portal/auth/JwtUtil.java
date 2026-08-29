package com.notesbanao.portal.auth;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Component;
import com.notesbanao.portal.config.PortalProperties;

import javax.crypto.SecretKey;
import java.util.Date;

@Component
public class JwtUtil {

    private final SecretKey signingKey;
    private final int expirySeconds;

    public JwtUtil(PortalProperties properties) {
        String secret = properties.getJwt().getSecret();
        this.signingKey = Keys.hmacShaKeyFor(secret.getBytes());
        this.expirySeconds = properties.getJwt().getExpirySeconds();
    }

    /** Naya JWT banata hai, email ko payload mein daal ke. */
    public String generateToken(String email) {
        Date now = new Date();
        Date expiry = new Date(now.getTime() + (expirySeconds * 1000L));

        return Jwts.builder()
                .subject(email)
                .issuedAt(now)
                .expiration(expiry)
                .signWith(signingKey)
                .compact();
    }

    /** Token verify karta hai. Valid hai toh email return karta hai, warna null. */
    public String validateAndGetEmail(String token) {
        try {
            Claims claims = Jwts.parser()
                    .verifyWith(signingKey)
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();

            return claims.getSubject();
        } catch (Exception e) {
            // Signature galat hai, ya expire ho gaya, ya format hi galat hai
            return null;
        }
    }
}