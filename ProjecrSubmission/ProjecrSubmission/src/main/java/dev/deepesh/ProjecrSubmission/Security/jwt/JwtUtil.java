package dev.deepesh.ProjecrSubmission.Security.jwt;

import dev.deepesh.ProjecrSubmission.Security.config.SecurityJwtProperties;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.Date;
import java.util.Map;
import java.util.function.Function;

@Component
public class JwtUtil {

    private final Key signingKey;
    private final long expirationMs;

    public JwtUtil(SecurityJwtProperties props) {
        // Load raw secret (may be base64) and ensure >= 256-bit key
        String rawSecret = props.getSecret();
        byte[] keyBytes = null;
        try {
            keyBytes = Decoders.BASE64.decode(rawSecret);
        } catch (IllegalArgumentException ignored) {
            // Not valid base64; will derive from raw string below
        }
        if (keyBytes == null || keyBytes.length < 32) {
            // Derive a 256-bit key deterministically from the provided secret using SHA-256
            try {
                MessageDigest sha256 = MessageDigest.getInstance("SHA-256");
                keyBytes = sha256.digest(rawSecret.getBytes(StandardCharsets.UTF_8));
            } catch (NoSuchAlgorithmException e) {
                throw new IllegalStateException("SHA-256 not available", e);
            }
        }
        this.signingKey = Keys.hmacShaKeyFor(keyBytes);
        this.expirationMs = props.getExpirationMs();
    }

    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    private Claims extractAllClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(signingKey)
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    public String generateToken(String username, String[] roles, Map<String, Object> extra) {
        long now = System.currentTimeMillis();
        return Jwts.builder()
                .setClaims(extra)
                .setSubject(username)
                .claim("roles", String.join(",", roles))
                .setIssuedAt(new Date(now))
                .setExpiration(new Date(now + expirationMs))
                .signWith(signingKey, SignatureAlgorithm.HS256)
                .compact();
    }

    public boolean isTokenValid(String token, String username) {
        final String extractedUsername = extractUsername(token);
        return (extractedUsername.equals(username) && !isTokenExpired(token));
    }

    private boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    private Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }
}
