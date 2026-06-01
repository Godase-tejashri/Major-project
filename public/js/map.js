
const map = L.map('map').setView([18.5204, 73.8567], 13);

// OpenStreetMap
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);


L.marker([18.5204, 73.8567]).addTo(map)
    .bindPopup('<b><%= listing.location %></b><br>Welcome to Wanderlust!')
    .openPopup();