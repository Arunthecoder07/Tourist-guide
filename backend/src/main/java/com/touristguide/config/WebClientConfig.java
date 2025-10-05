package com.touristguide.config;

import io.netty.channel.ChannelOption;
import io.netty.handler.timeout.ReadTimeoutHandler;
import io.netty.handler.timeout.WriteTimeoutHandler;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpHeaders;
import org.springframework.http.client.reactive.ReactorClientHttpConnector;
import org.springframework.web.reactive.function.client.ExchangeStrategies;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.netty.http.client.HttpClient;

import java.time.Duration;

@Configuration
public class WebClientConfig {

    @Bean
    public WebClient overpassWebClient(
            @Value("${overpass.base-url:https://overpass-api.de/api}") String baseUrl,
            @Value("${app.user-agent:TouristGuideApp/1.0 (contact@example.com)}") String userAgent,
            @Value("${http.client.connect-timeout-ms:5000}") int connectTimeoutMs,
            @Value("${http.client.read-timeout-ms:15000}") int readTimeoutMs,
            @Value("${http.client.write-timeout-ms:15000}") int writeTimeoutMs,
            @Value("${http.client.max-in-memory-size-bytes:1048576}") int maxInMemorySize
    ) {
        HttpClient httpClient = HttpClient.create()
                .option(ChannelOption.CONNECT_TIMEOUT_MILLIS, connectTimeoutMs)
                .responseTimeout(Duration.ofMillis(readTimeoutMs))
                .doOnConnected(conn -> conn
                        .addHandlerLast(new ReadTimeoutHandler(readTimeoutMs / 1000))
                        .addHandlerLast(new WriteTimeoutHandler(writeTimeoutMs / 1000))
                );

        ExchangeStrategies strategies = ExchangeStrategies.builder()
                .codecs(cfg -> cfg.defaultCodecs().maxInMemorySize(maxInMemorySize))
                .build();

        return WebClient.builder()
                .clientConnector(new ReactorClientHttpConnector(httpClient))
                .baseUrl(baseUrl)
                .defaultHeader(HttpHeaders.USER_AGENT, userAgent)
                .exchangeStrategies(strategies)
                .build();
    }
}


