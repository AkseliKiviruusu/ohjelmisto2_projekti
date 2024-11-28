const playerName = document.getElementById('name')
document.getElementById('start').addEventListener('click', start)

function displayError(errorParagraphId, text) {
    let paragraph = document.getElementById(errorParagraphId)
    paragraph.innerHTML = text
    paragraph.hidden = false
    setTimeout(() => {
        paragraph.hidden = true
    }, 5000)
}

function start() {
    if(!playerName.value || playerName.value.length < 3 || playerName.value.length > 28) {
        displayError('login_error', 'Syötä nimi joka 3-28 merkkiä pitkä')
    } else {
        console.log("pass")
        //document.getElementById('login_panel').hidden = true
    }
}

let map;
function mapPosition(latitude, longitude, markerText) {
    if(!map) {
        map = L.map('map').setView([latitude, longitude], 13)
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        }).addTo(map)
    } else {
        map.flyTo([latitude, longitude], 13, {
            animate: true,
            duration: 5,
            easeLinearity: 0.25
        })
    }
    if(markerText) {
        L.marker([latitude, longitude]).addTo(map)
            .bindPopup(markerText)
            .openPopup()
    }
}

//Asettaa kartan Helsinki-Vantaan lentokentälle
mapPosition(60.315369447382345, 24.945276215177994)

//Testilento
setTimeout(() => {
    mapPosition(30, 30, "katti")
}, 5000)