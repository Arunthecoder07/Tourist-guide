let map = L.map('map').setView([22.9734,78.6569],5);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution:'© OpenStreetMap contributors'
}).addTo(map);

let indiaBounds=[[6.5546,68.1114],[37.0970,97.3956]];
map.setMaxBounds(indiaBounds);
map.on('drag',()=>{ map.panInsideBounds(indiaBounds,{animate:true}); });

let markers=[];

async function searchCity(){
    let city=document.getElementById("cityInput").value;
    let title=document.getElementById("resultsTitle");
    let list=document.getElementById("spotsList");

    if(!city){ alert("Enter city!"); return; }

    list.innerHTML="";
    title.style.display="block";
    title.textContent=`Searching tourist places in "${city}"...`;

    markers.forEach(m=>map.removeLayer(m));
    markers=[];

    try{
        // Fetch attractions via backend Google Places proxy
        let response=await fetch(`/api/places/attractions/${encodeURIComponent(city)}`);
        if(!response.ok){
            const text = await response.text();
            throw new Error(text || `Request failed: ${response.status}`);
        }
        let data=await response.json();

        const results = data.results || [];
        if(results.length===0){
            title.textContent=`No tourist attractions found in "${city}" 😢`;
            return;
        }

        title.textContent=`Tourist attractions in "${city}":`;
        let bounds=[];

        results.forEach(place=>{
            const location = (place.geometry && place.geometry.location) || {};
            let lat=location.lat;
            let lon=location.lng;
            if(!lat||!lon) return;

            let name=place.name || "Unnamed";
            let type=(place.types && place.types[0]) || "Tourist Spot";

            let card=document.createElement("div");
            card.className="card";
            const address = place.formatted_address || (place.vicinity || "Address not available");
            const priceLevel = (place.price_level!=null)? `${'₹'.repeat(place.price_level)} (${place.price_level})` : 'N/A';
            const rating = place.rating || 0;
            card.innerHTML=`
                <h3>${name}</h3>
                <div class="rating">${'★'.repeat(Math.round(rating))} <span class="rating-text">${rating}/5</span></div>
                <p><strong>Address:</strong> ${address}</p>
                <div class="facts-grid">
                    <div class="fact-item"><strong>Rents/Entry:</strong> ${priceLevel}</div>
                    <div class="fact-item"><strong>Directions:</strong> <a href="${buildDirectionsLink(address)}" target="_blank" rel="noopener">Open in Maps</a></div>
                </div>
            `;
            list.appendChild(card);

            let marker=L.marker([lat,lon]).addTo(map);
            marker.bindPopup(`<b>${name}</b><br>${address}`);
            markers.push(marker);

            bounds.push([lat,lon]);
        });

        if(bounds.length>0) map.fitBounds(bounds);

    }catch(error){
        console.error("Error:",error);
        title.textContent="Error fetching data. Try again later.";
    }
}


