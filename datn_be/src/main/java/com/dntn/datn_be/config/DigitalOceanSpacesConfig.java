package com.dntn.datn_be.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.S3Configuration;

import java.net.URI;

@Configuration
@Slf4j
public class DigitalOceanSpacesConfig {

    @Value("${spring.digitalocean.spaces.access-key}")
    private String accessKey;

    @Value("${spring.digitalocean.spaces.secret-key}")
    private String secretKey;

    @Value("${spring.digitalocean.spaces.region}")
    private String region;

    @Value("${spring.digitalocean.spaces.endpoint}")
    private String endpoint;

    @Bean
    public S3Client s3Client() {
        log.info("Configuring DigitalOcean Spaces S3Client");
        log.debug("Region: {}, Endpoint: {}", region, endpoint);
        
        // Extract the base endpoint URL without trailing slash
        String baseEndpoint = endpoint.replaceAll("/$", "");
        
        return S3Client.builder()
                .region(Region.of(region))
                .credentialsProvider(StaticCredentialsProvider.create(
                        AwsBasicCredentials.create(accessKey, secretKey)
                ))
                .endpointOverride(URI.create(baseEndpoint))
                .serviceConfiguration(S3Configuration.builder()
                        // Use path-style access for DigitalOcean compatibility
                        .pathStyleAccessEnabled(true)
                        // Important: use virtual-hosted-style disabled
                        .accelerateModeEnabled(false)
                        .build())
                .build();
    }
}

