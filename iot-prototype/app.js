// --- Realtime Clock ---
function updateClock() {
    const now = new Date();
    // Memformat jam (HH:MM:SS)
    const timeString = now.toLocaleTimeString('id-ID', { 
        hour12: false, 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit' 
    });
    document.getElementById('realtime-clock').textContent = timeString;
}
setInterval(updateClock, 1000);
updateClock(); // Inisialisasi

// --- Connect / Disconnect Device ---
const btnConnect = document.getElementById('btn-connect');
const connStatus = document.getElementById('conn-status');
const connText = document.getElementById('conn-text');
const signalVal = document.getElementById('signal-val');

let isConnected = false;

btnConnect.addEventListener('click', () => {
    isConnected = !isConnected;
    if(isConnected) {
        // State: Connected
        btnConnect.textContent = 'Disconnect Device';
        btnConnect.style.background = 'var(--danger)';
        btnConnect.style.color = '#fff';
        connStatus.classList.remove('disconnected');
        connStatus.classList.add('connected');
        connText.textContent = 'Terhubung';
        signalVal.textContent = 'Kuat (Online)';
        signalVal.style.color = 'var(--success)';
        
        // Centering map to marker on connect
        if(marker) map.panTo(marker.getLatLng());
        
    } else {
        // State: Disconnected
        btnConnect.textContent = 'Connect Device';
        btnConnect.style.background = 'var(--accent)';
        btnConnect.style.color = '#0f172a';
        connStatus.classList.remove('connected');
        connStatus.classList.add('disconnected');
        connText.textContent = 'Terputus';
        signalVal.textContent = 'Tidak Ada Sinyal';
        signalVal.style.color = 'var(--text-secondary)';
    }
});

// --- Volume Control ---
const volumeSlider = document.getElementById('volume-slider');
const volumeValue = document.getElementById('volume-value');

volumeSlider.addEventListener('input', (e) => {
    volumeValue.textContent = e.target.value;
    // Disini panggilan API untuk set volume via MQTT/WebSocket bisa ditambahkan
    // console.log("Set volume to: ", e.target.value);
});

// --- Alarm Management ---
const alarmTime = document.getElementById('alarm-time');
const addAlarmBtn = document.getElementById('add-alarm-btn');
const alarmList = document.getElementById('alarm-list');

// Hapus alarm bawaan dummy (Event Delegation)
alarmList.addEventListener('click', (e) => {
    const btn = e.target.closest('button');
    if(btn && btn.classList.contains('del-btn')) {
        btn.parentElement.remove();
    }
});

addAlarmBtn.addEventListener('click', () => {
    if(!alarmTime.value) return;
    
    const li = document.createElement('li');
    
    const timeSpan = document.createElement('span');
    timeSpan.innerHTML = `<i class="fa-regular fa-clock text-accent"></i> &nbsp; ${alarmTime.value}`;
    
    const delBtn = document.createElement('button');
    delBtn.className = 'del-btn';
    delBtn.innerHTML = '<i class="fa-solid fa-trash"></i>';
    
    li.appendChild(timeSpan);
    li.appendChild(delBtn);
    
    alarmList.appendChild(li);
    alarmTime.value = '';
    
    // Animasi tambahan saat nambah list
    li.animate([
        { opacity: 0, transform: 'translateX(-20px)' },
        { opacity: 1, transform: 'translateX(0)' }
    ], { duration: 300, easing: 'ease-out' });
});

// --- Modals (User Manual & Dev Info) ---
const modalManual = document.getElementById('modal-manual');
const modalDev = document.getElementById('modal-dev');
const btnManual = document.getElementById('btn-manual');
const btnDev = document.getElementById('btn-dev');
const closeBtns = document.querySelectorAll('.close-btn');

btnManual.addEventListener('click', (e) => { 
    e.preventDefault(); 
    modalManual.classList.add('show'); 
});
btnDev.addEventListener('click', (e) => { 
    e.preventDefault(); 
    modalDev.classList.add('show'); 
});

closeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        modalManual.classList.remove('show');
        modalDev.classList.remove('show');
    });
});

window.addEventListener('click', (e) => {
    if(e.target === modalManual) modalManual.classList.remove('show');
    if(e.target === modalDev) modalDev.classList.remove('show');
});


// --- Map Initialization (Leaflet.js) ---
const initialLat = -6.200000;
const initialLng = 106.816666;

// Inisialisasi peta di koordinat (Jakarta)
const map = L.map('map').setView([initialLat, initialLng], 14);

// Tile Layer menggunakan base Carto Dark supaya cocok dengan tema dark dashboard
L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; OpenStreetMap &copy; CARTO'
}).addTo(map);

// Kustom Icon Marker
const customIcon = L.icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png', 
    iconSize: [38, 38],
    iconAnchor: [19, 38],
    popupAnchor: [0, -38]
});

const marker = L.marker([initialLat, initialLng], {icon: customIcon}).addTo(map)
    .bindPopup(`<strong style="color:#0f172a;">Device Location</strong><br>Last seen just now.`)
    .openPopup();

// --- Simulasi Pergerakan GPS Real-time ---
setInterval(() => {
    if(isConnected) {
        // Simulasi device berjalan-jalan secara random kecil
        const currentLatLng = marker.getLatLng();
        const randLat = (Math.random() - 0.5) * 0.0005;
        const randLng = (Math.random() - 0.5) * 0.0005;
        
        const newLat = currentLatLng.lat + randLat;
        const newLng = currentLatLng.lng + randLng;
        
        marker.setLatLng([newLat, newLng]);
        // Update popup info minimalis
        // Auto-pan map untuk mengikuti perangkat (opsional, biarkan pan terus)
        map.panTo([newLat, newLng], {animate: true, duration: 1.5});
    }
}, 5000);
