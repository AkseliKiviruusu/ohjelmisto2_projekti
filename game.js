const playerName = document.getElementById('name')
document.getElementById('start').addEventListener('click', start)

let map;
let airportArray

// Hakee ohjeet backendistä ja avaa ne modaalissa:
async function open_instructions(event) {
  event.preventDefault();
  const dialog_element = document.querySelector('dialog');
  dialog_element.showModal();
  let response = await fetch('http://127.0.0.1:3000/instructions');
  let json_data = await response.json();
  let instructions = json_data['instructions_text'];

  dialog_element.innerHTML = `<article>
                                    <h4>OHJEET:</h4>
                                    <p>${instructions}</p>
                                    <button>SULJE</button>
                                </article>`;

  function close_instructions() {
    let dialog_element = document.querySelector('dialog');
    dialog_element.innerHTML = '';
    dialog_element.close();
  }

  document.querySelector('dialog button').
      addEventListener('click', close_instructions);
}

// Lisätään ohjeiden avaus -funktio OHJEET valintaan:
document.querySelector('#instructions').
    addEventListener('click', open_instructions);

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
        async function getAirports(){
            try {
                const response = await fetch(`http://127.0.0.1:3000/player_name/${playerName.value}`)
                airportArray = await response.json()
                airportArray = airportArray.flat()
                updateOptions(airportArray)
            } catch (error) {
                console.log(error)
            }
        }
        getAirports()
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
        airportArray[i].id = `option_${i+1}`
        let element = document.getElementById(airportArray[i].id)
        element.firstElementChild.innerHTML = `${airportArray[i].airport}, ${airportArray[i].country}, ${airportArray[i].continent}`

    }
}

function reasdf() {
    element.addEventListener('mouseover', () => {
            element.textContent = `${airportArray[i].latitude_deg}, ${airportArray[i].longitude_deg}`
        })
        element.addEventListener('mouseout', () => {
            element.textContent = `${airportArray[i].airport}, ${airportArray[i].country}, ${airportArray[i].continent}`
        })
}

for(let i = 0; i < 5; i++) {
    document.getElementById(`option_${i+1}`).addEventListener('click', optionHandler)
}

function optionHandler(event) {
    let airfield = airportArray.find(airport => airport.id === event.currentTarget.id)
    toggleElementVisibility('prompt_container', false)
    mapPosition(airfield.latitude_deg, airfield.longitude_deg)
    game(airfield)
}

async function checkIfEnoughTrophies(){
    try {
        const response = await fetch(`http://127.0.0.1:3000/trophy_status`)
        return await response.json()
    } catch (error) {
        console.log(error)
    }
}

async function takeSouvenir(){
    try {
        const response = await fetch(`http://127.0.0.1:3000/trophy_updates`)
        return await response.json()
    } catch (error) {
        console.log(error)
    }
}

async function movePlayer(ident) {
    try {
        const response = await fetch(`http://127.0.0.1:3000/new_location/${ident}`)
        return await response.json()
    } catch (error) {
        console.log(error)
    }
}

async function getNewAirports() {
    try {
        const response = await fetch(`http://127.0.0.1:3000/5airports`)
        airportArray = await response.json()
        airportArray = airportArray.flat()
        updateOptions(airportArray)
    } catch (error) {
        console.log(error)
    }
}


function askAboutSouvenir(event) {
    return new Promise((resolve) => {
        if (!event) return
        if (event.target.id === 'takes_souvenir') {
            takeSouvenir().then(resolve)
        } else {
            resolve()
        }
        toggleElementVisibility('souvenir_question', false);
    })
}

async function game(airfield) {
     try {
        let movePlayerRes = await movePlayer(airfield.ident)
        document.getElementById('random_event').innerHTML = movePlayerRes[1]
        toggleElementVisibility('souvenir_question', true)

        const button = document.getElementById('takes_souvenir')
        async function handleSouvenirClick(event) {
            await askAboutSouvenir(event)
            let trophies = await checkIfEnoughTrophies()
            console.log(trophies)
            if (trophies.trophy_status) {
                 return alert('game over')
            }
            await getNewAirports()
            toggleElementVisibility('prompt_container', true)

            button.removeEventListener('click', handleSouvenirClick)
        }

        button.addEventListener('click', handleSouvenirClick)

    } catch (error) {
        console.log(error)
    }



}