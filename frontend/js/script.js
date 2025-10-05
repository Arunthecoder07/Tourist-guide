let map = L.map('map').setView([22.9734,78.6569],5);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution:'© OpenStreetMap contributors'
}).addTo(map);

let indiaBounds=[[6.5546,68.1114],[37.0970,97.3956]];
map.setMaxBounds(indiaBounds);
map.on('drag',()=>{ map.panInsideBounds(indiaBounds,{animate:true}); });

let markers=[];

async function fetchFromBackend(city){
    const response = await fetch(`http://localhost:8082/api/tourist/${encodeURIComponent(city)}`);
    if(!response.ok){
        throw new Error(`Backend responded with ${response.status}`);
    }
    return await response.json();
}

async function fetchFromOverpass(city){
    const query = `
        [out:json][timeout:25];
        area["name"="${city}"]["boundary"="administrative"]->.searchArea;
        (
          node["tourism"="attraction"](area.searchArea);
          way["tourism"="attraction"](area.searchArea);
          relation["tourism"="attraction"](area.searchArea);
        );
        out center;`;

    const formBody = new URLSearchParams();
    formBody.append("data", query);

    const resp = await fetch("https://overpass-api.de/api/interpreter", {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "Accept": "application/json"
        },
        body: formBody.toString()
    });
    if(!resp.ok){
        throw new Error(`Overpass responded with ${resp.status}`);
    }
    return await resp.json();
}

async function searchCity(){
    let city=document.getElementById("cityInput").value;
    let title=document.getElementById("resultsTitle");

    if(!city){ alert("Enter city!"); return; }

    title.style.display="block";
    title.textContent=`Searching tourist places in "${city}"...`;

    markers.forEach(m=>map.removeLayer(m));
    markers=[];

    // Always load detailed data first (this will show results immediately)
    loadDetailedData(city);
    
    // Try to load map data from external APIs
    try{
        let data;
        try {
            data = await fetchFromBackend(city);
        } catch(e){
            data = await fetchFromOverpass(city);
        }

        if(data.elements && data.elements.length > 0){
        title.textContent=`Tourist attractions in "${city}":`;
        let bounds=[];

        data.elements.forEach(place=>{
            let lat=place.lat||(place.center&&place.center.lat);
            let lon=place.lon||(place.center&&place.center.lon);
            if(!lat||!lon) return;

            let name=(place.tags && place.tags.name) || "Unnamed";
            let type=(place.tags && place.tags.tourism) || "Tourist Spot";

            let marker=L.marker([lat,lon]).addTo(map);
            marker.bindPopup(`<b>${name}</b><br>Type:${type}`);
            markers.push(marker);

            bounds.push([lat,lon]);
        });

        if(bounds.length>0) map.fitBounds(bounds);
        } else {
            title.textContent=`Discover amazing places in "${city}":`;
        }

    }catch(error){
        console.error("Error loading map data:",error);
        title.textContent=`Discover amazing places in "${city}":`;
    }
}

function viewLocationDetails(city) {
    // Navigate to location details page with city parameter
    window.location.href = `location-details.html?location=${encodeURIComponent(city)}`;
}

async function loadDetailedData(city) {
    try {
        // Try to load from backend first
        const [hotelsResponse, attractionsResponse, monumentsResponse] = await Promise.allSettled([
            fetch(`http://localhost:8082/api/tourist/hotels/${encodeURIComponent(city)}`),
            fetch(`http://localhost:8082/api/tourist/attractions/${encodeURIComponent(city)}`),
            fetch(`http://localhost:8082/api/tourist/monuments/${encodeURIComponent(city)}`)
        ]);

        let hasData = false;

        // Process hotels
        if (hotelsResponse.status === 'fulfilled' && hotelsResponse.value.ok) {
            const hotelsData = await hotelsResponse.value.json();
            displayHotels(hotelsData.hotels || []);
            hasData = true;
        }

        // Process attractions
        if (attractionsResponse.status === 'fulfilled' && attractionsResponse.value.ok) {
            const attractionsData = await attractionsResponse.value.json();
            displayAttractions(attractionsData.attractions || []);
            hasData = true;
        }

        // Process monuments
        if (monumentsResponse.status === 'fulfilled' && monumentsResponse.value.ok) {
            const monumentsData = await monumentsResponse.value.json();
            displayMonuments(monumentsData.monuments || []);
            hasData = true;
        }

        // If no data from backend, use mock data
        if (!hasData) {
            console.log('Backend not available, using mock data');
            loadMockDetailedData(city);
        }
    } catch (error) {
        console.error('Error loading detailed data:', error);
        // Fallback to mock data
        loadMockDetailedData(city);
    }
}

