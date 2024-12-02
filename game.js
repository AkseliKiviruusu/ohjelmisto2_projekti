const playerName = document.getElementById('name')
document.getElementById('start').addEventListener('click', start)

let map;
let airportarray



function displayError(elementId, text) {
    let element = document.getElementById(elementId)
    element.innerHTML = text
    element.hidden = false
    setTimeout(() => {
        element.hidden = true
    }, 5000)
}

function toggleElementVisibility(elementId, state) {
    let element = document.getElementById(elementId)
    if(state) {
        element.classList.remove('hidden')
        element.classList.add('shown')
    } else {
        element.classList.add('hidden')
        element.classList.remove('shown')
    }
}

function start() {
    if(!playerName.value || playerName.value.length < 3 || playerName.value.length > 28) {
        displayError('login_error', 'Syötä nimi, joka on 3-28 merkkiä pitkä!')
    } else {
        async function get_airports(){
            try {
                const response = await fetch(`http://127.0.0.1:3000/player_name/${playerName.value}`)
                console.log(response)
                const airportarray = await response.json()
                console.log(airportarray)
                updateOptions(airportarray)
            } catch (error) {
                console.log(error)
            }
        }
        get_airports()
        toggleElementVisibility('login_panel', false)
        toggleElementVisibility('prompt_container', true)
    }
}

function mapPosition(latitude, longitude) {
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
}

//Asettaa kartan Helsinki-Vantaan lentokentälle
mapPosition(60.315369447382345, 24.945276215177994)

function updateStats(location, points, distance, souvenirs) {
    document.getElementById('location').innerHTML = location
    document.getElementById('points').innerHTML = points
    document.getElementById('distance').innerHTML = `${distance} km`
    document.getElementById('souvenirs').innerHTML = `${souvenirs}/7`
}

function updateOptions(airportArray) {
    for(let i = 0; i < 5; i++) {
        document.getElementById(`option_${i+1}`).firstElementChild.innerHTML = `${airportArray[i][0].airport}, ${airportArray[i][0].country}, ${airportArray[i][0].continent}`
    }
}

for(let i = 0; i < 5; i++) {
    document.getElementById(`option_${i+1}`).addEventListener('click', optionHandler)
}

function optionHandler(event) {
   // toggleElementVisibility('prompt_container', false)
    mapPosition(30, 30)
}