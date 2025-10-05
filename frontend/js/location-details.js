let map;
let markers = [];
let currentLocation = '';
let locationData = {};

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    loadLocationData();
    setupEventListeners();
});

// Map was removed from this page per requirements

function loadLocationData() {
    // Get location from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    currentLocation = urlParams.get('location') || 'Delhi';
    
    // Update page title
    document.getElementById('locationTitle').textContent = `Explore ${currentLocation}`;
    document.getElementById('locationDescription').textContent = `Discover the best hotels, attractions, and monuments in ${currentLocation}`;
    
    // Load data for all sections
    loadHotels();
    loadAttractions();
    loadMonuments();
    loadReviews();
}

function setupEventListeners() {
    // Hotel filters
    document.getElementById('hotelPriceFilter').addEventListener('change', filterHotels);
    document.getElementById('hotelRatingFilter').addEventListener('change', filterHotels);
    
    // Attraction filters
    document.getElementById('attractionTypeFilter').addEventListener('change', filterAttractions);
    
    // Review form
    document.getElementById('reviewForm').addEventListener('submit', submitReview);
}

// Tab functionality
function showTab(tabName) {
    // Hide all tab contents
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Remove active class from all tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Show selected tab content
    document.getElementById(tabName).classList.add('active');
    
    // Add active class to clicked button
    event.target.classList.add('active');
}

// Hotels functionality
async function loadHotels() {
    try {
        const response = await fetch(`http://localhost:8082/api/tourist/hotels/${encodeURIComponent(currentLocation)}`);
        if (!response.ok) {
            throw new Error(`Backend responded with ${response.status}`);
        }
        const data = await response.json();
        displayHotels(data.hotels || []);
    } catch (error) {
        console.error('Error loading hotels:', error);
        displayHotels(getMockHotels());
    }
}

function displayHotels(hotels) {
    const container = document.getElementById('hotelsList');
    container.innerHTML = '';
    
    hotels.forEach(hotel => {
        const card = createHotelCard(hotel);
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
                <div class="fact-item"><strong>Directions:</strong> <a href="${buildDirectionsLink(address, hotel.name)}" target="_blank" rel="noopener">Open in Maps</a></div>
            </div>
            
            <div class="amenities">
                ${(hotel.amenities || []).map(amenity => `<span class="amenity">${amenity}</span>`).join('')}
            </div>
            <div class="card-actions">
                <button class="btn-primary" onclick="viewHotelDetails('${hotel.id}')">View Details</button>
                <button class="btn-secondary" onclick="addToFavorites('${hotel.id}', 'hotel')">
                    <i class="fas fa-heart"></i> Save
                </button>
            </div>
        </div>
    `;
    return card;
}

// Attractions functionality
async function loadAttractions() {
    try {
        const response = await fetch(`http://localhost:8082/api/tourist/attractions/${encodeURIComponent(currentLocation)}`);
        if (!response.ok) {
            throw new Error(`Backend responded with ${response.status}`);
        }
        const data = await response.json();
        displayAttractions(data.attractions || []);
    } catch (error) {
        console.error('Error loading attractions:', error);
        displayAttractions(getMockAttractions());
    }
}

function displayAttractions(attractions) {
    const container = document.getElementById('attractionsList');
    container.innerHTML = '';
    
    attractions.forEach(attraction => {
        const card = createAttractionCard(attraction);
        container.appendChild(card);
    });
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
                <div class="fact-item"><strong>Directions:</strong> <a href="${buildDirectionsLink(address, attraction.name)}" target="_blank" rel="noopener">Open in Maps</a></div>
            </div>
            
            <div class="card-actions">
                <button class="btn-primary" onclick="viewAttractionDetails('${attraction.id}')">View Details</button>
                <button class="btn-secondary" onclick="addToFavorites('${attraction.id}', 'attraction')">
                    <i class="fas fa-heart"></i> Save
                </button>
            </div>
        </div>
    `;
    return card;
}

// Monuments functionality
async function loadMonuments() {
    try {
        const response = await fetch(`http://localhost:8082/api/tourist/monuments/${encodeURIComponent(currentLocation)}`);
        if (!response.ok) {
            throw new Error(`Backend responded with ${response.status}`);
        }
        const data = await response.json();
        displayMonuments(data.monuments || []);
    } catch (error) {
        console.error('Error loading monuments:', error);
        displayMonuments(getMockMonuments());
    }
}

function displayMonuments(monuments) {
    const container = document.getElementById('monumentsList');
    container.innerHTML = '';
    
    monuments.forEach(monument => {
        const card = createMonumentCard(monument);
        container.appendChild(card);
    });
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
                <div class="fact-item"><strong>Directions:</strong> <a href="${buildDirectionsLink(address, monument.name)}" target="_blank" rel="noopener">Open in Maps</a></div>
            </div>
            <div class="historical-info">
                <p><strong>Built:</strong> ${monument.builtYear || 'Unknown'}</p>
                <p><strong>Architecture:</strong> ${monument.architecture || 'Unknown'}</p>
            </div>
            <div class="card-actions">
                <button class="btn-primary" onclick="viewMonumentDetails('${monument.id}')">View Details</button>
                <button class="btn-secondary" onclick="addToFavorites('${monument.id}', 'monument')">
                    <i class="fas fa-heart"></i> Save
                </button>
            </div>
        </div>
    `;
    return card;
}

// Reviews functionality
async function loadReviews() {
    try {
        const response = await fetch(`http://localhost:8082/api/reviews/${encodeURIComponent(currentLocation)}`);
        if (!response.ok) {
            throw new Error(`Backend responded with ${response.status}`);
        }
        const data = await response.json();
        displayReviews(data.reviews || []);
    } catch (error) {
        console.error('Error loading reviews:', error);
        displayReviews(getMockReviews());
    }
}