function displayHotels(hotels) {
    const container = document.getElementById('hotelsList');
    const section = document.getElementById('hotelsSection');
    
    if (hotels.length === 0) return;
    
    container.innerHTML = '';
    section.style.display = 'block';
    
    hotels.forEach(hotel => {
        const card = createHotelCard(hotel);
        container.appendChild(card);
    });
}

function displayAttractions(attractions) {
    const container = document.getElementById('attractionsList');
    const section = document.getElementById('attractionsSection');
    
    if (attractions.length === 0) return;
    
    container.innerHTML = '';
    section.style.display = 'block';
    
    attractions.forEach(attraction => {
        const card = createAttractionCard(attraction);
        container.appendChild(card);
    });
}

function displayMonuments(monuments) {
    const container = document.getElementById('monumentsList');
    const section = document.getElementById('monumentsSection');
    
    if (monuments.length === 0) return;
    
    container.innerHTML = '';
    section.style.display = 'block';
    
    monuments.forEach(monument => {
        const card = createMonumentCard(monument);
        container.appendChild(card);
    });
}

function createHotelCard(hotel) {
    const card = document.createElement('div');
    card.className = 'card hotel-card';
    const address = hotel.address || 'Address not available';
    const rents = hotel.price ? `₹${hotel.price}/night` : 'N/A';
    card.innerHTML = `
        <div class="card-content">
            <h4>${hotel.name}</h4>
            <div class="rating">
                ${generateStars(hotel.rating || 0)}
                <span class="rating-text">${hotel.rating || 0}/5</span>
            </div>
            <p class="address"><i class="fas fa-map-marker-alt"></i> ${address}</p>
            <p class="description">${hotel.description || 'No description available'}</p>
            <div class="facts-grid">
                <div class="fact-item"><strong>Rents:</strong> ${rents}</div>
                <div class="fact-item"><strong>Directions:</strong> <a href="https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}" target="_blank" rel="noopener">Open in Maps</a></div>
            </div>
            <div class="amenities">
                ${(hotel.amenities || []).map(amenity => `<span class="amenity">${amenity}</span>`).join('')}
            </div>
            <div class="card-actions">
                <button class="btn-primary" onclick="viewHotelDetails('${hotel.id}', '${hotel.name}')">
                    <i class="fas fa-info-circle"></i> View Details
                </button>
                <button class="btn-secondary" onclick="addToFavorites('${hotel.id}', 'hotel')">
                    <i class="fas fa-heart"></i> Save
                </button>
            </div>
        </div>
    `;
    return card;
}

function createAttractionCard(attraction) {
    const card = document.createElement('div');
    card.className = 'card attraction-card';
    const address = attraction.address || 'Address not available';
    const entry = (attraction.visitingInfo && attraction.visitingInfo.entryFee) ? attraction.visitingInfo.entryFee : (attraction.price_level != null ? `${'₹'.repeat(attraction.price_level || 0)} (${attraction.price_level})` : 'Free / N/A');
    card.innerHTML = `
        <div class="card-content">
            <h4>${attraction.name}</h4>
            <div class="rating">
                ${generateStars(attraction.rating || 0)}
                <span class="rating-text">${attraction.rating || 0}/5</span>
            </div>
            <p class="address"><i class="fas fa-map-marker-alt"></i> ${address}</p>
            <p class="description">${attraction.description || 'No description available'}</p>
            <div class="facts-grid">
                <div class="fact-item"><strong>Rents/Entry:</strong> ${entry}</div>
                <div class="fact-item"><strong>Directions:</strong> <a href="https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}" target="_blank" rel="noopener">Open in Maps</a></div>
            </div>
            <div class="card-actions">
                <button class="btn-primary" onclick="viewAttractionDetails('${attraction.id}', '${attraction.name}')">
                    <i class="fas fa-info-circle"></i> View Details
                </button>
                <button class="btn-secondary" onclick="addToFavorites('${attraction.id}', 'attraction')">
                    <i class="fas fa-heart"></i> Save
                </button>
            </div>
        </div>
    `;
    return card;
}

