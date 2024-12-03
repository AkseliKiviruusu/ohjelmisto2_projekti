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




// Tulostauluko hakeminen ja näyttäminen modaalina, kun painetaan tulostaulukko vaihtoehtoa:




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