function displayReviews(reviews) {
    const container = document.getElementById('reviewsList');
    container.innerHTML = '';
    
    if (reviews.length === 0) {
        container.innerHTML = '<p class="no-reviews">No reviews yet. Be the first to review this location!</p>';
        return;
    }
    
    reviews.forEach(review => {
        const reviewElement = createReviewElement(review);
        container.appendChild(reviewElement);
    });
}

function createReviewElement(review) {
    const reviewDiv = document.createElement('div');
    reviewDiv.className = 'review-item';
    reviewDiv.innerHTML = `
        <div class="review-header">
            <div class="reviewer-info">
                <div class="reviewer-avatar">
                    <i class="fas fa-user"></i>
                </div>
                <div class="reviewer-details">
                    <h5>${review.userName || 'Anonymous'}</h5>
                    <span class="review-date">${formatDate(review.createdAt)}</span>
                </div>
            </div>
            <div class="review-rating">
                ${generateStars(review.rating)}
            </div>
        </div>
        <div class="review-content">
            <p>${review.review}</p>
        </div>
    `;
    return reviewDiv;
}

// Review modal functionality
function showAddReviewForm() {
    document.getElementById('reviewModal').style.display = 'block';
}

function closeAddReviewForm() {
    document.getElementById('reviewModal').style.display = 'none';
    document.getElementById('reviewForm').reset();
}

async function submitReview(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const reviewData = {
        location: currentLocation,
        rating: parseInt(formData.get('rating')),
        review: formData.get('review')
    };
    
    try {
        const response = await fetch('http://localhost:8082/api/reviews', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(reviewData)
        });
        
        if (response.ok) {
            closeAddReviewForm();
            loadReviews(); // Reload reviews
            alert('Review submitted successfully!');
        } else {
            alert('Failed to submit review. Please try again.');
        }
    } catch (error) {
        console.error('Error submitting review:', error);
        alert('Error submitting review. Please try again.');
    }
}

// Filter functions
function filterHotels() {
    const priceFilter = document.getElementById('hotelPriceFilter').value;
    const ratingFilter = document.getElementById('hotelRatingFilter').value;
    
    const cards = document.querySelectorAll('.hotel-card');
    cards.forEach(card => {
        let show = true;
        
        // Add filtering logic here based on your data structure
        // This is a basic implementation
        
        card.style.display = show ? 'block' : 'none';
    });
}

function filterAttractions() {
    const typeFilter = document.getElementById('attractionTypeFilter').value;
    
    const cards = document.querySelectorAll('.attraction-card');
    cards.forEach(card => {
        let show = true;
        
        // Add filtering logic here based on your data structure
        // This is a basic implementation
        
        card.style.display = show ? 'block' : 'none';
    });
}

// Utility functions
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

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
    });
}