function createMonumentCard(monument) {
    const card = document.createElement('div');
    card.className = 'card monument-card';
    const address = monument.address || 'Address not available';
    const entry = (monument.visitingInfo && monument.visitingInfo.entryFee) ? monument.visitingInfo.entryFee : (monument.price_level != null ? `${'₹'.repeat(monument.price_level || 0)} (${monument.price_level})` : 'Free / N/A');
    card.innerHTML = `
        <div class="card-content">
            <h4>${monument.name}</h4>
            <div class="rating">
                ${generateStars(monument.rating || 0)}
                <span class="rating-text">${monument.rating || 0}/5</span>
            </div>
            <p class="address"><i class="fas fa-map-marker-alt"></i> ${address}</p>
            <p class="description">${monument.description || 'No description available'}</p>
            <div class="facts-grid">
                <div class="fact-item"><strong>Rents/Entry:</strong> ${entry}</div>
                <div class="fact-item"><strong>Directions:</strong> <a href="https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}" target="_blank" rel="noopener">Open in Maps</a></div>
            </div>
            <div class="historical-info">
                <p><strong>Built:</strong> ${monument.builtYear || 'Unknown'}</p>
                <p><strong>Architecture:</strong> ${monument.architecture || 'Unknown'}</p>
            </div>
            <div class="card-actions">
                <button class="btn-primary" onclick="viewMonumentDetails('${monument.id}', '${monument.name}')">
                    <i class="fas fa-info-circle"></i> View Details
                </button>
                <button class="btn-secondary" onclick="addToFavorites('${monument.id}', 'monument')">
                    <i class="fas fa-heart"></i> Save
                </button>
            </div>
        </div>
    `;
    return card;
}

function generateStars(rating) {
    let stars = '';
    for (let i = 1; i <= 5; i++) {
        if (i <= rating) {
            stars += '<i class="fas fa-star"></i>';
        } else if (i - 0.5 <= rating) {
            stars += '<i class="fas fa-star-half-alt"></i>';
        } else {
            stars += '<i class="far fa-star"></i>';
        }
    }
    return stars;
}

function viewHotelDetails(id, name) {
    window.location.href = `hotel-details.html?id=${id}&name=${encodeURIComponent(name)}`;
}

function viewAttractionDetails(id, name) {
    window.location.href = `attraction-details.html?id=${id}&name=${encodeURIComponent(name)}`;
}

function viewMonumentDetails(id, name) {
    window.location.href = `monument-details.html?id=${id}&name=${encodeURIComponent(name)}`;
}

function addToFavorites(id, type) {
    alert(`Added ${type} to favorites!`);
}

// Simple auth-aware navbar rendering across pages
document.addEventListener('DOMContentLoaded', () => {
    const userName = localStorage.getItem('userName');
    const header = document.querySelector('header nav');
    if (!header) return;
    if (userName) {
        header.innerHTML = `
            <a href="index.html">Home</a>
            <a href="my-reviews.html">My Reviews</a>
            <span style="margin-left:8px;color:#a7f3d0">Hi, ${userName}</span>
            <a href="#" id="signOutLink">Sign Out</a>
        `;
        const signOut = document.getElementById('signOutLink');
        if (signOut) {
            signOut.addEventListener('click', (e) => {
                e.preventDefault();
                localStorage.removeItem('userName');
                localStorage.removeItem('userEmail');
                localStorage.removeItem('userPassword');
                window.location.href = 'index.html';
            });
        }
    }
});

// Function to get accurate images for specific landmarks
function getAccurateImage(landmarkName) {
    const imageMap = {
        'Red Fort': 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=400&q=80&ixlib=rb-4.0.3',
        'India Gate': 'https://images.unsplash.com/photo-1587474265384-2d1eef2878f5?w=400&q=80&ixlib=rb-4.0.3',
        'Lotus Temple': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&q=80&ixlib=rb-4.0.3',
        'Qutub Minar': 'https://images.unsplash.com/photo-1587474265384-2d1eef2878f5?w=400&q=80&ixlib=rb-4.0.3',
        'Humayun\'s Tomb': 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=400&q=80&ixlib=rb-4.0.3',
        'Gateway of India': 'https://images.unsplash.com/photo-1587474265384-2d1eef2878f5?w=400&q=80&ixlib=rb-4.0.3',
        'Marine Drive': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&q=80&ixlib=rb-4.0.3',
        'Taj Palace Hotel': 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&q=80&ixlib=rb-4.0.3',
        'The Leela Palace': 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400&q=80&ixlib=rb-4.0.3',
        'Taj Mahal Palace': 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&q=80&ixlib=rb-4.0.3',
        'The Oberoi Mumbai': 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400&q=80&ixlib=rb-4.0.3'
    };
    
    return imageMap[landmarkName] || 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&q=80&ixlib=rb-4.0.3';
}

