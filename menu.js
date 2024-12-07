// Tarinan hakeminen ja näyttäminen modaalina, kun painetaan tarina vaihtoehtoa päävalikosta:
async function open_story(event) {
  let dialog_element = document.querySelector('dialog');
  dialog_element.showModal();
  event.preventDefault();
  let response = await fetch('http://127.0.0.1:3000/story');
  let json_data = await response.json();
  let story = json_data['story_text'];
  console.log(story)

  dialog_element.innerHTML = `<article>
                                <h2>PELIN TARINA</h2>
                                <p>${story}</p>
                                <button>SULJE</button>
                              </article>`;

  function close_story() {
    let dialog_element = document.querySelector('dialog');
    dialog_element.innerHTML = '';
    dialog_element.close();
  }

  document.querySelector('dialog button').addEventListener('click', close_story);

  }
console.log(document.querySelector('#story'));
document.querySelector('#story').addEventListener('click', open_story);




// Hakee Top 10 pelaajaa ja näyttää ne pelaajalle HTML:dialogi osiossa, joka avataan modaalina:
async function showScoreboard(event) {
  let dialog_element = document.querySelector('dialog');
  dialog_element.showModal();
  event.preventDefault();
  let scores_response = await fetch(
      'http://127.0.0.1:3000/scoreboard');
  let json_scores = await scores_response.json();
  console.log(json_scores);

  let scoreboard_container = document.createElement('div');
  scoreboard_container.id = 'scoreboard_container';
  scoreboard_container.innerHTML = `<article class="scoreboard_row"><p id='p_title'>#</p><p id="n_title">Nimi:</p><p id="s_title">Pisteet:</p></article>`
  for (let p = 0; p < json_scores.length; p++) {
    console.log(json_scores[p][0]);
    console.log(json_scores[p][1]);
    let row = document.createElement('article');
    row.classList.add('scoreboard_row');
    row.innerHTML = `<p class="placement">${p + 1}</p><p class="player_name">${json_scores[p][0]}</p><p class="player_score">${json_scores[p][1]}</p>`;
    scoreboard_container.appendChild(row);
  }

  function closeScoreboard() {
    dialog_element.innerHTML = '';
    dialog_element.close();
  }

  dialog_element.innerHTML += '<h2>TOP 10 PELAAJAA</h2>';
  dialog_element.appendChild(scoreboard_container)
  dialog_element.innerHTML += '<button>Sulje</button>';
  document.querySelector('dialog button').
      addEventListener('click', closeScoreboard);

}

document.querySelector('#scoreboard').addEventListener('click', showScoreboard);




// Pelin tausta tietojen näyttäminen modaalina, kun painetaan tiedot vaihtoehtoa:
function open_info() {
  let dialog_element = document.querySelector('dialog');
  dialog_element.showModal();

  dialog_element.innerHTML = `<article>
                                <h2>TIETOJA</h2>
                                <h4>Tekijät:</h4>
                                <p>Mikko Ilvonen</p>
                                <p>Oskari Jutila</p>
                                <p>Riikka Kautonen</p>
                                <p>Akseli Kiviruusu</p>
                                <p>Artem Poliakov</p>
                                <button>SULJE</button>
                              </article>`;

  function close_info() {
    let dialog_element = document.querySelector('dialog');
    dialog_element.innerHTML = '';
    dialog_element.close();
  }

  document.querySelector('dialog button').addEventListener('click', close_info);

  }
console.log(document.querySelector('#info'));
document.querySelector('#info').addEventListener('click', open_info);