function buildDirectionsLink(address, name){
    const label = (name && name.trim()) ? name.trim() : '';
    if(!label) return '#';
    return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(label)}`;
}

function addToFavorites(id, type) {
    // Implement favorite functionality
    alert(`Added ${type} to favorites!`);
}

function viewHotelDetails(id) {
    alert(`Viewing hotel details for ID: ${id}`);
}

function viewAttractionDetails(id) {
    alert(`Viewing attraction details for ID: ${id}`);
}

function viewMonumentDetails(id) {
    alert(`Viewing monument details for ID: ${id}`);
}

// Mock data for demonstration
function getMockHotels() {
    const locationHotels = {
        'Delhi': [
            {
                id: '1',
                name: 'Taj Palace Hotel',
                price: '25000',
                rating: 4.8,
                address: 'Sardar Patel Marg, Diplomatic Enclave, New Delhi 110021',
                description: 'A luxury 5-star hotel in the heart of New Delhi, known for its Mughal-inspired architecture and world-class service. Features 403 rooms and suites with views of the city.',
                image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&q=80&ixlib=rb-4.0.3',
                amenities: ['Free WiFi', 'Swimming Pool', 'Spa & Wellness', 'Multiple Restaurants', 'Fitness Center', 'Business Center', 'Concierge', 'Valet Parking'],
                nearbyAttractions: ['India Gate (2.5 km)', 'Lotus Temple (8 km)', 'Red Fort (12 km)', 'Connaught Place (3 km)'],
                visitingInfo: {
                    checkIn: '2:00 PM',
                    checkOut: '12:00 PM',
                    parking: 'Valet Available',
                    airportDistance: '15 km (45 mins)',
                    stationDistance: '5 km (20 mins)'
                },
                quickFacts: {
                    'Built Year': '1983',
                    'Rooms': '403',
                    'Floors': '7',
                    'Architecture': 'Mughal-inspired',
                    'Awards': '5-star Luxury'
                }
            },
            {
                id: '2',
                name: 'The Leela Palace New Delhi',
                price: '18000',
                rating: 4.6,
                address: 'Chanakyapuri, New Delhi 110023',
                description: 'A luxury hotel inspired by Lutyens\' Delhi, featuring 254 rooms and suites. Known for its contemporary design and exceptional hospitality.',
                image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400&q=80&ixlib=rb-4.0.3',
                amenities: ['Free WiFi', 'Swimming Pool', 'Spa', 'Fine Dining', 'Fitness Center', 'Concierge', 'Airport Shuttle', 'Pet Friendly'],
                nearbyAttractions: ['Lotus Temple (6 km)', 'India Gate (4 km)', 'Humayun\'s Tomb (8 km)', 'Khan Market (3 km)'],
                visitingInfo: {
                    checkIn: '2:00 PM',
                    checkOut: '12:00 PM',
                    parking: 'Complimentary',
                    airportDistance: '12 km (35 mins)',
                    stationDistance: '8 km (25 mins)'
                },
                quickFacts: {
                    'Built Year': '2011',
                    'Rooms': '254',
                    'Floors': '6',
                    'Architecture': 'Contemporary',
                    'Awards': '5-star Luxury'
                }
            },
            {
                id: '3',
                name: 'Hotel Broadway',
                price: '3500',
                rating: 3.8,
                address: '4/15A Asaf Ali Road, New Delhi 110002',
                description: 'A heritage hotel in Old Delhi, offering comfortable accommodation near the Red Fort and Jama Masjid. Built in 1956, it combines old-world charm with modern amenities.',
                image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400&q=80&ixlib=rb-4.0.3',
                amenities: ['Free WiFi', 'AC', 'Restaurant', 'Room Service', 'Laundry Service', 'Airport Transfer'],
                nearbyAttractions: ['Red Fort (500 m)', 'Jama Masjid (800 m)', 'Chandni Chowk (1 km)', 'Raj Ghat (2 km)'],
                visitingInfo: {
                    checkIn: '12:00 PM',
                    checkOut: '11:00 AM',
                    parking: 'Limited',
                    airportDistance: '20 km (60 mins)',
                    stationDistance: '2 km (10 mins)'
                },
                quickFacts: {
                    'Built Year': '1956',
                    'Rooms': '45',
                    'Floors': '3',
                    'Architecture': 'Heritage',
                    'Awards': 'Heritage Hotel'
                }
            }
        ],
        'Mumbai': [
            {
                id: '1',
                name: 'Taj Mahal Palace',
                price: '35000',
                rating: 4.9,
                address: 'Apollo Bunder, Colaba, Mumbai 400001',
                description: 'A historic luxury hotel opened in 1903, overlooking the Gateway of India and Arabian Sea. This iconic hotel has hosted numerous dignitaries and celebrities, featuring 285 rooms with a blend of Indian and European architecture.',
                image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&q=80&ixlib=rb-4.0.3',
                amenities: ['Free WiFi', 'Swimming Pool', 'Spa & Wellness', 'Multiple Restaurants', 'Historic Architecture', 'Concierge', 'Valet Parking', 'Sea View'],
                nearbyAttractions: ['Gateway of India (100 m)', 'Marine Drive (2 km)', 'Colaba Causeway (500 m)', 'Elephanta Caves (Ferry)'],
                visitingInfo: {
                    checkIn: '2:00 PM',
                    checkOut: '12:00 PM',
                    parking: 'Valet Available',
                    airportDistance: '25 km (60 mins)',
                    stationDistance: '3 km (15 mins)'
                },
                quickFacts: {
                    'Built Year': '1903',
                    'Rooms': '285',
                    'Floors': '6',
                    'Architecture': 'Indo-Saracenic',
                    'Awards': 'Historic Luxury'
                }
            },
            {
                id: '2',
                name: 'The Oberoi Mumbai',
                price: '28000',
                rating: 4.7,
                address: 'Nariman Point, Mumbai 400021',
                description: 'A luxury hotel in the heart of Mumbai\'s business district, offering panoramic views of the Arabian Sea. Features 287 rooms and suites with contemporary design and world-class amenities.',
                image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400&q=80&ixlib=rb-4.0.3',
                amenities: ['Free WiFi', 'Swimming Pool', 'Spa', 'Fine Dining', 'Sea View', 'Business Center', 'Concierge', 'Airport Shuttle'],
                nearbyAttractions: ['Marine Drive (1 km)', 'Gateway of India (3 km)', 'Haji Ali Dargah (5 km)', 'Worli Sea Face (4 km)'],
                visitingInfo: {
                    checkIn: '2:00 PM',
                    checkOut: '12:00 PM',
                    parking: 'Valet Available',
                    airportDistance: '22 km (50 mins)',
                    stationDistance: '2 km (10 mins)'
                },
                quickFacts: {
                    'Built Year': '1986',
                    'Rooms': '287',
                    'Floors': '8',
                    'Architecture': 'Contemporary',
                    'Awards': '5-star Luxury'
                }
            }
        ]
    };
    
    return locationHotels[currentLocation] || [];
}

function getMockAttractions() {
    const locationAttractions = {
        'Delhi': [
            {
                id: '1',
                name: 'Red Fort',
                type: 'Historical',
                rating: 4.7,
                address: 'Netaji Subhash Marg, Lal Qila, Old Delhi, New Delhi 110006',
                description: 'Built by Mughal Emperor Shah Jahan in 1639, this UNESCO World Heritage Site served as the main residence of Mughal emperors for nearly 200 years, until 1857. The fort is made of red sandstone and covers an area of 254.67 acres.',
                image: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=400&q=80&ixlib=rb-4.0.3',
                nearbyAttractions: ['Jama Masjid (500 m)', 'Chandni Chowk (1 km)', 'Raj Ghat (2 km)', 'Jantar Mantar (3 km)'],
                visitingInfo: {
                    openingHours: '9:30 AM - 4:30 PM (Closed Mondays)',
                    entryFee: '₹50 (Indians), ₹500 (Foreigners)',
                    bestTime: 'October to March',
                    timeRequired: '2-3 hours'
                },
                quickFacts: {
                    'Built Year': '1639',
                    'Architecture': 'Mughal',
                    'UNESCO Status': 'World Heritage Site',
                    'Area': '254.67 acres',
                    'Material': 'Red Sandstone'
                }
            },
            {
                id: '2',
                name: 'India Gate',
                type: 'Monument',
                rating: 4.5,
                address: 'Rajpath, India Gate, New Delhi 110003',
                description: 'A 42-meter tall war memorial arch built in 1931 to honor the 70,000 Indian soldiers who died in World War I. Designed by Sir Edwin Lutyens, it is one of the largest war memorials in India.',
                image: 'https://images.unsplash.com/photo-1587474265384-2d1eef2878f5?w=400&q=80&ixlib=rb-4.0.3',
                nearbyAttractions: ['Rashtrapati Bhavan (2 km)', 'Connaught Place (3 km)', 'Lotus Temple (8 km)', 'Akshardham Temple (12 km)'],
                visitingInfo: {
                    openingHours: '24 hours (Daily)',
                    entryFee: 'Free',
                    bestTime: 'Evening (6-9 PM)',
                    timeRequired: '1-2 hours'
                },
                quickFacts: {
                    'Built Year': '1931',
                    'Height': '42 meters',
                    'Architect': 'Sir Edwin Lutyens',
                    'Purpose': 'War Memorial',
                    'Design': 'Triumphal Arch'
                }
            },
            {
                id: '3',
                name: 'Lotus Temple',
                type: 'Religious',
                rating: 4.6,
                address: 'Lotus Temple Rd, Bahapur, Shambhu Dayal Bagh, Kalkaji, New Delhi 110019',
                description: 'A Bahá\'í House of Worship completed in 1986, known for its flowerlike architecture. The temple has 27 free-standing marble-clad "petals" arranged in clusters of three to form nine sides.',
                image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&q=80&ixlib=rb-4.0.3',
                nearbyAttractions: ['Kalkaji Temple (1 km)', 'ISKCON Temple (3 km)', 'Okhla Bird Sanctuary (5 km)', 'Qutub Minar (8 km)'],
                visitingInfo: {
                    openingHours: '9:00 AM - 7:00 PM (Closed Mondays)',
                    entryFee: 'Free',
                    bestTime: 'Morning or Evening',
                    timeRequired: '1-2 hours'
                },
                quickFacts: {
                    'Built Year': '1986',
                    'Architecture': 'Modern',
                    'Material': 'White Marble',
                    'Petals': '27',
                    'Religion': 'Bahá\'í'
                }
            }
        ],
        'Mumbai': [
            {
                id: '1',
                name: 'Gateway of India',
                type: 'Monument',
                rating: 4.4,
                address: 'Apollo Bunder, Colaba, Mumbai 400001',
                description: 'A 26-meter tall arch-monument built in 1924 to commemorate the visit of King George V and Queen Mary to Mumbai in 1911. Designed by George Wittet in Indo-Saracenic style, it was the ceremonial entrance to India for British viceroys.',
                image: 'https://images.unsplash.com/photo-1587474265384-2d1eef2878f5?w=400&q=80&ixlib=rb-4.0.3',
                nearbyAttractions: ['Taj Mahal Palace (100 m)', 'Marine Drive (2 km)', 'Colaba Causeway (500 m)', 'Elephanta Caves (Ferry)'],
                visitingInfo: {
                    openingHours: '24 hours (Daily)',
                    entryFee: 'Free',
                    bestTime: 'Evening (5-8 PM)',
                    timeRequired: '1-2 hours'
                },
                quickFacts: {
                    'Built Year': '1924',
                    'Height': '26 meters',
                    'Architect': 'George Wittet',
                    'Style': 'Indo-Saracenic',
                    'Purpose': 'Commemorative'
                }
            },
            {
                id: '2',
                name: 'Marine Drive',
                type: 'Nature',
                rating: 4.3,
                address: 'Marine Drive, Mumbai 400020',
                description: 'A 3.6-kilometre-long boulevard in South Mumbai, also known as the "Queen\'s Necklace" due to its curved shape and street lights that resemble a string of pearls. It offers stunning views of the Arabian Sea and is a popular evening destination.',
                image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&q=80&ixlib=rb-4.0.3',
                nearbyAttractions: ['Gateway of India (2 km)', 'Haji Ali Dargah (3 km)', 'Worli Sea Face (4 km)', 'Juhu Beach (15 km)'],
                visitingInfo: {
                    openingHours: '24 hours (Daily)',
                    entryFee: 'Free',
                    bestTime: 'Evening (6-9 PM)',
                    timeRequired: '1-3 hours'
                },
                quickFacts: {
                    'Length': '3.6 km',
                    'Nickname': 'Queen\'s Necklace',
                    'Type': 'Boulevard',
                    'View': 'Arabian Sea',
                    'Best Time': 'Sunset'
                }
            }
        ]
    };
    
    return locationAttractions[currentLocation] || [];
}

function getMockMonuments() {
    const locationMonuments = {
        'Delhi': [
            {
                id: '1',
                name: 'Qutub Minar',
                rating: 4.6,
                address: 'Mehrauli, New Delhi 110030',
                description: 'A 73-meter tall brick minaret, the tallest in India, built between 1199-1220 by Qutub-ud-din Aibak and completed by Iltutmish. This UNESCO World Heritage Site is part of the Qutb complex and features five distinct storeys.',
                image: 'https://images.unsplash.com/photo-1587474265384-2d1eef2878f5?w=400&q=80&ixlib=rb-4.0.3',
                builtYear: '1199-1220',
                architecture: 'Indo-Islamic',
                nearbyAttractions: ['Iron Pillar (Same Complex)', 'Mehrauli Archaeological Park (1 km)', 'Sultan Ghari Tomb (2 km)', 'Lotus Temple (8 km)'],
                visitingInfo: {
                    openingHours: 'Sunrise to Sunset (Daily)',
                    entryFee: '₹40 (Indians), ₹600 (Foreigners)',
                    bestTime: 'October to March',
                    timeRequired: '2-3 hours'
                },
                quickFacts: {
                    'Height': '73 meters',
                    'Floors': '5',
                    'Material': 'Red Sandstone & Marble',
                    'UNESCO Status': 'World Heritage Site',
                    'Tallest': 'In India'
                }
            },
            {
                id: '2',
                name: 'Humayun\'s Tomb',
                rating: 4.5,
                address: 'Mathura Road, Nizamuddin, New Delhi 110013',
                description: 'The tomb of the Mughal Emperor Humayun, built in 1570 by his widow Bega Begum. This UNESCO World Heritage Site is considered the first garden-tomb on the Indian subcontinent and inspired the design of the Taj Mahal.',
                image: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=400&q=80&ixlib=rb-4.0.3',
                builtYear: '1570',
                architecture: 'Mughal',
                nearbyAttractions: ['Nizamuddin Dargah (500 m)', 'Purana Qila (2 km)', 'India Gate (4 km)', 'Lodi Gardens (3 km)'],
                visitingInfo: {
                    openingHours: 'Sunrise to Sunset (Daily)',
                    entryFee: '₹40 (Indians), ₹600 (Foreigners)',
                    bestTime: 'October to March',
                    timeRequired: '1-2 hours'
                },
                quickFacts: {
                    'Built For': 'Emperor Humayun',
                    'Architect': 'Mirak Mirza Ghiyas',
                    'UNESCO Status': 'World Heritage Site',
                    'Style': 'Garden Tomb',
                    'Inspiration': 'Taj Mahal Design'
                }
            }
        ],
        'Mumbai': [
            {
                id: '1',
                name: 'Gateway of India',
                rating: 4.4,
                address: 'Apollo Bunder, Colaba, Mumbai 400001',
                description: 'A 26-meter tall arch-monument built in 1924 to commemorate the visit of King George V and Queen Mary to Mumbai in 1911. Designed by George Wittet in Indo-Saracenic style, it was the ceremonial entrance to India for British viceroys and is now a symbol of Mumbai.',
                image: 'https://images.unsplash.com/photo-1587474265384-2d1eef2878f5?w=400&q=80&ixlib=rb-4.0.3',
                builtYear: '1924',
                architecture: 'Indo-Saracenic',
                nearbyAttractions: ['Taj Mahal Palace (100 m)', 'Marine Drive (2 km)', 'Colaba Causeway (500 m)', 'Elephanta Caves (Ferry)'],
                visitingInfo: {
                    openingHours: '24 hours (Daily)',
                    entryFee: 'Free',
                    bestTime: 'Evening (5-8 PM)',
                    timeRequired: '1-2 hours'
                },
                quickFacts: {
                    'Height': '26 meters',
                    'Architect': 'George Wittet',
                    'Purpose': 'Commemorative',
                    'Style': 'Indo-Saracenic',
                    'Symbol': 'Mumbai'
                }
            }
        ]
    };
    
    return locationMonuments[currentLocation] || [];
}

function getMockReviews() {
    return [
        {
            id: '1',
            userName: 'John Doe',
            rating: 5,
            review: 'Amazing place with rich history and beautiful architecture. Highly recommended!',
            createdAt: new Date().toISOString()
        },
        {
            id: '2',
            userName: 'Jane Smith',
            rating: 4,
            review: 'Great experience, but it was quite crowded during peak hours.',
            createdAt: new Date(Date.now() - 86400000).toISOString()
        }
    ];
}

        

        // Add filtering logic here based on your data structure

        // This is a basic implementation

        

        card.style.display = show ? 'block' : 'none';

    });

}



// Utility functions

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



function formatDate(dateString) {

    const date = new Date(dateString);

    return date.toLocaleDateString('en-US', { 

        year: 'numeric', 

        month: 'short', 

        day: 'numeric' 

    });

}



function addToFavorites(id, type) {

    // Implement favorite functionality

    alert(`Added ${type} to favorites!`);

}



function viewHotelDetails(id) {

    alert(`Viewing hotel details for ID: ${id}`);

}



function viewAttractionDetails(id) {

    alert(`Viewing attraction details for ID: ${id}`);

}



function viewMonumentDetails(id) {

    alert(`Viewing monument details for ID: ${id}`);

}



// Mock data for demonstration

function getMockHotels() {

    const locationHotels = {

        'Delhi': [

            {

                id: '1',

                name: 'Taj Palace Hotel',

                price: '25000',

                rating: 4.8,

                address: 'Sardar Patel Marg, Diplomatic Enclave, New Delhi 110021',

                description: 'A luxury 5-star hotel in the heart of New Delhi, known for its Mughal-inspired architecture and world-class service. Features 403 rooms and suites with views of the city.',

                image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&q=80&ixlib=rb-4.0.3',

                amenities: ['Free WiFi', 'Swimming Pool', 'Spa & Wellness', 'Multiple Restaurants', 'Fitness Center', 'Business Center', 'Concierge', 'Valet Parking'],

                nearbyAttractions: ['India Gate (2.5 km)', 'Lotus Temple (8 km)', 'Red Fort (12 km)', 'Connaught Place (3 km)'],

                visitingInfo: {

                    checkIn: '2:00 PM',

                    checkOut: '12:00 PM',

                    parking: 'Valet Available',

                    airportDistance: '15 km (45 mins)',

                    stationDistance: '5 km (20 mins)'

                },

                quickFacts: {

                    'Built Year': '1983',

                    'Rooms': '403',

                    'Floors': '7',

                    'Architecture': 'Mughal-inspired',

                    'Awards': '5-star Luxury'

                }

            },

            {

                id: '2',

                name: 'The Leela Palace New Delhi',

                price: '18000',

                rating: 4.6,

                address: 'Chanakyapuri, New Delhi 110023',

                description: 'A luxury hotel inspired by Lutyens\' Delhi, featuring 254 rooms and suites. Known for its contemporary design and exceptional hospitality.',

                image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400&q=80&ixlib=rb-4.0.3',

                amenities: ['Free WiFi', 'Swimming Pool', 'Spa', 'Fine Dining', 'Fitness Center', 'Concierge', 'Airport Shuttle', 'Pet Friendly'],

                nearbyAttractions: ['Lotus Temple (6 km)', 'India Gate (4 km)', 'Humayun\'s Tomb (8 km)', 'Khan Market (3 km)'],

                visitingInfo: {

                    checkIn: '2:00 PM',

                    checkOut: '12:00 PM',

                    parking: 'Complimentary',

                    airportDistance: '12 km (35 mins)',

                    stationDistance: '8 km (25 mins)'

                },

                quickFacts: {

                    'Built Year': '2011',

                    'Rooms': '254',

                    'Floors': '6',

                    'Architecture': 'Contemporary',

                    'Awards': '5-star Luxury'

                }

            },

            {

                id: '3',

                name: 'Hotel Broadway',

                price: '3500',

                rating: 3.8,

                address: '4/15A Asaf Ali Road, New Delhi 110002',

                description: 'A heritage hotel in Old Delhi, offering comfortable accommodation near the Red Fort and Jama Masjid. Built in 1956, it combines old-world charm with modern amenities.',

                image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400&q=80&ixlib=rb-4.0.3',

                amenities: ['Free WiFi', 'AC', 'Restaurant', 'Room Service', 'Laundry Service', 'Airport Transfer'],

                nearbyAttractions: ['Red Fort (500 m)', 'Jama Masjid (800 m)', 'Chandni Chowk (1 km)', 'Raj Ghat (2 km)'],

                visitingInfo: {

                    checkIn: '12:00 PM',

                    checkOut: '11:00 AM',

                    parking: 'Limited',

                    airportDistance: '20 km (60 mins)',

                    stationDistance: '2 km (10 mins)'

                },

                quickFacts: {

                    'Built Year': '1956',

                    'Rooms': '45',

                    'Floors': '3',

                    'Architecture': 'Heritage',

                    'Awards': 'Heritage Hotel'

                }

            }

        ],

        'Mumbai': [

            {

                id: '1',

                name: 'Taj Mahal Palace',

                price: '35000',

                rating: 4.9,

                address: 'Apollo Bunder, Colaba, Mumbai 400001',

                description: 'A historic luxury hotel opened in 1903, overlooking the Gateway of India and Arabian Sea. This iconic hotel has hosted numerous dignitaries and celebrities, featuring 285 rooms with a blend of Indian and European architecture.',

                image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&q=80&ixlib=rb-4.0.3',

                amenities: ['Free WiFi', 'Swimming Pool', 'Spa & Wellness', 'Multiple Restaurants', 'Historic Architecture', 'Concierge', 'Valet Parking', 'Sea View'],

                nearbyAttractions: ['Gateway of India (100 m)', 'Marine Drive (2 km)', 'Colaba Causeway (500 m)', 'Elephanta Caves (Ferry)'],

                visitingInfo: {

                    checkIn: '2:00 PM',

                    checkOut: '12:00 PM',

                    parking: 'Valet Available',

                    airportDistance: '25 km (60 mins)',

                    stationDistance: '3 km (15 mins)'

                },

                quickFacts: {

                    'Built Year': '1903',

                    'Rooms': '285',

                    'Floors': '6',

                    'Architecture': 'Indo-Saracenic',

                    'Awards': 'Historic Luxury'

                }

            },

            {

                id: '2',

                name: 'The Oberoi Mumbai',

                price: '28000',

                rating: 4.7,

                address: 'Nariman Point, Mumbai 400021',

                description: 'A luxury hotel in the heart of Mumbai\'s business district, offering panoramic views of the Arabian Sea. Features 287 rooms and suites with contemporary design and world-class amenities.',

                image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400&q=80&ixlib=rb-4.0.3',

                amenities: ['Free WiFi', 'Swimming Pool', 'Spa', 'Fine Dining', 'Sea View', 'Business Center', 'Concierge', 'Airport Shuttle'],

                nearbyAttractions: ['Marine Drive (1 km)', 'Gateway of India (3 km)', 'Haji Ali Dargah (5 km)', 'Worli Sea Face (4 km)'],

                visitingInfo: {

                    checkIn: '2:00 PM',

                    checkOut: '12:00 PM',

                    parking: 'Valet Available',

                    airportDistance: '22 km (50 mins)',

                    stationDistance: '2 km (10 mins)'

                },

                quickFacts: {

                    'Built Year': '1986',

                    'Rooms': '287',

                    'Floors': '8',

                    'Architecture': 'Contemporary',

                    'Awards': '5-star Luxury'

                }

            }

        ]

    };

    

    return locationHotels[currentLocation] || [];

}



function getMockAttractions() {

    const locationAttractions = {

        'Delhi': [

            {

                id: '1',

                name: 'Red Fort',

                type: 'Historical',

                rating: 4.7,

                address: 'Netaji Subhash Marg, Lal Qila, Old Delhi, New Delhi 110006',

                description: 'Built by Mughal Emperor Shah Jahan in 1639, this UNESCO World Heritage Site served as the main residence of Mughal emperors for nearly 200 years, until 1857. The fort is made of red sandstone and covers an area of 254.67 acres.',

                image: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=400&q=80&ixlib=rb-4.0.3',

                nearbyAttractions: ['Jama Masjid (500 m)', 'Chandni Chowk (1 km)', 'Raj Ghat (2 km)', 'Jantar Mantar (3 km)'],

                visitingInfo: {

                    openingHours: '9:30 AM - 4:30 PM (Closed Mondays)',

                    entryFee: '₹50 (Indians), ₹500 (Foreigners)',

                    bestTime: 'October to March',

                    timeRequired: '2-3 hours'

                },

                quickFacts: {

                    'Built Year': '1639',

                    'Architecture': 'Mughal',

                    'UNESCO Status': 'World Heritage Site',

                    'Area': '254.67 acres',

                    'Material': 'Red Sandstone'

                }

            },

            {

                id: '2',

                name: 'India Gate',

                type: 'Monument',

                rating: 4.5,

                address: 'Rajpath, India Gate, New Delhi 110003',

                description: 'A 42-meter tall war memorial arch built in 1931 to honor the 70,000 Indian soldiers who died in World War I. Designed by Sir Edwin Lutyens, it is one of the largest war memorials in India.',

                image: 'https://images.unsplash.com/photo-1587474265384-2d1eef2878f5?w=400&q=80&ixlib=rb-4.0.3',

                nearbyAttractions: ['Rashtrapati Bhavan (2 km)', 'Connaught Place (3 km)', 'Lotus Temple (8 km)', 'Akshardham Temple (12 km)'],

                visitingInfo: {

                    openingHours: '24 hours (Daily)',

                    entryFee: 'Free',

                    bestTime: 'Evening (6-9 PM)',

                    timeRequired: '1-2 hours'

                },

                quickFacts: {

                    'Built Year': '1931',

                    'Height': '42 meters',

                    'Architect': 'Sir Edwin Lutyens',

                    'Purpose': 'War Memorial',

                    'Design': 'Triumphal Arch'

                }

            },

            {

                id: '3',

                name: 'Lotus Temple',

                type: 'Religious',

                rating: 4.6,

                address: 'Lotus Temple Rd, Bahapur, Shambhu Dayal Bagh, Kalkaji, New Delhi 110019',

                description: 'A Bahá\'í House of Worship completed in 1986, known for its flowerlike architecture. The temple has 27 free-standing marble-clad "petals" arranged in clusters of three to form nine sides.',

                image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&q=80&ixlib=rb-4.0.3',

                nearbyAttractions: 'Kalkaji Temple (1 km)', 'ISKCON Temple (3 km)', 'Okhla Bird Sanctuary (5 km)', 'Qutub Minar (8 km)'],

                visitingInfo: {

                    openingHours: '9:00 AM - 7:00 PM (Closed Mondays)',

                    entryFee: 'Free',

                    bestTime: 'Morning or Evening',

                    timeRequired: '1-2 hours'

                },

                quickFacts: {

                    'Built Year': '1986',

                    'Architecture': 'Modern',

                    'Material': 'White Marble',

                    'Petals': '27',

                    'Religion': 'Bahá\'í'

                }

            }

        ],

        'Mumbai': [

            {

                id: '1',

                name: 'Gateway of India',

                type: 'Monument',

                rating: 4.4,

                address: 'Apollo Bunder, Colaba, Mumbai 400001',

                description: 'A 26-meter tall arch-monument built in 1924 to commemorate the visit of King George V and Queen Mary to Mumbai in 1911. Designed by George Wittet in Indo-Saracenic style, it was the ceremonial entrance to India for British viceroys.',

                image: 'https://images.unsplash.com/photo-1587474265384-2d1eef2878f5?w=400&q=80&ixlib=rb-4.0.3',

                nearbyAttractions: ['Taj Mahal Palace (100 m)', 'Marine Drive (2 km)', 'Colaba Causeway (500 m)', 'Elephanta Caves (Ferry)'],

                visitingInfo: {

                    openingHours: '24 hours (Daily)',

                    entryFee: 'Free',

                    bestTime: 'Evening (5-8 PM)',

                    timeRequired: '1-2 hours'

                },

                quickFacts: {

                    'Built Year': '1924',

                    'Height': '26 meters',

                    'Architect': 'George Wittet',

                    'Style': 'Indo-Saracenic',

                    'Purpose': 'Commemorative'

                }

            },

            {

                id: '2',

                name: 'Marine Drive',

                type: 'Nature',

                rating: 4.3,

                address: 'Marine Drive, Mumbai 400020',

                description: 'A 3.6-kilometre-long boulevard in South Mumbai, also known as the "Queen\'s Necklace" due to its curved shape and street lights that resemble a string of pearls. It offers stunning views of the Arabian Sea and is a popular evening destination.',

                image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&q=80&ixlib=rb-4.0.3',

                nearbyAttractions: ['Gateway of India (2 km)', 'Haji Ali Dargah (3 km)', 'Worli Sea Face (4 km)', 'Juhu Beach (15 km)'],

                visitingInfo: {

                    openingHours: '24 hours (Daily)',

                    entryFee: 'Free',

                    bestTime: 'Evening (6-9 PM)',

                    timeRequired: '1-3 hours'

                },

                quickFacts: {

                    'Length': '3.6 km',

                    'Nickname': 'Queen\'s Necklace',

                    'Type': 'Boulevard',

                    'View': 'Arabian Sea',

                    'Best Time': 'Sunset'

                }

            }

        ]

    };

    

    return locationAttractions[currentLocation] || [];

}



function getMockMonuments() {

    const locationMonuments = {

        'Delhi': [

            {

                id: '1',

                name: 'Qutub Minar',

                rating: 4.6,

                address: 'Mehrauli, New Delhi 110030',

                description: 'A 73-meter tall brick minaret, the tallest in India, built between 1199-1220 by Qutub-ud-din Aibak and completed by Iltutmish. This UNESCO World Heritage Site is part of the Qutb complex and features five distinct storeys.',

                image: 'https://images.unsplash.com/photo-1587474265384-2d1eef2878f5?w=400&q=80&ixlib=rb-4.0.3',

                builtYear: '1199-1220',

                architecture: 'Indo-Islamic',

                nearbyAttractions: ['Iron Pillar (Same Complex)', 'Mehrauli Archaeological Park (1 km)', 'Sultan Ghari Tomb (2 km)', 'Lotus Temple (8 km)'],

                visitingInfo: {

                    openingHours: 'Sunrise to Sunset (Daily)',

                    entryFee: '₹40 (Indians), ₹600 (Foreigners)',

                    bestTime: 'October to March',

                    timeRequired: '2-3 hours'

                },

                quickFacts: {

                    'Height': '73 meters',

                    'Floors': '5',

                    'Material': 'Red Sandstone & Marble',

                    'UNESCO Status': 'World Heritage Site',

                    'Tallest': 'In India'

                }

            },

            {

                id: '2',

                name: 'Humayun\'s Tomb',

                rating: 4.5,

                address: 'Mathura Road, Nizamuddin, New Delhi 110013',

                description: 'The tomb of the Mughal Emperor Humayun, built in 1570 by his widow Bega Begum. This UNESCO World Heritage Site is considered the first garden-tomb on the Indian subcontinent and inspired the design of the Taj Mahal.',

                image: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=400&q=80&ixlib=rb-4.0.3',

                builtYear: '1570',

                architecture: 'Mughal',

                nearbyAttractions: ['Nizamuddin Dargah (500 m)', 'Purana Qila (2 km)', 'India Gate (4 km)', 'Lodi Gardens (3 km)'],

                visitingInfo: {

                    openingHours: 'Sunrise to Sunset (Daily)',

                    entryFee: '₹40 (Indians), ₹600 (Foreigners)',

                    bestTime: 'October to March',

                    timeRequired: '1-2 hours'

                },

                quickFacts: {

                    'Built For': 'Emperor Humayun',

                    'Architect': 'Mirak Mirza Ghiyas',

                    'UNESCO Status': 'World Heritage Site',

                    'Style': 'Garden Tomb',

                    'Inspiration': 'Taj Mahal Design'

                }

            }

        ],

        'Mumbai': [

            {

                id: '1',

                name: 'Gateway of India',

                rating: 4.4,

                address: 'Apollo Bunder, Colaba, Mumbai 400001',

                description: 'A 26-meter tall arch-monument built in 1924 to commemorate the visit of King George V and Queen Mary to Mumbai in 1911. Designed by George Wittet in Indo-Saracenic style, it was the ceremonial entrance to India for British viceroys and is now a symbol of Mumbai.',

                image: 'https://images.unsplash.com/photo-1587474265384-2d1eef2878f5?w=400&q=80&ixlib=rb-4.0.3',

                builtYear: '1924',

                architecture: 'Indo-Saracenic',

                nearbyAttractions: ['Taj Mahal Palace (100 m)', 'Marine Drive (2 km)', 'Colaba Causeway (500 m)', 'Elephanta Caves (Ferry)'],

                visitingInfo: {

                    openingHours: '24 hours (Daily)',

                    entryFee: 'Free',

                    bestTime: 'Evening (5-8 PM)',

                    timeRequired: '1-2 hours'

                },

                quickFacts: {

                    'Height': '26 meters',

                    'Architect': 'George Wittet',

                    'Purpose': 'Commemorative',

                    'Style': 'Indo-Saracenic',

                    'Symbol': 'Mumbai'

                }

            }

        ]

    };

    

    return locationMonuments[currentLocation] || [];

}



function getMockReviews() {

    return [

        {

            id: '1',

            userName: 'John Doe',

            rating: 5,

            review: 'Amazing place with rich history and beautiful architecture. Highly recommended!',

            createdAt: new Date().toISOString()

        },

        {

            id: '2',

            userName: 'Jane Smith',

            rating: 4,

            review: 'Great experience, but it was quite crowded during peak hours.',

            createdAt: new Date(Date.now() - 86400000).toISOString()

        }

    ];

}


