let map;
let monumentData = {};

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    loadMonumentData();
    initializeMap();
});

function loadMonumentData() {
    // Get monument ID and name from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const monumentId = urlParams.get('id');
    const monumentName = urlParams.get('name');
    
    // Update page title
    document.getElementById('monumentName').textContent = monumentName || 'Monument Details';
    document.getElementById('monumentTitle').textContent = monumentName || 'Monument Name';
    
    // Load monument data
    loadMonumentDetails(monumentId, monumentName);
}

async function loadMonumentDetails(monumentId, monumentName) {
    try {
        // Try to fetch from backend first
        const response = await fetch(`http://localhost:8082/api/tourist/monuments/details/${monumentId}`);
        if (response.ok) {
            monumentData = await response.json();
        } else {
            // Fallback to mock data
            monumentData = getMockMonumentData(monumentId, monumentName);
        }
    } catch (error) {
        console.error('Error loading monument details:', error);
        monumentData = getMockMonumentData(monumentId, monumentName);
    }
    
    displayMonumentDetails();
}

function getMockMonumentData(monumentId, monumentName) {
    const mockMonuments = {
        '1': {
            id: '1',
            name: 'Qutub Minar',
            rating: 4.6,
            address: 'Mehrauli, New Delhi 110030',
            description: 'The Qutub Minar is a 73-meter tall brick minaret, the tallest in India, built between 1199-1220 by Qutub-ud-din Aibak and completed by Iltutmish. This UNESCO World Heritage Site is part of the Qutb complex in the Mehrauli area of New Delhi. The minaret features five distinct storeys with intricate carvings and inscriptions, and it can be seen from most parts of the city. The complex also includes the Iron Pillar, which has not rusted for over 1600 years.',
            images: [
                'https://images.unsplash.com/photo-1587474265384-2d1eef2878f5?w=600&q=80&ixlib=rb-4.0.3',
                'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=600&q=80&ixlib=rb-4.0.3',
                'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600&q=80&ixlib=rb-4.0.3'
            ],
            reviews: [
                {
                    userName: 'Amit Kumar',
                    rating: 5,
                    review: 'Absolutely magnificent! The Qutub Minar is a true architectural marvel. The intricate carvings and the height are breathtaking.',
                    date: '2024-01-22'
                },
                {
                    userName: 'Sneha Reddy',
                    rating: 4,
                    review: 'Great historical monument with rich heritage. The audio guide was very informative about the history.',
                    date: '2024-01-20'
                },
                {
                    userName: 'David Wilson',
                    rating: 5,
                    review: 'Incredible UNESCO World Heritage site! The architecture is stunning and the history is fascinating.',
                    date: '2024-01-18'
                }
            ],
            coordinates: [28.5244, 77.1855], // Qutub Minar coordinates
            historicalInfo: {
                builtYear: '1199-1220 AD',
                architecture: 'Indo-Islamic',
                builtBy: 'Qutub-ud-din Aibak (started), Iltutmish (completed)',
                height: '73 meters (239 feet)'
            }
        }
    };
    
    return mockMonuments[monumentId] || {
        id: monumentId,
        name: monumentName || 'Monument',
        rating: 4.0,
        address: 'Monument Address',
        description: 'A significant historical monument with great architectural and cultural importance.',
        images: ['https://images.unsplash.com/photo-1587474265384-2d1eef2878f5?w=600'],
        reviews: [],
        coordinates: [28.6139, 77.2090],
        historicalInfo: {
            builtYear: 'Unknown',
            architecture: 'Traditional',
            builtBy: 'Unknown',
            height: 'Unknown'
        }
    };
}

function displayMonumentDetails() {
    // Update basic info
    document.getElementById('monumentTitle').textContent = monumentData.name;
    document.getElementById('monumentRating').textContent = monumentData.rating;
    document.getElementById('monumentAddress').textContent = monumentData.address;
    document.getElementById('monumentDescription').textContent = monumentData.description;
    const directionsLink = document.getElementById('monumentDirectionsLink');
    if (directionsLink) {
        if (monumentData.name && monumentData.name.trim()) {
            directionsLink.href = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(monumentData.name.trim())}`;
        } else if (monumentData.coordinates && monumentData.coordinates.length === 2) {
            const [lat, lng] = monumentData.coordinates;
            directionsLink.href = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(lat + ',' + lng)}`;
        }
    }
    
    // Update stars
    const starsContainer = document.getElementById('monumentStars');
    starsContainer.innerHTML = generateStars(monumentData.rating);
    
    // Update main image
    if (monumentData.images && monumentData.images.length > 0) {
        document.getElementById('mainImage').src = monumentData.images[0];
    }
    
    // Update thumbnails
    const thumbnailsContainer = document.querySelector('.image-thumbnails');
    thumbnailsContainer.innerHTML = '';
    if (monumentData.images) {
        monumentData.images.forEach((image, index) => {
            const thumbnail = document.createElement('img');
            thumbnail.className = `thumbnail ${index === 0 ? 'active' : ''}`;
            thumbnail.src = image.replace('w=600', 'w=150');
            thumbnail.onclick = () => changeMainImage(image);
            thumbnailsContainer.appendChild(thumbnail);
        });
    }
    
    // Update historical information
    if (monumentData.historicalInfo) {
        document.getElementById('builtYear').textContent = monumentData.historicalInfo.builtYear;
        document.getElementById('architecture').textContent = monumentData.historicalInfo.architecture;
        document.getElementById('builtBy').textContent = monumentData.historicalInfo.builtBy;
        document.getElementById('height').textContent = monumentData.historicalInfo.height;
    }
    
    // Update reviews
    displayReviews(monumentData.reviews);
    
    // Update map
    if (monumentData.coordinates) {
        updateMap(monumentData.coordinates);
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
                const resp = await fetch(`http://localhost:8082/api/monument/${encodeURIComponent(monumentData.id || 'unknown')}/reviews`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ rating, text })
                });
                if (resp.ok) {
                    try {
                        await fetch('http://localhost:8082/api/reviews', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ rating, review: text, location: monumentData.name || 'Unknown' })
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
        container.innerHTML = '<p class="no-reviews">No reviews yet. Be the first to review this monument!</p>';
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
    map = L.map('monumentMap').setView([28.6139, 77.2090], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);
}

function updateMap(coordinates) {
    if (map && coordinates) {
        map.setView(coordinates, 15);
        L.marker(coordinates).addTo(map)
            .bindPopup(`<b>${monumentData.name}</b><br>${monumentData.address}`)
            .openPopup();
    }
}

function planVisit() {
    alert(`Planning visit to ${monumentData.name}. This would open route planning and booking options.`);
}

function bookGuide() {
    alert(`Booking a guide for ${monumentData.name}. This would open guide booking options.`);
}
