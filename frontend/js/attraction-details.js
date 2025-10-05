let map;
let attractionData = {};

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    loadAttractionData();
    initializeMap();
});

function loadAttractionData() {
    // Get attraction ID and name from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const attractionId = urlParams.get('id');
    const attractionName = urlParams.get('name');
    
    // Update page title
    document.getElementById('attractionName').textContent = attractionName || 'Attraction Details';
    document.getElementById('attractionTitle').textContent = attractionName || 'Attraction Name';
    
    // Load attraction data
    loadAttractionDetails(attractionId, attractionName);
}

async function loadAttractionDetails(attractionId, attractionName) {
    try {
        // Try to fetch from backend first
        const response = await fetch(`http://localhost:8082/api/tourist/attractions/details/${attractionId}`);
        if (response.ok) {
            attractionData = await response.json();
        } else {
            // Fallback to mock data
            attractionData = getMockAttractionData(attractionId, attractionName);
        }
    } catch (error) {
        console.error('Error loading attraction details:', error);
        attractionData = getMockAttractionData(attractionId, attractionName);
    }
    
    displayAttractionDetails();
}

function getMockAttractionData(attractionId, attractionName) {
    const mockAttractions = {
        '1': {
            id: '1',
            name: 'Red Fort',
            type: 'Historical',
            rating: 4.7,
            address: 'Netaji Subhash Marg, Lal Qila, Old Delhi, New Delhi 110006',
            description: 'The Red Fort is a historic fort in the city of Delhi in India, built by Mughal Emperor Shah Jahan in 1639. It was the main residence of the emperors of the Mughal dynasty for nearly 200 years, until 1857. This UNESCO World Heritage Site covers an area of 254.67 acres and represents the peak in Mughal architecture, combining Persian palace architecture with Indian traditions. The fort is made of red sandstone and features impressive structures like the Diwan-i-Aam and Diwan-i-Khas.',
            images: [
                'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=600&q=80&ixlib=rb-4.0.3',
                'https://images.unsplash.com/photo-1587474265384-2d1eef2878f5?w=600&q=80&ixlib=rb-4.0.3',
                'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600&q=80&ixlib=rb-4.0.3'
            ],
            reviews: [
                {
                    userName: 'Priya Sharma',
                    rating: 5,
                    review: 'Absolutely magnificent! The architecture is breathtaking and the history is fascinating. A must-visit in Delhi.',
                    date: '2024-01-20'
                },
                {
                    userName: 'Raj Patel',
                    rating: 4,
                    review: 'Great historical site with beautiful architecture. The audio guide was very informative.',
                    date: '2024-01-18'
                },
                {
                    userName: 'Emily Chen',
                    rating: 5,
                    review: 'Incredible place with rich history. The light show in the evening is spectacular!',
                    date: '2024-01-15'
                }
            ],
            coordinates: [28.6562, 77.2410], // Red Fort coordinates
            visitingInfo: {
                openingHours: '9:00 AM - 6:00 PM',
                entryFee: '₹50 for adults, ₹25 for children',
                bestTime: 'October to March',
                parking: 'Available nearby'
            }
        }
    };
    
    return mockAttractions[attractionId] || {
        id: attractionId,
        name: attractionName || 'Attraction',
        type: 'Tourist Spot',
        rating: 4.0,
        address: 'Attraction Address',
        description: 'A wonderful attraction with great historical and cultural significance.',
        images: ['https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=600'],
        reviews: [],
        coordinates: [28.6139, 77.2090],
        visitingInfo: {
            openingHours: '9:00 AM - 5:00 PM',
            entryFee: '₹30 for adults',
            bestTime: 'All year round',
            parking: 'Available'
        }
    };
}

function displayAttractionDetails() {
    // Update basic info
    document.getElementById('attractionTitle').textContent = attractionData.name;
    document.getElementById('attractionType').textContent = attractionData.type;
    document.getElementById('attractionRating').textContent = attractionData.rating;
    document.getElementById('attractionAddress').textContent = attractionData.address;
    document.getElementById('attractionDescription').textContent = attractionData.description;
    const directionsLink = document.getElementById('attractionDirectionsLink');
    if (directionsLink) {
        if (attractionData.name && attractionData.name.trim()) {
            directionsLink.href = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(attractionData.name.trim())}`;
        } else if (attractionData.coordinates && attractionData.coordinates.length === 2) {
            const [lat, lng] = attractionData.coordinates;
            directionsLink.href = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(lat + ',' + lng)}`;
        }
    }
    
    // Update stars
    const starsContainer = document.getElementById('attractionStars');
    starsContainer.innerHTML = generateStars(attractionData.rating);
    
    // Update main image
    if (attractionData.images && attractionData.images.length > 0) {
        document.getElementById('mainImage').src = attractionData.images[0];
    }
    
    // Update thumbnails
    const thumbnailsContainer = document.querySelector('.image-thumbnails');
    thumbnailsContainer.innerHTML = '';
    if (attractionData.images) {
        attractionData.images.forEach((image, index) => {
            const thumbnail = document.createElement('img');
            thumbnail.className = `thumbnail ${index === 0 ? 'active' : ''}`;
            thumbnail.src = image.replace('w=600', 'w=150');
            thumbnail.onclick = () => changeMainImage(image);
            thumbnailsContainer.appendChild(thumbnail);
        });
    }
    
    // Update visiting information
    if (attractionData.visitingInfo) {
        const infoItems = document.querySelectorAll('.info-item');
        if (infoItems.length >= 4) {
            infoItems[0].querySelector('p').textContent = attractionData.visitingInfo.openingHours;
            infoItems[1].querySelector('p').textContent = attractionData.visitingInfo.entryFee;
            infoItems[2].querySelector('p').textContent = attractionData.visitingInfo.bestTime;
            infoItems[3].querySelector('p').textContent = attractionData.visitingInfo.parking;
        }
    }
    
    // Update reviews
    displayReviews(attractionData.reviews);
    
    // Update map
    if (attractionData.coordinates) {
        updateMap(attractionData.coordinates);
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
                const resp = await fetch(`http://localhost:8082/api/attraction/${encodeURIComponent(attractionData.id || 'unknown')}/reviews`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ rating, text })
                });
                if (resp.ok) {
                    // Also save a location-level review for aggregation if name present
                    try {
                        await fetch('http://localhost:8082/api/reviews', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ rating, review: text, location: attractionData.name || 'Unknown' })
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
        container.innerHTML = '<p class="no-reviews">No reviews yet. Be the first to review this attraction!</p>';
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
    map = L.map('attractionMap').setView([28.6139, 77.2090], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);
}

function updateMap(coordinates) {
    if (map && coordinates) {
        map.setView(coordinates, 15);
        L.marker(coordinates).addTo(map)
            .bindPopup(`<b>${attractionData.name}</b><br>${attractionData.address}`)
            .openPopup();
    }
}

function planVisit() {
    alert(`Planning visit to ${attractionData.name}. This would open route planning and booking options.`);
}

function shareAttraction() {
    if (navigator.share) {
        navigator.share({
            title: attractionData.name,
            text: `Check out ${attractionData.name} - ${attractionData.description}`,
            url: window.location.href
        });
    } else {
        // Fallback for browsers that don't support Web Share API
        navigator.clipboard.writeText(window.location.href).then(() => {
            alert('Link copied to clipboard!');
        });
    }
}
