package com.touristguide.service;

import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.reactive.function.BodyInserters;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;
import reactor.core.publisher.Mono;
import reactor.util.retry.Retry;

import java.time.Duration;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class TouristApiService {
    private final WebClient overpassWebClient;
    private final Map<String, CacheEntry> cityToResponseCache = new ConcurrentHashMap<>();

    public TouristApiService(WebClient overpassWebClient) {
        this.overpassWebClient = overpassWebClient;
    }

    public String searchTouristPlaces(String city) {
        if (!StringUtils.hasText(city)) {
            throw new IllegalArgumentException("city must be provided");
        }

        String trimmedCity = city.trim();
        CacheEntry cached = cityToResponseCache.get(trimmedCity.toLowerCase());
        if (cached != null && !cached.isExpired()) {
            return (String) cached.responseBody;
        }
        String query = """
                [out:json][timeout:25];
                area[\"name\"=\"%s\"][\"boundary\"=\"administrative\"]->.searchArea;
                (
                  node[\"tourism\"=\"attraction\"](area.searchArea);
                  way[\"tourism\"=\"attraction\"](area.searchArea);
                  relation[\"tourism\"=\"attraction\"](area.searchArea);
                );
                out center;
                """.formatted(trimmedCity);

        try {
            Mono<String> responseMono = overpassWebClient.post()
                .uri("/interpreter")
                    .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                    .body(BodyInserters.fromFormData("data", query))
                .retrieve()
                .bodyToMono(String.class)
                    .retryWhen(Retry.backoff(2, Duration.ofSeconds(1))
                            .jitter(0.3)
                            .filter(ex -> ex instanceof WebClientResponseException wex && (wex.getStatusCode().is5xxServerError() || wex.getStatusCode().value()==429))
                    );

            String body = responseMono.block();
            if (body != null) {
                cityToResponseCache.put(trimmedCity.toLowerCase(), CacheEntry.of(body, Duration.ofMinutes(5)));
            }
            return body;
        } catch (WebClientResponseException ex) {
            throw ex;
        } catch (Exception ex) {
            throw new RuntimeException("Failed to fetch tourist places", ex);
        }
    }

    public Map<String, Object> getHotels(String city) {
        if (!StringUtils.hasText(city)) {
            throw new IllegalArgumentException("city must be provided");
        }

        String trimmedCity = city.trim();
        String cacheKey = "hotels_" + trimmedCity.toLowerCase();
        CacheEntry cached = cityToResponseCache.get(cacheKey);
        if (cached != null && !cached.isExpired()) {
            @SuppressWarnings("unchecked")
            Map<String, Object> result = (Map<String, Object>) cached.responseBody;
            return result;
        }

        // For now, return mock data. In a real implementation, you would call external APIs
        Map<String, Object> hotelsData = getMockHotelsData(trimmedCity);
        cityToResponseCache.put(cacheKey, CacheEntry.of(hotelsData, Duration.ofMinutes(10)));
        return hotelsData;
    }

    public Map<String, Object> getAttractions(String city) {
        if (!StringUtils.hasText(city)) {
            throw new IllegalArgumentException("city must be provided");
        }

        String trimmedCity = city.trim();
        String cacheKey = "attractions_" + trimmedCity.toLowerCase();
        CacheEntry cached = cityToResponseCache.get(cacheKey);
        if (cached != null && !cached.isExpired()) {
            @SuppressWarnings("unchecked")
            Map<String, Object> result = (Map<String, Object>) cached.responseBody;
            return result;
        }

        Map<String, Object> attractionsData = getMockAttractionsData(trimmedCity);
        cityToResponseCache.put(cacheKey, CacheEntry.of(attractionsData, Duration.ofMinutes(10)));
        return attractionsData;
    }

    public Map<String, Object> getMonuments(String city) {
        if (!StringUtils.hasText(city)) {
            throw new IllegalArgumentException("city must be provided");
        }

        String trimmedCity = city.trim();
        String cacheKey = "monuments_" + trimmedCity.toLowerCase();
        CacheEntry cached = cityToResponseCache.get(cacheKey);
        if (cached != null && !cached.isExpired()) {
            @SuppressWarnings("unchecked")
            Map<String, Object> result = (Map<String, Object>) cached.responseBody;
            return result;
        }

        Map<String, Object> monumentsData = getMockMonumentsData(trimmedCity);
        cityToResponseCache.put(cacheKey, CacheEntry.of(monumentsData, Duration.ofMinutes(10)));
        return monumentsData;
    }

    private Map<String, Object> getMockHotelsData(String city) {
        List<Map<String, Object>> hotels = new ArrayList<>();
        
        // Mock hotel data based on city
        if (city.toLowerCase().contains("delhi") || city.toLowerCase().contains("new delhi")) {
            hotels.add(createHotel("Taj Palace Hotel", "15000", 4.8, "Sardar Patel Marg, New Delhi", 
                "Luxury hotel with world-class amenities and stunning city views.", 
                "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400",
                Arrays.asList("WiFi", "Pool", "Spa", "Restaurant", "Gym")));
            
            hotels.add(createHotel("The Leela Palace", "12000", 4.6, "Chanakyapuri, New Delhi", 
                "Elegant palace hotel with traditional Indian architecture.", 
                "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400",
                Arrays.asList("WiFi", "Pool", "Spa", "Restaurant", "Concierge")));
            
            hotels.add(createHotel("Budget Inn", "2500", 3.5, "Main Street, New Delhi", 
                "Comfortable budget accommodation in the heart of the city.", 
                "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400",
                Arrays.asList("WiFi", "AC", "Restaurant")));
        } else if (city.toLowerCase().contains("mumbai")) {
            hotels.add(createHotel("Taj Mahal Palace", "18000", 4.9, "Apollo Bunder, Mumbai", 
                "Historic luxury hotel overlooking the Gateway of India.", 
                "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400",
                Arrays.asList("WiFi", "Pool", "Spa", "Restaurant", "Historic")));
            
            hotels.add(createHotel("The Oberoi Mumbai", "16000", 4.7, "Nariman Point, Mumbai", 
                "Modern luxury hotel with stunning Arabian Sea views.", 
                "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400",
                Arrays.asList("WiFi", "Pool", "Spa", "Restaurant", "Sea View")));
        } else {
            // Generic hotels for other cities
            hotels.add(createHotel("Grand Hotel", "8000", 4.2, "City Center, " + city, 
                "Comfortable hotel in the heart of " + city + ".", 
                "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400",
                Arrays.asList("WiFi", "AC", "Restaurant")));
            
            hotels.add(createHotel("Budget Stay", "2000", 3.0, "Downtown, " + city, 
                "Affordable accommodation for budget travelers.", 
                "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400",
                Arrays.asList("WiFi", "AC")));
        }

        Map<String, Object> result = new HashMap<>();
        result.put("hotels", hotels);
        result.put("city", city);
        result.put("total", hotels.size());
        return result;
    }

    private Map<String, Object> getMockAttractionsData(String city) {
        List<Map<String, Object>> attractions = new ArrayList<>();
        
        if (city.toLowerCase().contains("delhi") || city.toLowerCase().contains("new delhi")) {
            attractions.add(createAttraction("Red Fort", "Historical", 4.7, "Netaji Subhash Marg, New Delhi", 
                "A magnificent red sandstone fort built by Mughal emperor Shah Jahan.", 
                "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=400"));
            
            attractions.add(createAttraction("India Gate", "Monument", 4.5, "Rajpath, New Delhi", 
                "A war memorial dedicated to the soldiers of the British Indian Army.", 
                "https://images.unsplash.com/photo-1587474265384-2d1eef2878f5?w=400"));
            
            attractions.add(createAttraction("Lotus Temple", "Religious", 4.6, "Kalkaji, New Delhi", 
                "A Bahá'í House of Worship known for its flowerlike shape.", 
                "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400"));
        } else if (city.toLowerCase().contains("mumbai")) {
            attractions.add(createAttraction("Gateway of India", "Monument", 4.4, "Apollo Bunder, Mumbai", 
                "An arch-monument built in the early 20th century in Mumbai.", 
                "https://images.unsplash.com/photo-1587474265384-2d1eef2878f5?w=400"));
            
            attractions.add(createAttraction("Marine Drive", "Nature", 4.3, "Marine Drive, Mumbai", 
                "A 3.6-kilometre-long boulevard in South Mumbai.", 
                "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400"));
        } else {
            attractions.add(createAttraction("City Center", "Entertainment", 4.0, "Downtown, " + city, 
                "The main entertainment and shopping area of " + city + ".", 
                "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400"));
        }

        Map<String, Object> result = new HashMap<>();
        result.put("attractions", attractions);
        result.put("city", city);
        result.put("total", attractions.size());
        return result;
    }

    private Map<String, Object> getMockMonumentsData(String city) {
        List<Map<String, Object>> monuments = new ArrayList<>();
        
        if (city.toLowerCase().contains("delhi") || city.toLowerCase().contains("new delhi")) {
            monuments.add(createMonument("Qutub Minar", 4.6, "Mehrauli, New Delhi", 
                "A 73-meter tall minaret built in the 12th century, a UNESCO World Heritage Site.", 
                "https://images.unsplash.com/photo-1587474265384-2d1eef2878f5?w=400", "1192", "Indo-Islamic"));
            
            monuments.add(createMonument("Humayun's Tomb", 4.5, "Nizamuddin, New Delhi", 
                "The tomb of the Mughal Emperor Humayun, a UNESCO World Heritage Site.", 
                "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=400", "1572", "Mughal"));
        } else if (city.toLowerCase().contains("agra")) {
            monuments.add(createMonument("Taj Mahal", 4.9, "Agra, Uttar Pradesh", 
                "An ivory-white marble mausoleum, one of the Seven Wonders of the World.", 
                "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=400", "1653", "Mughal"));
        } else {
            monuments.add(createMonument("Historic Monument", 4.0, "City Center, " + city, 
                "A significant historical monument in " + city + ".", 
                "https://images.unsplash.com/photo-1587474265384-2d1eef2878f5?w=400", "Unknown", "Traditional"));
        }

        Map<String, Object> result = new HashMap<>();
        result.put("monuments", monuments);
        result.put("city", city);
        result.put("total", monuments.size());
        return result;
    }

    private Map<String, Object> createHotel(String name, String price, double rating, String address, 
                                          String description, String image, List<String> amenities) {
        Map<String, Object> hotel = new HashMap<>();
        hotel.put("id", UUID.randomUUID().toString());
        hotel.put("name", name);
        hotel.put("price", price);
        hotel.put("rating", rating);
        hotel.put("address", address);
        hotel.put("description", description);
        hotel.put("image", image);
        hotel.put("amenities", amenities);
        return hotel;
    }

    private Map<String, Object> createAttraction(String name, String type, double rating, String address, 
                                               String description, String image) {
        Map<String, Object> attraction = new HashMap<>();
        attraction.put("id", UUID.randomUUID().toString());
        attraction.put("name", name);
        attraction.put("type", type);
        attraction.put("rating", rating);
        attraction.put("address", address);
        attraction.put("description", description);
        attraction.put("image", image);
        return attraction;
    }

    private Map<String, Object> createMonument(String name, double rating, String address, 
                                             String description, String image, String builtYear, String architecture) {
        Map<String, Object> monument = new HashMap<>();
        monument.put("id", UUID.randomUUID().toString());
        monument.put("name", name);
        monument.put("rating", rating);
        monument.put("address", address);
        monument.put("description", description);
        monument.put("image", image);
        monument.put("builtYear", builtYear);
        monument.put("architecture", architecture);
        return monument;
    }

    private static class CacheEntry {
        final Object responseBody;
        final long expiresAtEpochMs;

        private CacheEntry(Object responseBody, long expiresAtEpochMs) {
            this.responseBody = responseBody;
            this.expiresAtEpochMs = expiresAtEpochMs;
        }

        static CacheEntry of(Object body, Duration ttl) {
            return new CacheEntry(body, System.currentTimeMillis() + ttl.toMillis());
        }

        boolean isExpired() {
            return System.currentTimeMillis() > expiresAtEpochMs;
        }
    }
}
