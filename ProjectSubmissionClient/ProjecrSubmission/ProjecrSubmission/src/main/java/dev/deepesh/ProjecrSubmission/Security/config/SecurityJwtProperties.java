package dev.deepesh.ProjecrSubmission.Security.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "security.jwt")
public class SecurityJwtProperties {

    /** Base64-encoded secret for signing JWTs. */
    private String secret = "ZmFrZV9kZXZfand0X3NlY3JldF9jaGFuZ2VfbWU=";

    /** Token expiration in milliseconds. */
    private long expirationMs = 86400000L;

    public String getSecret() {
        return secret;
    }

    public void setSecret(String secret) {
        this.secret = secret;
    }

    public long getExpirationMs() {
        return expirationMs;
    }

    public void setExpirationMs(long expirationMs) {
        this.expirationMs = expirationMs;
    }
}
