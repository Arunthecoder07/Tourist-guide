let map;
let hotelData = {};

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    loadHotelData();
    initializeMap();
});

function loadHotelData() {
    // Get hotel ID and name from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const hotelId = urlParams.get('id');
    const hotelName = urlParams.get('name');
    
    // Update page title
    document.getElementById('hotelName').textContent = hotelName || 'Hotel Details';
    document.getElementById('hotelTitle').textContent = hotelName || 'Hotel Name';
    
    // Load hotel data (in a real app, this would be fetched from the backend)
    loadHotelDetails(hotelId, hotelName);
}

async function loadHotelDetails(hotelId, hotelName) {
    try {
        // Try to fetch from backend first
        const response = await fetch(`http://localhost:8082/api/tourist/hotels/details/${hotelId}`);
        if (response.ok) {
            hotelData = await response.json();
        } else {
            // Fallback to mock data
            hotelData = getMockHotelData(hotelId, hotelName);
        }
    } catch (error) {
        console.error('Error loading hotel details:', error);
        hotelData = getMockHotelData(hotelId, hotelName);
    }
    
    displayHotelDetails();
}

function getMockHotelData(hotelId, hotelName) {
    const mockHotels = {
        '1': {
            id: '1',
            name: 'Taj Palace Hotel',
            price: '25000',
            rating: 4.8,
            address: 'Sardar Patel Marg, Diplomatic Enclave, New Delhi 110021',
            description: 'Experience luxury at its finest at Taj Palace Hotel, New Delhi. This iconic 5-star hotel offers 403 rooms and suites with Mughal-inspired architecture and world-class amenities. Located in the heart of the capital\'s diplomatic enclave, it provides easy access to major attractions and business districts. The hotel features multiple award-winning restaurants, a spa, and exceptional service.',
            images: [
                'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&q=80&ixlib=rb-4.0.3',
                'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=600&q=80&ixlib=rb-4.0.3',
                'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&q=80&ixlib=rb-4.0.3',
                'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600&q=80&ixlib=rb-4.0.3'
            ],
            amenities: [
                { name: 'Free WiFi', icon: 'fas fa-wifi' },
                { name: 'Swimming Pool', icon: 'fas fa-swimming-pool' },
                { name: 'Spa & Wellness', icon: 'fas fa-spa' },
                { name: 'Restaurant', icon: 'fas fa-utensils' },
                { name: 'Fitness Center', icon: 'fas fa-dumbbell' },
                { name: 'Concierge', icon: 'fas fa-concierge-bell' },
                { name: 'Room Service', icon: 'fas fa-bed' },
                { name: 'Parking', icon: 'fas fa-parking' }
            ],
            reviews: [
                {
                    userName: 'John Smith',
                    rating: 5,
                    review: 'Absolutely amazing hotel! The service was impeccable and the rooms were luxurious. Highly recommended!',
                    date: '2024-01-15'
                },
                {
                    userName: 'Sarah Johnson',
                    rating: 4,
                    review: 'Great location and beautiful property. The staff was very helpful and accommodating.',
                    date: '2024-01-10'
                },
                {
                    userName: 'Mike Wilson',
                    rating: 5,
                    review: 'Perfect stay! The amenities were top-notch and the food was delicious.',
                    date: '2024-01-08'
                }
            ],
            coordinates: [28.6139, 77.2090] // Delhi coordinates
        }
    };
    
    return mockHotels[hotelId] || {
        id: hotelId,
        name: hotelName || 'Hotel',
        price: '8000',
        rating: 4.0,
        address: 'Hotel Address',
        description: 'A wonderful hotel with great amenities and excellent service.',
        images: ['https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600'],
        amenities: [
            { name: 'Free WiFi', icon: 'fas fa-wifi' },
            { name: 'Restaurant', icon: 'fas fa-utensils' },
            { name: 'Parking', icon: 'fas fa-parking' }
        ],
        reviews: [],
        coordinates: [28.6139, 77.2090]
    };
}

