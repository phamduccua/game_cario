package com.example.game_tien_tri.utils;

import com.example.game_tien_tri.entity.UserEntity;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

@Component
@RequiredArgsConstructor
public class JwtTokenUtils {
    @Value("${jwt.expiration}")
    private String expriration;
    @Value("${jwt.secretKey}")
    private String secretKey;

    public String generateToken(UserEntity userEntity) {
        Map<String, String> claims = new HashMap<>();
        claims.put("username", userEntity.getUsername());
        try{
            String token = Jwts.builder()
                    .setClaims(claims)
                    .setSubject(userEntity.getUsername())
                    .setExpiration(new Date(System.currentTimeMillis() + Long.parseLong(expriration) * 1000L))
                    .signWith(getSignKey(), SignatureAlgorithm.HS256)
                    .compact();
            return token;
        }catch(Exception e){
            throw new RuntimeException(e);
        }
    }

    private Key getSignKey() {
        byte[] keyBytes = Decoders.BASE64.decode(secretKey);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    private Claims getClaimsFromToken(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSignKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    public int getRemainingExpiration(String token) {
        Date expiration = this.getClaimsFromToken(token).getExpiration();
        long remainingMillis = expiration.getTime() - System.currentTimeMillis();
        return (int)Math.max(remainingMillis / 1000, 0);
    }

    public <T> T extractClaimsFromToken(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = this.getClaimsFromToken(token);
        return claimsResolver.apply(claims);
    }

    private boolean isTokenExpired(String token) {
        final Date expiration = this.getClaimsFromToken(token).getExpiration();
        return expiration.before(new Date());
    }

    public String extractUsername(String token) {
        return extractClaimsFromToken(token, Claims::getSubject);
    }

    public boolean validateToken(String token, UserEntity userEntity) {
        final String username = this.extractUsername(token);
        return(username.equals(userEntity.getUsername())
                && !isTokenExpired(token));
    }
}
