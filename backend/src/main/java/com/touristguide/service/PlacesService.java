package com.touristguide.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.http.client.reactive.ClientHttpResponse;
import org.springframework.stereotype.Service;
import org.springframework.util.Assert;
import org.springframework.util.StringUtils;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;
import reactor.core.publisher.Mono;
import reactor.util.retry.Retry;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.Duration;

@Service
public class PlacesService {

    private final WebClient webClient;
    private final String apiKey;

    public PlacesService(@Value("${google.api.key:}") String apiKey) {
        this.webClient = WebClient.builder()
                .baseUrl("https://maps.googleapis.com/maps/api/place")
                .build();
        this.apiKey = apiKey;
    }

    public String fetchHotels(String city) { return textSearch("hotels in " + city); }
    public String fetchAttractions(String city) { return textSearch("tourist attractions in " + city); }
    public String fetchMonuments(String city) { return textSearch("monuments in " + city); }

    private String textSearch(String query) {
        Assert.isTrue(StringUtils.hasText(apiKey), "google.api.key must be set");
        String encodedQuery = URLEncoder.encode(query, StandardCharsets.UTF_8);
        try {
            Mono<String> mono = webClient.get()
                    .uri(uriBuilder -> uriBuilder
                            .path("/textsearch/json")
                            .queryParam("query", encodedQuery)
                            .queryParam("key", apiKey)
                            .build())
                    .accept(MediaType.APPLICATION_JSON)
                    .retrieve()
                    .bodyToMono(String.class)
                    .retryWhen(Retry.backoff(2, Duration.ofSeconds(1))
                            .jitter(0.3)
                            .filter(ex -> ex instanceof WebClientResponseException wex && (wex.getStatusCode().is5xxServerError() || wex.getStatusCode().value()==429))
                    );
            return mono.block();
        } catch (WebClientResponseException ex) {
            throw ex;
        } catch (Exception ex) {
            throw new RuntimeException("Failed to call Google Places", ex);
        }
    }

    public byte[] fetchPhoto(String photoRef, int maxWidth) {
        Assert.isTrue(StringUtils.hasText(apiKey), "google.api.key must be set");
        try {
            Mono<byte[]> mono = webClient.get()
                    .uri(uriBuilder -> uriBuilder
                            .path("/photo")
                            .queryParam("photoreference", photoRef)
                            .queryParam("maxwidth", maxWidth)
                            .queryParam("key", apiKey)
                            .build())
                    .accept(MediaType.ALL)
                    .retrieve()
                    .bodyToMono(byte[].class);
            return mono.block();
        } catch (Exception ex) {
            throw new RuntimeException("Failed to fetch photo from Google Places", ex);
        }
    }

    public String fetchDetails(String placeId) {
        Assert.hasText(placeId, "placeId must be provided");
        Assert.isTrue(StringUtils.hasText(apiKey), "google.api.key must be set");
        try {
            Mono<String> mono = webClient.get()
                    .uri(uriBuilder -> uriBuilder
                            .path("/details/json")
                            .queryParam("place_id", placeId)
                            .queryParam("fields", "place_id,name,rating,user_ratings_total,price_level,formatted_address,geometry,editorial_summary,reviews")
                            .queryParam("key", apiKey)
                            .build())
                    .accept(MediaType.APPLICATION_JSON)
                    .retrieve()
                    .bodyToMono(String.class);
            return mono.block();
        } catch (Exception ex) {
            throw new RuntimeException("Failed to fetch place details", ex);
        }
    }
}