function displayHotelDetails() {
    // Update basic info
    document.getElementById('hotelTitle').textContent = hotelData.name;
    document.getElementById('hotelPrice').textContent = `₹${hotelData.price}`;
    document.getElementById('hotelRating').textContent = hotelData.rating;
    document.getElementById('hotelAddress').textContent = hotelData.address;
    document.getElementById('hotelDescription').textContent = hotelData.description;
    const directionsLink = document.getElementById('hotelDirectionsLink');
    if (directionsLink) {
        if (hotelData.name && hotelData.name.trim()) {
            directionsLink.href = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(hotelData.name.trim())}`;
        } else if (hotelData.coordinates && hotelData.coordinates.length === 2) {
            const [lat, lng] = hotelData.coordinates;
            directionsLink.href = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(lat + ',' + lng)}`;
        }
    }
    
    // Update stars
    const starsContainer = document.getElementById('hotelStars');
    starsContainer.innerHTML = generateStars(hotelData.rating);
    
    // Update main image
    if (hotelData.images && hotelData.images.length > 0) {
        document.getElementById('mainImage').src = hotelData.images[0];
    }
    
    // Update thumbnails
    const thumbnailsContainer = document.querySelector('.image-thumbnails');
    thumbnailsContainer.innerHTML = '';
    if (hotelData.images) {
        hotelData.images.forEach((image, index) => {
            const thumbnail = document.createElement('img');
            thumbnail.className = `thumbnail ${index === 0 ? 'active' : ''}`;
            thumbnail.src = image.replace('w=600', 'w=150');
            thumbnail.onclick = () => changeMainImage(image);
            thumbnailsContainer.appendChild(thumbnail);
        });
    }
    
    // Update amenities
    const amenitiesContainer = document.getElementById('amenitiesList');
    amenitiesContainer.innerHTML = '';
    hotelData.amenities.forEach(amenity => {
        const amenityElement = document.createElement('div');
        amenityElement.className = 'amenity-item';
        amenityElement.innerHTML = `
            <i class="${amenity.icon}"></i>
            <span>${amenity.name}</span>
        `;
        amenitiesContainer.appendChild(amenityElement);
    });
    
    // Update reviews
    displayReviews(hotelData.reviews);
    
    // Update map
    if (hotelData.coordinates) {
        updateMap(hotelData.coordinates);
    }

    // Hook up add review form
    const addForm = document.getElementById('addReviewForm');
    if (addForm) {
        addForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const rating = parseInt(document.getElementById('reviewRating').value, 10);
            const text = document.getElementById('reviewText').value.trim();
            if (!rating || !text) return;
            try {
                const userName = localStorage.getItem('userName') || 'Anonymous User';
                const resp = await fetch(`http://localhost:8082/api/hotel/${encodeURIComponent(hotelData.id || 'unknown')}/reviews`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ rating, text })
                });
                if (resp.ok) {
                    try {
                        await fetch('http://localhost:8082/api/reviews', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ rating, review: text, location: hotelData.name || 'Unknown' })
                        });
                    } catch {}
                    alert('Review submitted');
                    location.reload();
                } else {
                    alert('Failed to submit review');
                }
            } catch(err) {
                console.error(err);
                alert('Error submitting review');
            }
        });
    }
}

function displayReviews(reviews) {
    const container = document.getElementById('reviewsContainer');
    container.innerHTML = '';
    
    if (reviews.length === 0) {
        container.innerHTML = '<p class="no-reviews">No reviews yet. Be the first to review this hotel!</p>';
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
                    <h5>${review.userName}</h5>
                    <span class="review-date">${formatDate(review.date)}</span>
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

function changeMainImage(imageSrc) {
    document.getElementById('mainImage').src = imageSrc;
    
    // Update active thumbnail
    document.querySelectorAll('.thumbnail').forEach(thumb => {
        thumb.classList.remove('active');
    });
    event.target.classList.add('active');
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

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
}

function initializeMap() {
    map = L.map('hotelMap').setView([28.6139, 77.2090], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);
}

function updateMap(coordinates) {
    if (map && coordinates) {
        map.setView(coordinates, 15);
        L.marker(coordinates).addTo(map)
            .bindPopup(`<b>${hotelData.name}</b><br>${hotelData.address}`)
            .openPopup();
    }
}

function bookHotel() {
    alert(`Booking ${hotelData.name} for ₹${hotelData.price} per night. This would redirect to booking system.`);
}

function contactHotel() {
    alert(`Contacting ${hotelData.name}. This would open contact information.`);
}