// Fallback mock data function
function loadMockDetailedData(city) {
    // Generate city-specific mock data
    const cityLower = city.toLowerCase();
    
    let mockHotels = [];
    let mockAttractions = [];
    let mockMonuments = [];
    
    if (cityLower.includes('delhi') || cityLower.includes('new delhi')) {
        mockHotels = [
            {
                id: cityLower + '-hotel-1',
                name: 'Taj Palace Hotel',
                price: '25000',
                rating: 4.8,
                address: 'Sardar Patel Marg, Diplomatic Enclave, New Delhi 110021',
                description: 'A luxury 5-star hotel in the heart of New Delhi, known for its Mughal-inspired architecture and world-class service. Features 403 rooms and suites with views of the city.',
                image: getAccurateImage('Taj Palace Hotel'),
                amenities: ['Free WiFi', 'Swimming Pool', 'Spa & Wellness', 'Multiple Restaurants', 'Fitness Center', 'Business Center', 'Concierge', 'Valet Parking']
            },
            {
                id: cityLower + '-hotel-2',
                name: 'The Leela Palace New Delhi',
                price: '18000',
                rating: 4.6,
                address: 'Chanakyapuri, New Delhi 110023',
                description: 'A luxury hotel inspired by Lutyens\' Delhi, featuring 254 rooms and suites. Known for its contemporary design and exceptional hospitality.',
                image: getAccurateImage('The Leela Palace'),
                amenities: ['Free WiFi', 'Swimming Pool', 'Spa', 'Fine Dining', 'Fitness Center', 'Concierge', 'Airport Shuttle', 'Pet Friendly']
            },
            {
                id: cityLower + '-hotel-3',
                name: 'Hotel Broadway',
                price: '3500',
                rating: 3.8,
                address: '4/15A Asaf Ali Road, New Delhi 110002',
                description: 'A heritage hotel in Old Delhi, offering comfortable accommodation near the Red Fort and Jama Masjid. Built in 1956, it combines old-world charm with modern amenities.',
                image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400&q=80&ixlib=rb-4.0.3',
                amenities: ['Free WiFi', 'AC', 'Restaurant', 'Room Service', 'Laundry Service', 'Airport Transfer']
            }
        ];
        
        mockAttractions = [
            {
                id: cityLower + '-attraction-1',
                name: 'Red Fort',
                type: 'Historical',
                rating: 4.7,
                address: 'Netaji Subhash Marg, Lal Qila, Old Delhi, New Delhi 110006',
                description: 'Built by Mughal Emperor Shah Jahan in 1639, this UNESCO World Heritage Site served as the main residence of Mughal emperors for nearly 200 years. The fort is made of red sandstone and covers an area of 254.67 acres.',
                image: getAccurateImage('Red Fort')
            },
            {
                id: cityLower + '-attraction-2',
                name: 'India Gate',
                type: 'Monument',
                rating: 4.5,
                address: 'Rajpath, India Gate, New Delhi 110003',
                description: 'A 42-meter tall war memorial arch built in 1931 to honor the 70,000 Indian soldiers who died in World War I. Designed by Sir Edwin Lutyens, it is one of the largest war memorials in India.',
                image: getAccurateImage('India Gate')
            },
            {
                id: cityLower + '-attraction-3',
                name: 'Lotus Temple',
                type: 'Religious',
                rating: 4.6,
                address: 'Lotus Temple Rd, Bahapur, Shambhu Dayal Bagh, Kalkaji, New Delhi 110019',
                description: 'A Bahá\'í House of Worship completed in 1986, known for its flowerlike architecture. The temple has 27 free-standing marble-clad "petals" arranged in clusters of three to form nine sides.',
                image: getAccurateImage('Lotus Temple')
            }
        ];
        
        mockMonuments = [
            {
                id: cityLower + '-monument-1',
                name: 'Qutub Minar',
                rating: 4.6,
                address: 'Mehrauli, New Delhi 110030',
                description: 'A 73-meter tall brick minaret, the tallest in India, built between 1199-1220 by Qutub-ud-din Aibak and completed by Iltutmish. This UNESCO World Heritage Site is part of the Qutb complex and features five distinct storeys.',
                image: getAccurateImage('Qutub Minar'),
                builtYear: '1199-1220',
                architecture: 'Indo-Islamic'
            },
            {
                id: cityLower + '-monument-2',
                name: 'Humayun\'s Tomb',
                rating: 4.5,
                address: 'Mathura Road, Nizamuddin, New Delhi 110013',
                description: 'The tomb of the Mughal Emperor Humayun, built in 1570 by his widow Bega Begum. This UNESCO World Heritage Site is considered the first garden-tomb on the Indian subcontinent and inspired the design of the Taj Mahal.',
                image: getAccurateImage('Humayun\'s Tomb'),
                builtYear: '1570',
                architecture: 'Mughal'
            }
        ];
    } else if (cityLower.includes('mumbai')) {
        mockHotels = [
            {
                id: cityLower + '-hotel-1',
                name: 'Taj Mahal Palace',
                price: '35000',
                rating: 4.9,
                address: 'Apollo Bunder, Colaba, Mumbai 400001',
                description: 'A historic luxury hotel opened in 1903, overlooking the Gateway of India and Arabian Sea. This iconic hotel has hosted numerous dignitaries and celebrities, featuring 285 rooms with a blend of Indian and European architecture.',
                image: getAccurateImage('Taj Mahal Palace'),
                amenities: ['Free WiFi', 'Swimming Pool', 'Spa & Wellness', 'Multiple Restaurants', 'Historic Architecture', 'Concierge', 'Valet Parking', 'Sea View']
            },
            {
                id: cityLower + '-hotel-2',
                name: 'The Oberoi Mumbai',
                price: '28000',
                rating: 4.7,
                address: 'Nariman Point, Mumbai 400021',
                description: 'A luxury hotel in the heart of Mumbai\'s business district, offering panoramic views of the Arabian Sea. Features 287 rooms and suites with contemporary design and world-class amenities.',
                image: getAccurateImage('The Oberoi Mumbai'),
                amenities: ['Free WiFi', 'Swimming Pool', 'Spa', 'Fine Dining', 'Sea View', 'Business Center', 'Concierge', 'Airport Shuttle']
            }
        ];
        
        mockAttractions = [
            {
                id: cityLower + '-attraction-1',
                name: 'Gateway of India',
                type: 'Monument',
                rating: 4.4,
                address: 'Apollo Bunder, Colaba, Mumbai 400001',
                description: 'A 26-meter tall arch-monument built in 1924 to commemorate the visit of King George V and Queen Mary to Mumbai in 1911. Designed by George Wittet in Indo-Saracenic style, it was the ceremonial entrance to India for British viceroys.',
                image: getAccurateImage('Gateway of India')
            },
            {
                id: cityLower + '-attraction-2',
                name: 'Marine Drive',
                type: 'Nature',
                rating: 4.3,
                address: 'Marine Drive, Mumbai 400020',
                description: 'A 3.6-kilometre-long boulevard in South Mumbai, also known as the "Queen\'s Necklace" due to its curved shape and street lights that resemble a string of pearls. It offers stunning views of the Arabian Sea and is a popular evening destination.',
                image: getAccurateImage('Marine Drive')
            }
        ];
        
        mockMonuments = [
            {
                id: cityLower + '-monument-1',
                name: 'Gateway of India',
                rating: 4.4,
                address: 'Apollo Bunder, Colaba, Mumbai 400001',
                description: 'A 26-meter tall arch-monument built in 1924 to commemorate the visit of King George V and Queen Mary to Mumbai in 1911. Designed by George Wittet in Indo-Saracenic style, it was the ceremonial entrance to India for British viceroys and is now a symbol of Mumbai.',
                image: getAccurateImage('Gateway of India'),
                builtYear: '1924',
                architecture: 'Indo-Saracenic'
            }
        ];
    } else {
        // Generic data for other cities
        mockHotels = [
            {
                id: cityLower + '-hotel-1',
                name: 'Grand Hotel',
                price: '8000',
                rating: 4.2,
                address: 'City Center, ' + city,
                description: 'Comfortable hotel in the heart of ' + city + '.',
                image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400',
                amenities: ['WiFi', 'AC', 'Restaurant']
            },
            {
                id: cityLower + '-hotel-2',
                name: 'Budget Stay',
                price: '2000',
                rating: 3.0,
                address: 'Downtown, ' + city,
                description: 'Affordable accommodation for budget travelers.',
                image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400',
                amenities: ['WiFi', 'AC']
            }
        ];
        
        mockAttractions = [
            {
                id: cityLower + '-attraction-1',
                name: 'City Center',
                type: 'Entertainment',
                rating: 4.0,
                address: 'Downtown, ' + city,
                description: 'The main entertainment and shopping area of ' + city + '.',
                image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400'
            }
        ];
        
        mockMonuments = [
            {
                id: cityLower + '-monument-1',
                name: 'Historic Monument',
                rating: 4.0,
                address: 'City Center, ' + city,
                description: 'A significant historical monument in ' + city + '.',
                image: 'https://images.unsplash.com/photo-1587474265384-2d1eef2878f5?w=400',
                builtYear: 'Unknown',
                architecture: 'Traditional'
            }
        ];
    }
    
    displayHotels(mockHotels);
    displayAttractions(mockAttractions);
    displayMonuments(mockMonuments);
}