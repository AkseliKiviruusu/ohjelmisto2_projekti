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