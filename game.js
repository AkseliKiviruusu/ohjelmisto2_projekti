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

const playerName = document.getElementById('name');
document.getElementById('start').addEventListener('click', start);

let map;
let airportArray;

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
  let element = document.getElementById(elementId);
  element.innerHTML = text;
  element.hidden = false;
  setTimeout(() => {
    element.hidden = true;
  }, 5000);
}

function toggleElementVisibility(elementId, state) {
  let element = document.getElementById(elementId);
  if (state) {
    element.classList.remove('hidden');
    element.classList.add('shown');
  } else {
    element.classList.add('hidden');
    element.classList.remove('shown');
  }
}

function start() {
  if (!playerName.value || playerName.value.length < 3 ||
      playerName.value.length > 28) {
    displayError('login_error', 'Syötä nimi, joka on 3-28 merkkiä pitkä!');
  } else {
    async function getAirports() {
      try {
        const response = await fetch(
            `http://127.0.0.1:3000/player_name/${playerName.value}`);
        airportArray = await response.json();
        airportArray = airportArray.flat();
        updateOptions(airportArray);
      } catch (error) {
        console.log(error);
      }
    }

    getAirports();
    toggleElementVisibility('login_panel', false);
    toggleElementVisibility('prompt_container', true);
  }
}

function mapPosition(latitude, longitude) {
  if (!map) {
    map = L.map('map').setView([latitude, longitude], 3);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);
  } else {
    map.flyTo([latitude, longitude], 13, {
      animate: true,
      duration: 3.5,
      easeLinearity: 0.25,
    });
  }
}

//Asettaa kartan Helsinki-Vantaan lentokentälle
mapPosition(60.315369447382345, 24.945276215177994);
const markerGroup = L.layerGroup().addTo(map);
addMarkers([
  {
    text: 'Sinä',
    latitude: 60.315369447382345,
    longitude: 24.945276215177994,
    current: true,
  }]);

// Hakee päivitetyt pisteet, matkan ja matkamuistot Pythonista ja pävittää sivun Peliteidot laatikon osiot (sijaintia lukuunottamatta):
async function updateStats() {
  let response_location = await fetch('http://127.0.0.1:3000/location_name');
  let json_location = await response_location.json();
  let location = json_location['location_name'];

  let response_points = await fetch('http://127.0.0.1:3000/points');
  let json_points = await response_points.json();
  let points = json_points['current_points'];

  let response_distance = await fetch('http://127.0.0.1:3000/distance');
  let json_distance = await response_distance.json();
  let distance = json_distance['travelled_distance'];

  let response_trophies = await fetch('http://127.0.0.1:3000/souvenirs');
  let json_trophies = await response_trophies.json();
  let souvenirs = json_trophies['trophies_collected'];

  document.getElementById('location').innerHTML = location;
  document.getElementById('points').innerHTML = points;
  document.getElementById(
      'distance').innerHTML = `${distance} km`;
  document.getElementById(
      'souvenirs').innerHTML = `${souvenirs}/7`;
}

function addMarkers(locations) {
  locations.forEach(location => {
    const {latitude, longitude, text, current} = location;
    let color = current && 'green' || 'orange';
    markerGroup.addLayer(L.marker([latitude, longitude], {
      icon: L.divIcon({
        className: 'custom-label',
        html: `
                <div class="marker-container">
                    <div class="marker-dot" style="background-color: ${color};"></div>
                    <div class="marker-label">${text}</div>
                </div>
            `,
        iconSize: [0, 0],
      }),
    }).addTo(map));
  });
}

function updateOptions(airportArray) {
  let locationArray = [];
  for (let i = 0; i < 5; i++) {
    locationArray.push({
      text: airportArray[i].airport,
      latitude: airportArray[i].latitude_deg,
      longitude: airportArray[i].longitude_deg,
    });

    airportArray[i].id = `option_${i + 1}`;
    let element = document.getElementById(airportArray[i].id);
    element.firstElementChild.innerHTML = `${airportArray[i].airport}, ${airportArray[i].country}, ${airportArray[i].continent}`;

    //Alempi näyttää koordinaatit hoveratessa, mutta lienee tarpeeton jos vaihtoehtojen sijainnit näytetään kartalla
    element.addEventListener('mouseover', () => {
      //element.firstElementChild.textContent = `${airportArray[i].latitude_deg}, ${airportArray[i].longitude_deg}`
    });
    element.addEventListener('mouseout', () => {
      //element.firstElementChild.textContent = `${airportArray[i].airport}, ${airportArray[i].country}, ${airportArray[i].continent}`
    });
  }
  addMarkers(locationArray);
  map.flyTo(map.getCenter(), 1, {
    animate: true,
    duration: 2,
  });
}

for (let i = 0; i < 5; i++) {
  document.getElementById(`option_${i + 1}`).
      addEventListener('click', optionHandler);
}

