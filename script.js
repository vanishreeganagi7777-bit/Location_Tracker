const socket = io();
const map = L.map("map").setView([20.5937, 78.9629], 5);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "OpenStreetMap"
}).addTo(map);

const markers = {};
const statusBox = document.getElementById("status");

function updateMarker(id, latitude, longitude) {
    if (typeof latitude !== "number" || typeof longitude !== "number") {
        return;
    }

    const latlng = [latitude, longitude];

    if (markers[id]) {
        markers[id].setLatLng(latlng);
    } else {
        markers[id] = L.marker(latlng).addTo(map);
    }

    if (id === socket.id) {
        map.setView(latlng, 16);
    }
}

function showStatus(message) {
    if (statusBox) {
        statusBox.textContent = message;
    }
}

socket.on("connect", () => {
    showStatus("Connected. Waiting for location access...");

    if (navigator.geolocation) {
        navigator.geolocation.watchPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                showStatus(`Location received: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
                socket.emit("send-location", { latitude, longitude });
            },
            (error) => {
                console.error("Geolocation error:", error);
                showStatus("Location access was denied or unavailable.");
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            }
        );
    } else {
        showStatus("Geolocation is not supported in this browser.");
    }
});

socket.on("receive-location", (data) => {
    const { id, latitude, longitude } = data;
    updateMarker(id, latitude, longitude);
});

socket.on("user-disconnected", (id) => {
    if (markers[id]) {
        map.removeLayer(markers[id]);
        delete markers[id];
    }
});