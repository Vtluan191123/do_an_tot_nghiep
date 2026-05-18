package com.dntn.datn_be.service;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

@Service
public class LiveKitTokenService {

    @Value("${integration.livekit.api-key}")
    private String apiKey;

    @Value("${integration.livekit.api-secret}")
    private String apiSecret;

    @Value("${integration.livekit.live_url}")
    private String live_url;

    @Value("${integration.livekit.socket_live_url}")
    private String socket_live_url;
//https://meet.livekit.io/custom?liveKitUrl=wss://voicevtluan-9uwd60dy.livekit.cloud&token=eyJhbGciOiJIUzI1N
    public String createUrlLiveKit(String roomId, String identity) {

        long now = System.currentTimeMillis();
        long exp = now + 3600_000;

        Map<String, Object> videoGrant = new HashMap<>();
        videoGrant.put("roomJoin", true);
        videoGrant.put("room", roomId);
        videoGrant.put("canPublish", true);
        videoGrant.put("canSubscribe", true);

        SecretKey key = Keys.hmacShaKeyFor(
                apiSecret.getBytes(StandardCharsets.UTF_8)
        );

        String token = Jwts.builder()
                .setIssuer(apiKey)          // iss
                .setSubject(identity)       // sub
                .setIssuedAt(new Date(now))
                .setExpiration(new Date(exp))
                .claim("video", videoGrant) // 🔥 QUAN TRỌNG
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();

        return live_url+socket_live_url+token;
    }
}