function optionHandler(event) {
  let airfield = airportArray.find(
      airport => airport.id === event.currentTarget.id);
  toggleElementVisibility('prompt_container', false);
  mapPosition(airfield.latitude_deg, airfield.longitude_deg);
  setTimeout(() => {
    markerGroup.clearLayers();
    addMarkers([
      {
        text: 'Sinä',
        latitude: airfield.latitude_deg,
        longitude: airfield.longitude_deg,
        current: true,
      }]);
    game(airfield);
  }, 500);
}

async function checkIfEnoughTrophies() {
  try {
    const response = await fetch(`http://127.0.0.1:3000/trophy_status`);
    return await response.json();
  } catch (error) {
    console.log(error);
  }
}

async function takeSouvenir() {
  try {
    const response = await fetch(`http://127.0.0.1:3000/trophy_updates`);
    return await response.json();
  } catch (error) {
    console.log(error);
  }
}

async function movePlayer(ident) {
  try {
    const response = await fetch(`http://127.0.0.1:3000/new_location/${ident}`);
    return await response.json();
  } catch (error) {
    console.log(error);
  }
}

async function getNewAirports() {
  try {
    const response = await fetch(`http://127.0.0.1:3000/5airports`);
    airportArray = await response.json();
    airportArray = airportArray.flat();
    updateOptions(airportArray);
  } catch (error) {
    console.log(error);
  }
}

// Ota painikkeen toiminta:
async function takeButtonClick(event) {
  event.preventDefault();
  let trophy_points = await takeSouvenir();
  await updateStats();
  toggleElementVisibility('souvenir_question', false);
  toggleElementVisibility('souvenir_check', true);
  document.querySelector(
      '#souvenir_text').innerHTML = `Otit kohteesta matkamuiston!`;
  document.querySelector('#souvenier_points').innerHTML = `Sait matkamuistosta ${trophy_points} pistettä`;
  const take_button = document.getElementById('takes_souvenir');
  const leave_button = document.getElementById('leaves_souvenir');
  take_button.removeEventListener('click', takeButtonClick);
  leave_button.removeEventListener('click', leaveButtonClick);
}

// Jätä-painikkeen toiminta:
async function leaveButtonClick(event) {
  toggleElementVisibility('souvenir_question', false);
  toggleElementVisibility('souvenir_check', true);
  document.querySelector(
      '#souvenir_text').innerHTML = `Et ottanut kohteesta matkamuistoa.`;
  const take_button = document.getElementById('takes_souvenir');
  const leave_button = document.getElementById('leaves_souvenir');
  take_button.removeEventListener('click', takeButtonClick);
  leave_button.removeEventListener('click', leaveButtonClick);
}

// Laksee lopulliset pisteet ja päivittää tietokannan scoreboardin:
async function getFinalPoints() {
  try {
    const response = await fetch(`http://127.0.0.1:3000/final_points`);
    return await response.json();
  } catch (error) {
    console.log(error);
  }
}

// Hakee pelaajan kulkeman matkan:
async function getFinalDistance() {
  try {
    const response = await fetch(`http://127.0.0.1:3000/distance`);
    return await response.json();
  } catch (error) {
    console.log(error);
  }
}

// Tsekkaa jatketaanko peliä:
async function checkGameLoop(event) {
  let trophies = await checkIfEnoughTrophies();
  console.log(trophies);

  // Jos kaikki matkamuistot on kerätty:
  if (trophies['trophy_status'] === true) {
    const response_f_points_a = await fetch('http://127.0.0.1:3000/points');
    const json_f_points_a = await response_f_points_a.json();
    const final_points_a = json_f_points_a['current_points'];
    const final_points_b = await getFinalPoints();
    const final_distance = await getFinalDistance();

    document.querySelector('#score_before').innerHTML = final_points_a;
    document.querySelector(
        '#final_distance').innerHTML = final_distance['travelled_distance'];
    document.querySelector(
        '#final_score').innerHTML = final_points_b['final_points'];

    toggleElementVisibility('souvenir_check', false);
    await toggleElementVisibility('gameover_container', true);
    await updateStats();

    // Jos matkamuistoja puuttuu:
  } else if (trophies['trophy_status'] === false) {
    await getNewAirports();
    toggleElementVisibility('souvenir_check', false);
    toggleElementVisibility('prompt_container', true);
  }

}

// Pelin pääfunktio:
async function game(airfield) {
  try {
    let movePlayerRes = await movePlayer(airfield.ident);
    await updateStats();
    document.getElementById('weather_desc').innerHTML = movePlayerRes[0];
    document.getElementById('random_event').innerHTML = movePlayerRes[1];
    document.getElementById(
        'event_points').innerHTML = `${movePlayerRes[6]} pistettä.`;
    document.getElementById(
        'weather_points').innerHTML = `${movePlayerRes[5]} pistettä.`;
    toggleElementVisibility('souvenir_question', true);

    const take_button = document.getElementById('takes_souvenir');
    const leave_button = document.getElementById('leaves_souvenir');

    take_button.addEventListener('click', takeButtonClick);
    leave_button.addEventListener('click', leaveButtonClick);

    let loop_check_button = document.querySelector('#loop_check');

    loop_check_button.addEventListener('click', checkGameLoop);

  } catch (error) {
    console.log(error);
  }

}